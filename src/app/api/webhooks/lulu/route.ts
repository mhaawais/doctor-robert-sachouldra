import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { safeTrackingUrl } from "@/lib/commerce/security";

export async function POST(request: Request) {
  const raw = await request.text();
  const secret = process.env.LULU_WEBHOOK_SECRET;
  const signature = request.headers.get("lulu-hmac-sha256");
  const expected = secret ? createHmac("sha256", secret).update(raw).digest("hex") : "";
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = signature ? Buffer.from(signature) : null;
  if (!signatureBuffer || !expected || expectedBuffer.length !== signatureBuffer.length || !timingSafeEqual(expectedBuffer, signatureBuffer)) return new NextResponse("Invalid signature", { status: 401 });
  const event = JSON.parse(raw) as { id?: string; topic?: string; data?: { id?: string | number; status?: { name?: string } | string; tracking_number?: string; tracking_url?: string } };
  const externalId = event.id ?? `${event.topic}:${event.data?.id}`;
  try { await db.webhookEvent.create({ data: { provider: "lulu", externalId, payload: event } }); } catch { return NextResponse.json({ ok: true, replay: true }); }
  const data = event.data;
  if (data?.id) {
    const printJobId = String(data.id);
    const status = typeof data.status === "string" ? data.status : data.status?.name;
    const fulfillmentStatus = status?.toLowerCase().includes("ship") ? "SHIPPED" : status?.toLowerCase().includes("cancel") ? "CANCELLED" : status?.toLowerCase().includes("fail") ? "FULFILLMENT_FAILED" : "IN_PRODUCTION";
    await db.order.updateMany({ where: { luluPrintJobId: printJobId }, data: { luluStatus: status, fulfillmentStatus, trackingNumber: data.tracking_number, trackingUrl: safeTrackingUrl(data.tracking_url) } });
  }
  return NextResponse.json({ ok: true });
}
