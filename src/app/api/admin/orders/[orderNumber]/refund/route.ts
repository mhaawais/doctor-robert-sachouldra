import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { refundSquarePayment } from "@/lib/commerce/square";
import { enforceRateLimit } from "@/lib/commerce/rate-limit";
import { constantTimeEquals } from "@/lib/commerce/security";

function authorized(request: Request) { const expected = process.env.ADMIN_ORDER_RECOVERY_TOKEN; if (!expected) return false; const provided = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? ""; return constantTimeEquals(provided, expected); }

export async function POST(request: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  if (!await enforceRateLimit({ scope: "admin-refund", request, max: 5, windowMs: 60_000 })) return new NextResponse("Too many requests", { status: 429 });
  if (!authorized(request)) return new NextResponse("Unauthorized", { status: 401 });
  const order = await db.order.findUnique({ where: { orderNumber: (await params).orderNumber } });
  if (!order?.squarePaymentId || order.paymentStatus !== "PAID") return NextResponse.json({ ok: false, error: "This order has no refundable paid Square payment." }, { status: 409 });
  try { await refundSquarePayment(order.squarePaymentId, order.totalAmount, randomUUID()); await db.order.update({ where: { id: order.id }, data: { paymentStatus: "REFUNDED" } }); return NextResponse.json({ ok: true }); } catch (error) { return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Refund failed." }, { status: 502 }); }
}
