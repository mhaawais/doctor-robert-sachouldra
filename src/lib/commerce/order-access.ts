import "server-only";
import { db } from "@/lib/db";
import { hashSecret, matchesSecret } from "./security";

export async function getAuthorizedOrder(orderNumber: string, token: string | undefined) {
  if (!token || token.length < 40) return null;
  const order = await db.order.findUnique({ where: { orderNumber } });
  if (!order || !matchesSecret(token, order.customerAccessTokenHash)) return null;
  return order;
}

export const orderCookieName = (orderNumber: string) => `order_access_${orderNumber}`;

export async function getOrderFromSession(orderNumber: string, sessionToken: string | undefined) {
  if (!sessionToken || sessionToken.length < 40) return null;
  const session = await db.orderAccessSession.findUnique({ where: { tokenHash: hashSecret(sessionToken) }, include: { order: true } });
  if (!session || session.expiresAt <= new Date() || session.order.orderNumber !== orderNumber || !matchesSecret(sessionToken, session.tokenHash)) return null;
  return session.order;
}
