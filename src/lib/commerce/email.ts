import "server-only";

import { createHmac } from "crypto";
import type { Order, Prisma, TransactionalEmail } from "@prisma/client";
import { db } from "@/lib/db";
import { hashSecret, orderAccessUrl, safeTrackingUrl } from "@/lib/commerce/security";

type DbClient = Prisma.TransactionClient | typeof db;
type EmailPayload = { customerName?: string; format?: string; quantity?: number; totalAmount?: number; shippingMethod?: string; trackingNumber?: string | null; trackingUrl?: string | null; fulfillmentStatus?: string };
type OutboundEmail = { subject: string; text: string; html: string };

const MAX_ATTEMPTS = 8;
const LOCK_TIMEOUT_MS = 15 * 60_000;
const ACCESS_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

function escapeHtml(value: string) { return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character); }
function retryDelayMs(attempt: number) { return Math.min(6 * 60 * 60_000, 60_000 * 2 ** Math.max(0, attempt - 1)); }
function payloadForOrder(order: Order): EmailPayload { return { customerName: order.customerName, format: order.format, quantity: order.quantity, totalAmount: order.totalAmount, shippingMethod: order.shippingMethod, trackingNumber: order.trackingNumber, trackingUrl: safeTrackingUrl(order.trackingUrl ?? undefined), fulfillmentStatus: order.fulfillmentStatus }; }

export async function enqueuePaidOrderEmail(client: DbClient, order: Order) {
  const eventKey = `order:${order.id}:paid`;
  return client.transactionalEmail.upsert({ where: { eventKey }, update: {}, create: { eventKey, eventType: "ORDER_PAID", recipient: order.email, payload: payloadForOrder(order), orderId: order.id } });
}

export async function enqueueOrderReceivedEmail(client: DbClient, order: Order) {
  const eventKey = `order:${order.id}:received`;
  return client.transactionalEmail.upsert({ where: { eventKey }, update: {}, create: { eventKey, eventType: "ORDER_RECEIVED", recipient: order.email, payload: payloadForOrder(order), orderId: order.id } });
}

export async function enqueuePaymentFailedEmail(client: DbClient, order: Order, paymentAttemptId: string) {
  const eventKey = `order:${order.id}:payment-failed:${paymentAttemptId}`;
  return client.transactionalEmail.upsert({ where: { eventKey }, update: {}, create: { eventKey, eventType: "PAYMENT_FAILED", recipient: order.email, payload: payloadForOrder(order), orderId: order.id } });
}

export async function enqueueFulfillmentSubmittedEmail(client: DbClient, order: Order) {
  const eventKey = `order:${order.id}:lulu-fulfillment-submitted`;
  return client.transactionalEmail.upsert({ where: { eventKey }, update: {}, create: { eventKey, eventType: "LULU_FULFILLMENT_SUBMITTED", recipient: order.email, payload: payloadForOrder(order), orderId: order.id } });
}

export async function enqueueShippedOrderEmail(client: DbClient, order: Order) {
  const eventKey = `order:${order.id}:shipped`;
  return client.transactionalEmail.upsert({ where: { eventKey }, update: {}, create: { eventKey, eventType: "ORDER_SHIPPED", recipient: order.email, payload: payloadForOrder(order), orderId: order.id } });
}

export async function enqueueFulfillmentAttentionEmail(client: DbClient, order: Order) {
  const recipient = process.env.CONTACT_RECIPIENT_EMAIL?.trim();
  if (!recipient) return null;
  const eventKey = `order:${order.id}:fulfillment-attention:${order.fulfillmentStatus}`;
  return client.transactionalEmail.upsert({ where: { eventKey }, update: {}, create: { eventKey, eventType: "ADMIN_FULFILLMENT_ATTENTION", recipient, payload: payloadForOrder(order), orderId: order.id } });
}

function emailAccessToken(eventKey: string) {
  const secret = process.env.ORDER_EMAIL_ACCESS_SECRET;
  if (!secret) throw new EmailError("Order email access is not configured.", false);
  return createHmac("sha256", secret).update(`order-email:${eventKey}`).digest("base64url");
}

async function orderLink(event: TransactionalEmail, order: Order) {
  const token = emailAccessToken(event.eventKey);
  await db.orderAccessSession.upsert({ where: { tokenHash: hashSecret(token) }, update: { expiresAt: new Date(Date.now() + ACCESS_DURATION_MS) }, create: { orderId: order.id, tokenHash: hashSecret(token), expiresAt: new Date(Date.now() + ACCESS_DURATION_MS) } });
  return orderAccessUrl(order.orderNumber, token);
}

function renderEmail(event: TransactionalEmail, order: Order, statusUrl: string | null): OutboundEmail {
  const payload = event.payload as EmailPayload;
  const name = payload.customerName || order.customerName;
  const format = payload.format || order.format;
  const quantity = payload.quantity ?? order.quantity;
  const total = ((payload.totalAmount ?? order.totalAmount) / 100).toFixed(2);
  const trackingUrl = safeTrackingUrl(payload.trackingUrl ?? undefined);
  if (event.eventType === "ORDER_RECEIVED") {
    return { subject: `We received your order · ${order.orderNumber}`, text: `Hello ${name},\n\nWe received your order request for Behind the Mask (${format}, quantity ${quantity}). Your payment is still being processed. We will send a separate confirmation as soon as payment is confirmed.\n\nSecure order page: ${statusUrl ?? "Available from your order confirmation page."}\n\nDr. Robert Books`, html: `<p>Hello ${escapeHtml(name)},</p><p>We received your order request for <strong>Behind the Mask</strong> (${escapeHtml(format)}, quantity ${quantity}).</p><p>Your payment is still being processed. We will send a separate confirmation as soon as payment is confirmed.</p>${statusUrl ? `<p><a href="${escapeHtml(statusUrl)}">Open your secure order page</a></p>` : ""}<p>Dr. Robert Books</p>` };
  }
  if (event.eventType === "ORDER_PAID") {
    const digital = format === "EBOOK";
    const action = digital ? "Your eBook is ready. Open your secure order page, then select Download eBook." : "Use your secure order page for the latest fulfillment and tracking updates.";
    return { subject: `Order confirmation · ${order.orderNumber}`, text: `Hello ${name},\n\nThank you for your order of Behind the Mask (${format}, quantity ${quantity}). Total paid: $${total} USD.\n\n${action}\n\nSecure order page: ${statusUrl ?? "Available from your order confirmation page."}\n\nDr. Robert Books`, html: `<p>Hello ${escapeHtml(name)},</p><p>Thank you for your order of <strong>Behind the Mask</strong> (${escapeHtml(format)}, quantity ${quantity}).</p><p><strong>Total paid:</strong> $${total} USD</p><p>${escapeHtml(action)}</p>${statusUrl ? `<p><a href="${escapeHtml(statusUrl)}">Open your secure order page</a></p>` : ""}<p>Dr. Robert Books</p>` };
  }
  if (event.eventType === "PAYMENT_FAILED") {
    return { subject: `Payment needs attention · ${order.orderNumber}`, text: `Hello ${name},\n\nWe could not confirm payment for your order of Behind the Mask. No payment confirmation was recorded.\n\nPlease return to checkout and try again, or review your secure order page for the latest status.\n\nSecure order page: ${statusUrl ?? "Available from your order confirmation page."}\n\nDr. Robert Books`, html: `<p>Hello ${escapeHtml(name)},</p><p>We could not confirm payment for your order of <strong>Behind the Mask</strong>. No payment confirmation was recorded.</p><p>Please return to checkout and try again, or review your secure order page for the latest status.</p>${statusUrl ? `<p><a href="${escapeHtml(statusUrl)}">Open your secure order page</a></p>` : ""}<p>Dr. Robert Books</p>` };
  }
  if (event.eventType === "LULU_FULFILLMENT_SUBMITTED") {
    return { subject: `Your book has entered fulfillment · ${order.orderNumber}`, text: `Hello ${name},\n\nYour paid order of Behind the Mask (${format}, quantity ${quantity}) has been accepted for fulfillment and is entering production. We will email you again when it ships.\n\nSecure order page: ${statusUrl ?? "Available from your order confirmation page."}\n\nDr. Robert Books`, html: `<p>Hello ${escapeHtml(name)},</p><p>Your paid order of <strong>Behind the Mask</strong> (${escapeHtml(format)}, quantity ${quantity}) has been accepted for fulfillment and is entering production.</p><p>We will email you again when it ships.</p>${statusUrl ? `<p><a href="${escapeHtml(statusUrl)}">Open your secure order page</a></p>` : ""}<p>Dr. Robert Books</p>` };
  }
  if (event.eventType === "ORDER_SHIPPED") {
    const tracking = trackingUrl ? `Track shipment: ${trackingUrl}` : payload.trackingNumber ? `Tracking number: ${payload.trackingNumber}` : "Tracking details will appear on your secure order page.";
    return { subject: `Your order has shipped · ${order.orderNumber}`, text: `Hello ${name},\n\nYour order of Behind the Mask has shipped.\n\n${tracking}\n\nSecure order page: ${statusUrl ?? "Available from your order confirmation page."}\n\nDr. Robert Books`, html: `<p>Hello ${escapeHtml(name)},</p><p>Your order of <strong>Behind the Mask</strong> has shipped.</p><p>${trackingUrl ? `<a href="${escapeHtml(trackingUrl)}">Track your shipment</a>` : escapeHtml(tracking)}</p>${statusUrl ? `<p><a href="${escapeHtml(statusUrl)}">Open your secure order page</a></p>` : ""}<p>Dr. Robert Books</p>` };
  }
  return { subject: `Fulfillment attention required · ${order.orderNumber}`, text: `Order ${order.orderNumber} requires fulfillment attention.\n\nFormat: ${format}\nQuantity: ${quantity}\nStatus: ${payload.fulfillmentStatus ?? order.fulfillmentStatus}\nCustomer: ${name} (${order.email})\n\nReview the order in the database/admin recovery workflow.`, html: `<p><strong>Fulfillment attention required</strong></p><p>Order: ${escapeHtml(order.orderNumber)}<br/>Format: ${escapeHtml(format)}<br/>Quantity: ${quantity}<br/>Status: ${escapeHtml(payload.fulfillmentStatus ?? order.fulfillmentStatus)}<br/>Customer: ${escapeHtml(name)} (${escapeHtml(order.email)})</p><p>Review the order in the database/admin recovery workflow.</p>` };
}

class EmailError extends Error { constructor(message: string, readonly transient: boolean) { super(message); } }

async function sendWithResend(event: TransactionalEmail, outbound: OutboundEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_EMAIL_FROM;
  if (!apiKey || !from) throw new EmailError("Transactional email provider is not configured.", false);
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": event.eventKey }, body: JSON.stringify({ from, to: [event.recipient], ...(process.env.ORDER_EMAIL_REPLY_TO ? { reply_to: process.env.ORDER_EMAIL_REPLY_TO } : {}), subject: outbound.subject, text: outbound.text, html: outbound.html }), cache: "no-store" });
  const body = await response.json().catch(() => null) as { id?: string } | null;
  if (!response.ok) throw new EmailError(`Email provider returned HTTP ${response.status}.`, response.status === 408 || response.status === 409 || response.status === 429 || response.status >= 500);
  return body?.id ?? null;
}

async function claimNextEmail() {
  const now = new Date();
  await db.transactionalEmail.updateMany({ where: { status: "PROCESSING", lockedAt: { lt: new Date(Date.now() - LOCK_TIMEOUT_MS) } }, data: { status: "PENDING", lockedAt: null, nextAttemptAt: now } });
  const candidate = await db.transactionalEmail.findFirst({ where: { status: "PENDING", nextAttemptAt: { lte: now } }, orderBy: { createdAt: "asc" } });
  if (!candidate) return null;
  const claimed = await db.transactionalEmail.updateMany({ where: { id: candidate.id, status: "PENDING", nextAttemptAt: { lte: now } }, data: { status: "PROCESSING", lockedAt: now, attempts: { increment: 1 }, lastError: null } });
  if (!claimed.count) return null;
  return db.transactionalEmail.findUnique({ where: { id: candidate.id }, include: { order: true } });
}

async function processEmail(event: TransactionalEmail & { order: Order }) {
  try {
    const statusUrl = event.eventType === "ADMIN_FULFILLMENT_ATTENTION" ? null : await orderLink(event, event.order);
    const providerMessageId = await sendWithResend(event, renderEmail(event, event.order, statusUrl));
    await db.transactionalEmail.update({ where: { id: event.id }, data: { status: "SENT", providerMessageId, sentAt: new Date(), lockedAt: null, lastError: null } });
    return "sent" as const;
  } catch (error) {
    const emailError = error instanceof EmailError ? error : new EmailError("Unexpected email delivery failure.", true);
    const exhausted = event.attempts >= MAX_ATTEMPTS || !emailError.transient;
    await db.transactionalEmail.update({ where: { id: event.id }, data: exhausted ? { status: "FAILED", lockedAt: null, lastError: emailError.message.slice(0, 500) } : { status: "PENDING", lockedAt: null, nextAttemptAt: new Date(Date.now() + retryDelayMs(event.attempts)), lastError: emailError.message.slice(0, 500) } });
    return exhausted ? "failed" as const : "retried" as const;
  }
}

export async function processTransactionalEmails(limit = 10) {
  let sent = 0; let retried = 0; let failed = 0;
  for (let index = 0; index < limit; index += 1) {
    const event = await claimNextEmail();
    if (!event) break;
    const result = await processEmail(event);
    if (result === "sent") sent += 1;
    if (result === "retried") retried += 1;
    if (result === "failed") failed += 1;
  }
  return { sent, retried, failed };
}
