import { NextResponse } from "next/server";
import { exchangeOrderAccessToken, orderCookieName } from "@/lib/commerce/order-access";
import { newSecret } from "@/lib/commerce/security";

export async function GET(request: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  const orderNumber = (await params).orderNumber;
  const token = new URL(request.url).searchParams.get("token") ?? undefined;
  const sessionToken = newSecret();
  const order = await exchangeOrderAccessToken(orderNumber, token, sessionToken);
  if (!order) return new NextResponse("Not found", { status: 404 });
  const response = NextResponse.redirect(new URL(`/order/${orderNumber}`, request.url));
  response.cookies.set(orderCookieName(orderNumber), "", { httpOnly: true, secure: true, sameSite: "lax", path: `/order/${orderNumber}`, maxAge: 0 });
  response.cookies.set(orderCookieName(orderNumber), sessionToken, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 30 * 24 * 60 * 60 });
  return response;
}
