import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getOrderFromSession, orderCookieName } from "@/lib/commerce/order-access";
import { createEbookDownloadUrl } from "@/lib/commerce/ebook-storage";
import { enforceRateLimit } from "@/lib/commerce/rate-limit";

export async function GET(request: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  if (!await enforceRateLimit({ scope: "ebook-download", request, max: 20, windowMs: 60_000 })) return new NextResponse("Too many requests", { status: 429 });
  const orderNumber = (await params).orderNumber;
  const order = await getOrderFromSession(orderNumber, (await cookies()).get(orderCookieName(orderNumber))?.value);
  if (!order || order.format !== "EBOOK" || order.paymentStatus !== "PAID") return new NextResponse("Not found", { status: 404 });
  try {
    return NextResponse.redirect(await createEbookDownloadUrl(), { status: 302 });
  } catch {
    return new NextResponse("Digital delivery is temporarily unavailable.", { status: 503 });
  }
}
