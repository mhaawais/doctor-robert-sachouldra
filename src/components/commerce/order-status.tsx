"use client";

import { useEffect, useState } from "react";

export type OrderStatusSnapshot = {
  format: "PAPERBACK" | "HARDCOVER" | "EBOOK";
  paymentStatus: "PENDING_PAYMENT" | "PAID" | "FAILED" | "REFUNDED";
  fulfillmentStatus: "NOT_SUBMITTED" | "FULFILLMENT_SUBMITTED" | "FULFILLMENT_FAILED" | "MANUAL_REVIEW" | "IN_PRODUCTION" | "SHIPPED" | "CANCELLED";
  luluStatus: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  ebookDownloadUsed: boolean;
};

const FIRST_MINUTE_MS = 60_000;
const FIRST_SIX_MINUTES_MS = 6 * 60_000;
const FIRST_TWENTY_ONE_MINUTES_MS = 21 * 60_000;
const MAX_POLLING_WINDOW_MS = 2 * 60 * 60_000;

function label(value: string) { return value.replaceAll("_", " "); }

function isTransitional(order: OrderStatusSnapshot) {
  if (order.paymentStatus === "PENDING_PAYMENT") return true;
  if (order.paymentStatus !== "PAID" || order.format === "EBOOK") return false;
  const luluStatus = order.luluStatus?.toUpperCase();
  if (luluStatus) return ["UNPAID", "CREATED", "IN_PRODUCTION", "PRODUCTION_DELAYED"].includes(luluStatus);
  return ["NOT_SUBMITTED", "FULFILLMENT_SUBMITTED", "IN_PRODUCTION"].includes(order.fulfillmentStatus);
}

function pollingDelay(elapsedMs: number) {
  if (elapsedMs < FIRST_MINUTE_MS) return 3_000;
  if (elapsedMs < FIRST_SIX_MINUTES_MS) return 10_000;
  if (elapsedMs < FIRST_TWENTY_ONE_MINUTES_MS) return 30_000;
  return 60_000;
}

export function OrderStatus({ orderNumber, shippingMethod, initial }: { orderNumber: string; shippingMethod: string; initial: OrderStatusSnapshot }) {
  const [order, setOrder] = useState(initial);
  const [pollingExpired, setPollingExpired] = useState(false);
  const [networkIssue, setNetworkIssue] = useState(false);

  useEffect(() => {
    if (!isTransitional(initial)) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const startedAt = Date.now();
    let latest = initial;
    const poll = async () => {
      const elapsedMs = Date.now() - startedAt;
      if (elapsedMs >= MAX_POLLING_WINDOW_MS) {
        if (!cancelled && isTransitional(latest)) setPollingExpired(true);
        return;
      }
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}/status`, { cache: "no-store", credentials: "same-origin" });
        if (!response.ok) throw new Error("Order status request failed.");
        const data = await response.json() as { ok?: boolean; order?: OrderStatusSnapshot };
        if (!data.ok || !data.order) throw new Error("Order status response was invalid.");
        latest = data.order;
        if (!cancelled) { setOrder(latest); setNetworkIssue(false); }
      } catch {
        if (!cancelled) setNetworkIssue(true);
      }
      if (cancelled || !isTransitional(latest)) return;
      const remainingMs = MAX_POLLING_WINDOW_MS - (Date.now() - startedAt);
      if (remainingMs <= 0) { if (!cancelled) setPollingExpired(true); return; }
      timer = setTimeout(poll, Math.min(pollingDelay(Date.now() - startedAt), remainingMs));
    };
    timer = setTimeout(poll, pollingDelay(0));
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [initial, orderNumber]);

  const fulfillmentLabel = label(order.luluStatus ?? order.fulfillmentStatus);
  return <><div><dt className="uppercase tracking-wide text-ink/50">Payment</dt><dd className="mt-1 text-ink">{order.paymentStatus === "PENDING_PAYMENT" ? "PROCESSING" : label(order.paymentStatus)}</dd></div>{order.format === "EBOOK" ? <div><dt className="uppercase tracking-wide text-ink/50">Delivery</dt><dd className="mt-1 text-ink">Digital download</dd></div> : <><div><dt className="uppercase tracking-wide text-ink/50">Shipping method</dt><dd className="mt-1 text-ink">{shippingMethod}</dd></div><div><dt className="uppercase tracking-wide text-ink/50">Fulfillment</dt><dd className="mt-1 text-ink">{fulfillmentLabel}</dd></div>{order.fulfillmentStatus === "SHIPPED" && order.trackingUrl ? <div className="sm:col-span-2"><a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className="font-semibold text-gold-deep underline">{order.trackingNumber ? `Track shipment (${order.trackingNumber})` : "Track shipment"}</a></div> : null}</>}{isTransitional(order) ? <p role="status" className="sm:col-span-2 flex items-center gap-2 text-sm text-slate-body"><span aria-hidden="true" className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-gold/30 border-t-gold motion-safe:animate-spin" />Order status is being updated automatically. You don&apos;t need to refresh this page.</p> : null}{pollingExpired ? <p className="sm:col-span-2 text-sm text-slate-body">Your order is still being processed. We will continue processing it automatically. You can return to this page later to see the latest status.</p> : null}{networkIssue ? <p className="sm:col-span-2 text-sm text-slate-body">We could not check for an update just now. Your order remains safely recorded.</p> : null}</>;
}
