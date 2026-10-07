import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function validSignature(raw: string, signature: string | null) {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!key || !signature) return false;
  const notificationUrl = process.env.SQUARE_WEBHOOK_NOTIFICATION_URL;
  if (!notificationUrl) return false;
  const expected = createHmac("sha256", key).update(notificationUrl + raw).digest("base64");
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  return expectedBuffer.length === signatureBuffer.length && timingSafeEqual(expectedBuffer, signatureBuffer);
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (!validSignature(raw, request.headers.get("x-square-hmacsha256-signature"))) return new NextResponse("Invalid signature", { status: 401 });
  let event: { event_id: string; type: string; data?: { object?: { payment?: { id: string; status: string }; refund?: { id: string; payment_id: string; status: string } } } };
  try { event = JSON.parse(raw); } catch { return new NextResponse("Invalid payload", { status: 400 }); }
  try { await db.webhookEvent.create({ data: { provider: "square", externalId: event.event_id, payload: event } }); } catch { return NextResponse.json({ ok: true, replay: true }); }
  if (!["payment.created", "payment.updated", "refund.created", "refund.updated"].includes(event.type)) return NextResponse.json({ ok: true, ignored: true });
  const payment = event.data?.object?.payment;
  if (payment?.id && payment.status === "COMPLETED") await db.order.updateMany({ where: { squarePaymentId: payment.id, paymentStatus: { not: "REFUNDED" } }, data: { paymentStatus: "PAID" } });
  if (payment?.id && ["FAILED", "CANCELED"].includes(payment.status)) await db.order.updateMany({ where: { squarePaymentId: payment.id, paymentStatus: { notIn: ["PAID", "REFUNDED"] } }, data: { paymentStatus: "FAILED" } });
  const refund = event.data?.object?.refund;
  if (refund?.payment_id && ["COMPLETED", "PENDING"].includes(refund.status)) await db.order.updateMany({ where: { squarePaymentId: refund.payment_id }, data: { paymentStatus: refund.status === "COMPLETED" ? "REFUNDED" : "PAID" } });
  return NextResponse.json({ ok: true });
}
