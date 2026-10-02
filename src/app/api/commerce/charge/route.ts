import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chargeSchema } from "@/lib/commerce/validation";
import { checkoutEnabled, directFormat } from "@/lib/commerce/config";
import { costCalculation, createPrintJob, LuluRequestError } from "@/lib/commerce/lulu";
import { createSquarePayment } from "@/lib/commerce/square";
import { sendOrderConfirmation } from "@/lib/commerce/email";
import { enforceRateLimit } from "@/lib/commerce/rate-limit";
import { hashSecret, matchesSecret, newSecret, orderAccessUrl } from "@/lib/commerce/security";

const orderNumber = () => `RS-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomUUID().slice(0, 8).toUpperCase()}`;

export async function POST(request: Request) {
  if (!await enforceRateLimit({ scope: "charge", request, max: 8, windowMs: 60_000 })) return NextResponse.json({ ok: false, error: "Too many payment attempts. Please wait and try again." }, { status: 429 });
  if (!checkoutEnabled()) return NextResponse.json({ ok: false, error: "Direct checkout is not configured yet." }, { status: 503 });
  const parsed = chargeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Please check your checkout details." }, { status: 422 });
  const input = parsed.data;
  const existing = await db.order.findUnique({ where: { paymentKey: input.idempotencyKey } });
  if (existing) return NextResponse.json({ ok: true, orderNumber: existing.orderNumber, status: existing.paymentStatus });
  try {
    const format = directFormat(input.format);
    const quote = await costCalculation(input, input.shippingMethod);
    const shippingAmount = Math.round(Number(quote.shipping_cost?.total_cost_incl_tax ?? 0) * 100);
    const totalAmount = format.priceCents * input.quantity + shippingAmount;
    const number = input.retryOrderNumber ?? orderNumber();
    const accessToken = input.orderAccessToken ?? newSecret();
    let order;
    if (input.retryOrderNumber) {
      const previous = await db.order.findUnique({ where: { orderNumber: input.retryOrderNumber } });
      if (!previous || !input.orderAccessToken || !matchesSecret(input.orderAccessToken, previous.customerAccessTokenHash) || previous.paymentStatus !== "FAILED") throw new Error("This payment retry is not available.");
      order = await db.order.update({ where: { id: previous.id }, data: { paymentKey: input.idempotencyKey, paymentStatus: "PENDING_PAYMENT", unitPrice: format.priceCents, shippingAmount, totalAmount, shippingMethod: input.shippingMethod } });
    } else try { order = await db.order.create({ data: { orderNumber: number, paymentKey: input.idempotencyKey, customerAccessTokenHash: hashSecret(accessToken), email: input.email, customerName: `${input.firstName} ${input.lastName}`, phone: input.phone || null, format: input.format, quantity: input.quantity, unitPrice: format.priceCents, shippingAmount, totalAmount, shippingMethod: input.shippingMethod, addressLine1: input.address1, addressLine2: input.address2 || null, city: input.city, stateProvince: input.state, postalCode: input.postalCode, country: input.country } }); }
    catch { const duplicate = await db.order.findUnique({ where: { paymentKey: input.idempotencyKey } }); if (duplicate) return NextResponse.json({ ok: true, orderNumber: duplicate.orderNumber, status: duplicate.paymentStatus }); throw new Error("We could not create the order."); }
    let payment;
    let attemptId: string | undefined;
    try {
      const attempt = await db.paymentAttempt.create({ data: { orderId: order.id, attemptTokenHash: hashSecret(input.idempotencyKey), squareIdempotencyKey: randomUUID() } });
      attemptId = attempt.id;
      payment = await createSquarePayment({ sourceId: input.paymentToken, amountCents: totalAmount, idempotencyKey: attempt.squareIdempotencyKey, orderNumber: number, email: input.email });
      if (payment.status !== "COMPLETED") throw new Error("Square did not complete the payment.");
      await db.$transaction([db.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID", squarePaymentId: payment.id, squareOrderId: payment.order_id } }), db.paymentAttempt.update({ where: { id: attempt.id }, data: { status: "SUCCEEDED", squarePaymentId: payment.id } })]);
    } catch (error) {
      await db.$transaction([db.order.update({ where: { id: order.id }, data: { paymentStatus: "FAILED" } }), ...(attemptId ? [db.paymentAttempt.update({ where: { id: attemptId }, data: { status: "FAILED", failureReason: error instanceof Error ? error.message.slice(0, 500) : "Payment provider error" } })] : [])]);
      return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Square could not process the payment.", retryOrderNumber: order.orderNumber, orderAccessToken: accessToken }, { status: 402 });
    }
    try {
      const printJob = await createPrintJob({ ...input, orderNumber: number });
      const luluPrintJobId = printJob.id ?? printJob.print_job?.id;
      const luluStatus = typeof printJob.status === "string" ? printJob.status : printJob.status?.name ?? "SUBMITTED";
      await db.order.update({ where: { id: order.id }, data: { fulfillmentStatus: "FULFILLMENT_SUBMITTED", luluPrintJobId: luluPrintJobId == null ? null : String(luluPrintJobId), luluStatus } });
    } catch (error) {
      const diagnostic = error instanceof LuluRequestError ? error.diagnostic : { operation: "POST /print-jobs/", status: 0, detail: "Unexpected provider failure" };
      console.error("Lulu fulfillment submission failed.", { orderNumber: number, operation: diagnostic.operation, status: diagnostic.status, detail: diagnostic.detail, podPackageId: format.podPackageId, pageCount: format.pageCount, pdfSources: { interiorConfigured: Boolean(format.interiorUrl), coverConfigured: Boolean(format.coverUrl), providerValidation: diagnostic.detail && /(interior|cover|pdf|source_url)/i.test(diagnostic.detail) ? "reported by Lulu" : "not reported by Lulu" } });
      await db.order.update({ where: { id: order.id }, data: { fulfillmentStatus: "FULFILLMENT_FAILED" } });
    }
    const statusUrl = orderAccessUrl(number, accessToken);
    void sendOrderConfirmation({ email: input.email, customerName: `${input.firstName} ${input.lastName}`, orderNumber: number, format: input.format, quantity: input.quantity, totalAmount, shippingMethod: input.shippingMethod, statusUrl });
    return NextResponse.json({ ok: true, orderNumber: number, orderAccessToken: accessToken });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "We could not complete your order." }, { status: 400 });
  }
}
