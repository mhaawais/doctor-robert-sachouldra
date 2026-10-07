import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getOrderFromSession, orderCookieName } from "@/lib/commerce/order-access";
import { retrieveEbookPdf } from "@/lib/commerce/ebook-storage";
import { enforceRateLimit } from "@/lib/commerce/rate-limit";

export async function GET(request: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  if (!await enforceRateLimit({ scope: "ebook-download", request, max: 20, windowMs: 60_000 })) return new NextResponse("Too many requests", { status: 429 });
  const orderNumber = (await params).orderNumber;
  const order = await getOrderFromSession(orderNumber, (await cookies()).get(orderCookieName(orderNumber))?.value);
  if (!order || order.format !== "EBOOK" || order.paymentStatus !== "PAID") return new NextResponse("Not found", { status: 404 });
  if (order.ebookDownloadConsumedAt) return new NextResponse("This eBook download has already been used.", { status: 410 });
  try {
    const pdf = await retrieveEbookPdf();
    const claim = await db.order.updateMany({ where: { id: order.id, ebookDownloadConsumedAt: null }, data: { ebookDownloadConsumedAt: new Date() } });
    if (claim.count !== 1) return new NextResponse("This eBook download has already been used.", { status: 410 });
    return new NextResponse(pdf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": 'attachment; filename="behind-the-mask-ebook.pdf"', "Cache-Control": "private, no-store, max-age=0", "Referrer-Policy": "no-referrer" } });
  } catch {
    return new NextResponse("Digital delivery is temporarily unavailable.", { status: 503 });
  }
}
