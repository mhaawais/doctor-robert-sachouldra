import "server-only";
import { db } from "@/lib/db";
import { hashSecret, matchesSecret, newSecret } from "./security";

/**
 * Exchanges either a one-time checkout token or an existing, expiring access
 * session token for a fresh browser session. Checkout tokens are consumed in
 * the same transaction as the new session so they cannot be replayed.
 */
export async function exchangeOrderAccessToken(orderNumber: string, token: string | undefined, sessionToken: string) {
  if (!token || token.length < 40 || sessionToken.length < 40) return null;

  const tokenHash = hashSecret(token);
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { orderNumber } });
    if (order && matchesSecret(token, order.customerAccessTokenHash)) {
      // customerAccessTokenHash is intentionally non-nullable. Replacing it
      // with a random, unrecoverable hash consumes the checkout token without
      // requiring a schema migration or retaining a reusable bearer token.
      const consumed = await tx.order.updateMany({
        where: { id: order.id, customerAccessTokenHash: tokenHash },
        data: { customerAccessTokenHash: hashSecret(newSecret()) },
      });
      if (!consumed.count) return null;
      await tx.orderAccessSession.create({
        data: { orderId: order.id, tokenHash: hashSecret(sessionToken), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      });
      await tx.orderAccessSession.deleteMany({ where: { orderId: order.id, expiresAt: { lt: new Date() } } });
      return order;
    }

    // Email links and existing browser sessions are already expiry-bound
    // OrderAccessSession records. They remain valid without reviving a
    // consumed original checkout token.
    const session = await tx.orderAccessSession.findUnique({ where: { tokenHash }, include: { order: true } });
    if (!session || session.expiresAt <= new Date() || session.order.orderNumber !== orderNumber || !matchesSecret(token, session.tokenHash)) return null;
    await tx.orderAccessSession.create({
      data: { orderId: session.orderId, tokenHash: hashSecret(sessionToken), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    });
    await tx.orderAccessSession.deleteMany({ where: { orderId: session.orderId, expiresAt: { lt: new Date() } } });
    return session.order;
  });
}

export const orderCookieName = (orderNumber: string) => `order_access_${orderNumber}`;

export async function getOrderFromSession(orderNumber: string, sessionToken: string | undefined) {
  if (!sessionToken || sessionToken.length < 40) return null;
  const session = await db.orderAccessSession.findUnique({ where: { tokenHash: hashSecret(sessionToken) }, include: { order: true } });
  if (!session || session.expiresAt <= new Date() || session.order.orderNumber !== orderNumber || !matchesSecret(sessionToken, session.tokenHash)) return null;
  return session.order;
}
