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

const POLL_INTERVAL_MS = 3_000;
const MAX_POLLS = 20;

function label(value: string) { return value.replaceAll("_", " "); }

function isTransitional(order: OrderStatusSnapshot) {
  if (order.paymentStatus === "PENDING_PAYMENT") return true;
  return order.paymentStatus === "PAID" && order.format !== "EBOOK" && ["NOT_SUBMITTED", "FULFILLMENT_SUBMITTED"].includes(order.fulfillmentStatus);
}

export function OrderStatus({ orderNumber, shippingMethod, initial }: { orderNumber: string; shippingMethod: string; initial: OrderStatusSnapshot }) {
  const [order, setOrder] = useState(initial);
  const [pollingExpired, setPollingExpired] = useState(false);
  const [networkIssue, setNetworkIssue] = useState(false);

  useEffect(() => {
    if (!isTransitional(initial)) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;
    const poll = async () => {
      attempts += 1;
      let next = initial;
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}/status`, { cache: "no-store", credentials: "same-origin" });
        if (!response.ok) throw new Error("Order status request failed.");
        const data = await response.json() as { ok?: boolean; order?: OrderStatusSnapshot };
        if (!data.ok || !data.order) throw new Error("Order status response was invalid.");
        next = data.order;
        if (!cancelled) { setOrder(next); setNetworkIssue(false); }
      } catch {
        if (!cancelled) setNetworkIssue(true);
      }
      if (cancelled || !isTransitional(next) || attempts >= MAX_POLLS) {
        if (!cancelled && isTransitional(next) && attempts >= MAX_POLLS) setPollingExpired(true);
        return;
      }
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    };
    timer = setTimeout(poll, POLL_INTERVAL_MS);
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [initial, orderNumber]);

  const fulfillmentLabel = label(order.luluStatus ?? order.fulfillmentStatus);
  return <><div><dt className="uppercase tracking-wide text-ink/50">Payment</dt><dd className="mt-1 text-ink">{order.paymentStatus === "PENDING_PAYMENT" ? "PROCESSING" : label(order.paymentStatus)}</dd></div>{order.format === "EBOOK" ? <div><dt className="uppercase tracking-wide text-ink/50">Delivery</dt><dd className="mt-1 text-ink">Digital download</dd></div> : <><div><dt className="uppercase tracking-wide text-ink/50">Shipping method</dt><dd className="mt-1 text-ink">{shippingMethod}</dd></div><div><dt className="uppercase tracking-wide text-ink/50">Fulfillment</dt><dd className="mt-1 text-ink">{fulfillmentLabel}</dd></div>{order.fulfillmentStatus === "SHIPPED" && order.trackingUrl ? <div className="sm:col-span-2"><a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className="font-semibold text-gold-deep underline">{order.trackingNumber ? `Track shipment (${order.trackingNumber})` : "Track shipment"}</a></div> : null}</>}{isTransitional(order) ? <p className="sm:col-span-2 text-sm text-slate-body">Checking the latest order status…</p> : null}{pollingExpired ? <p className="sm:col-span-2 text-sm text-slate-body">Payment is confirmed. Fulfillment is still being confirmed and may take a moment. Refresh later for the newest status.</p> : null}{networkIssue ? <p className="sm:col-span-2 text-sm text-slate-body">We could not check for an update just now. Your order remains safely recorded.</p> : null}</>;
}
