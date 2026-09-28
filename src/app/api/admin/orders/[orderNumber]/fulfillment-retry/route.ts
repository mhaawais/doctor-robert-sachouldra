import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createPrintJob } from "@/lib/commerce/lulu";
import { reconcilePrintJob } from "@/lib/commerce/lulu";
import { enforceRateLimit } from "@/lib/commerce/rate-limit";
import { constantTimeEquals } from "@/lib/commerce/security";

function authorized(request: Request) { const expected = process.env.ADMIN_ORDER_RECOVERY_TOKEN; if (!expected) return false; const provided = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? ""; return constantTimeEquals(provided, expected); }

export async function POST(request: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  if (!await enforceRateLimit({ scope: "admin-fulfillment-retry", request, max: 5, windowMs: 60_000 })) return new NextResponse("Too many requests", { status: 429 });
  if (!authorized(request)) return new NextResponse("Unauthorized", { status: 401 });
  const order = await db.order.findUnique({ where: { orderNumber: (await params).orderNumber } });
  if (!order) return new NextResponse("Not found", { status: 404 });
  if (order.paymentStatus !== "PAID" || order.fulfillmentStatus !== "FULFILLMENT_FAILED" || order.luluPrintJobId) return NextResponse.json({ ok: false, error: "This order is not eligible for a safe fulfillment retry." }, { status: 409 });
  try {
    const reconciled = await reconcilePrintJob(order.orderNumber);
    if (reconciled === "unknown") { await db.order.update({ where: { id: order.id }, data: { fulfillmentStatus: "MANUAL_REVIEW" } }); return NextResponse.json({ ok: false, error: "Lulu outcome could not be confirmed; the order requires manual review." }, { status: 409 }); }
    if (reconciled) { await db.order.update({ where: { id: order.id }, data: { fulfillmentStatus: "FULFILLMENT_SUBMITTED", luluPrintJobId: reconciled.id, luluStatus: reconciled.status ?? "SUBMITTED" } }); return NextResponse.json({ ok: true, reconciled: true }); }
    const printJob = await createPrintJob({ firstName: order.customerName.split(" ")[0] ?? order.customerName, lastName: order.customerName.split(" ").slice(1).join(" "), email: order.email, phone: order.phone ?? "", address1: order.addressLine1, address2: order.addressLine2 ?? "", city: order.city, state: order.stateProvince, postalCode: order.postalCode, country: order.country, format: order.format, quantity: order.quantity, shippingMethod: order.shippingMethod, orderNumber: order.orderNumber });
    await db.order.update({ where: { id: order.id }, data: { fulfillmentStatus: "FULFILLMENT_SUBMITTED", luluPrintJobId: printJob.id ?? printJob.print_job?.id, luluStatus: printJob.status ?? "SUBMITTED" } });
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Lulu submission failed." }, { status: 502 }); }
}
