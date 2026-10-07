import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthorizedOrder, orderCookieName } from "@/lib/commerce/order-access";
import { hashSecret, newSecret } from "@/lib/commerce/security";

export async function GET(request: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  const orderNumber = (await params).orderNumber;
  const token = new URL(request.url).searchParams.get("token") ?? undefined;
  const order = await getAuthorizedOrder(orderNumber, token);
  if (!order) return new NextResponse("Not found", { status: 404 });
  const sessionToken = newSecret();
  await db.$transaction([db.orderAccessSession.create({ data: { orderId: order.id, tokenHash: hashSecret(sessionToken), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } }), db.orderAccessSession.deleteMany({ where: { orderId: order.id, expiresAt: { lt: new Date() } } })]);
  const response = NextResponse.redirect(new URL(`/order/${orderNumber}`, request.url));
  response.cookies.set(orderCookieName(orderNumber), "", { httpOnly: true, secure: true, sameSite: "lax", path: `/order/${orderNumber}`, maxAge: 0 });
  response.cookies.set(orderCookieName(orderNumber), sessionToken, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 30 * 24 * 60 * 60 });
  return response;
}
