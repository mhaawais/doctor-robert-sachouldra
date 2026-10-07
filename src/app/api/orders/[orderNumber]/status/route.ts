import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getOrderFromSession, orderCookieName } from "@/lib/commerce/order-access";
import { enforceRateLimit } from "@/lib/commerce/rate-limit";

export async function GET(request: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  if (!await enforceRateLimit({ scope: "order-status", request, max: 60, windowMs: 60_000 })) return new NextResponse("Too many requests", { status: 429 });
  const orderNumber = (await params).orderNumber;
  const order = await getOrderFromSession(orderNumber, (await cookies()).get(orderCookieName(orderNumber))?.value);
  if (!order) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json({
    ok: true,
    order: {
      format: order.format,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      luluStatus: order.luluStatus,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      ebookDownloadUsed: Boolean(order.ebookDownloadConsumedAt),
    },
  }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}
