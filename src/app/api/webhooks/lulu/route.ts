import { createHash, createHmac, timingSafeEqual } from "crypto";
import { Prisma, type FulfillmentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { enqueueFulfillmentAttentionEmail, enqueueShippedOrderEmail } from "@/lib/commerce/email";
import { safeTrackingUrl } from "@/lib/commerce/security";

type LuluTrackingLineItem = {
  tracking_id?: string;
  tracking_urls?: string[] | null;
  status?: { messages?: { tracking_id?: string; tracking_urls?: string[] | null } };
};

const fulfillmentStatusByLuluStatus: Record<string, FulfillmentStatus> = {
  UNPAID: "FULFILLMENT_SUBMITTED",
  CREATED: "FULFILLMENT_SUBMITTED",
  PRODUCTION_READY: "IN_PRODUCTION",
  IN_PRODUCTION: "IN_PRODUCTION",
  PRODUCTION_DELAYED: "IN_PRODUCTION",
  SHIPPED: "SHIPPED",
  CANCELLED: "CANCELLED",
  REJECTED: "FULFILLMENT_FAILED",
  FAILED: "FULFILLMENT_FAILED",
};

function trackingFromLulu(data: { tracking_number?: string; tracking_url?: string; line_items?: LuluTrackingLineItem[] }) {
  const lineItem = data.line_items?.find((item) => item.tracking_id || item.status?.messages?.tracking_id || item.tracking_urls?.length || item.status?.messages?.tracking_urls?.length);
  const trackingNumber = data.tracking_number || lineItem?.tracking_id || lineItem?.status?.messages?.tracking_id;
  const trackingUrl = safeTrackingUrl(data.tracking_url ?? lineItem?.tracking_urls?.[0] ?? lineItem?.status?.messages?.tracking_urls?.[0]);
  return { trackingNumber: trackingNumber || undefined, trackingUrl };
}

function isWebhookReplay(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") return false;
  const target = error.meta?.target;
  return Array.isArray(target) && target.includes("provider") && target.includes("externalId");
}

export async function POST(request: Request) {
  const raw = await request.text();
  const secret = process.env.LULU_WEBHOOK_SECRET;
  const signature = request.headers.get("lulu-hmac-sha256");
  const expected = secret ? createHmac("sha256", secret).update(raw).digest("hex") : "";
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = signature ? Buffer.from(signature) : null;
  if (!signatureBuffer || !expected || expectedBuffer.length !== signatureBuffer.length || !timingSafeEqual(expectedBuffer, signatureBuffer)) return new NextResponse("Invalid signature", { status: 401 });
  const event = JSON.parse(raw) as { id?: string; topic?: string; data?: { id?: string | number; status?: { name?: string } | string; tracking_number?: string; tracking_url?: string; line_items?: LuluTrackingLineItem[] } };
  const externalId = event.id ?? createHash("sha256").update(raw).digest("hex");
  const data = event.data;
  try {
    await db.$transaction(async (tx) => {
      // Keep the receipt, business state, and outbox records indivisible so a
      // failed transaction can be safely retried by Lulu.
      await tx.webhookEvent.create({ data: { provider: "lulu", externalId, payload: event } });
      if (!data?.id) return;

      const printJobId = String(data.id);
      const status = typeof data.status === "string" ? data.status : data.status?.name;
      const normalizedStatus = status?.trim().toUpperCase();
      const fulfillmentStatus = normalizedStatus ? fulfillmentStatusByLuluStatus[normalizedStatus] : undefined;
      // Keep authenticated unknown events for audit/replay protection, but do
      // not let an unfamiliar provider state alter known order state.
      if (!fulfillmentStatus) return;
      const tracking = trackingFromLulu(data);
      await tx.order.updateMany({ where: { luluPrintJobId: printJobId }, data: { luluStatus: status, fulfillmentStatus, ...(tracking.trackingNumber ? { trackingNumber: tracking.trackingNumber } : {}), ...(tracking.trackingUrl ? { trackingUrl: tracking.trackingUrl } : {}) } });
      const orders = await tx.order.findMany({ where: { luluPrintJobId: printJobId } });
      for (const order of orders) {
        if (fulfillmentStatus === "SHIPPED") await enqueueShippedOrderEmail(tx, order);
        if (fulfillmentStatus === "FULFILLMENT_FAILED" || fulfillmentStatus === "MANUAL_REVIEW") await enqueueFulfillmentAttentionEmail(tx, order);
      }
    });
  } catch (error) {
    if (isWebhookReplay(error)) return NextResponse.json({ ok: true, replay: true });
    throw error;
  }
  return NextResponse.json({ ok: true });
}
