import { notFound } from "next/navigation";
import { headers, cookies } from "next/headers";
import { Container } from "@/components/common/container";
import { OrderStatus } from "@/components/commerce/order-status";
import { getOrderFromSession, orderCookieName } from "@/lib/commerce/order-access";
import { enforceRateLimit } from "@/lib/commerce/rate-limit";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const orderNumber = (await params).orderNumber;
  const requestHeaders = await headers();
  const allowed = await enforceRateLimit({ scope: "order-lookup", request: new Request(`https://order-lookup.invalid/${orderNumber}`, { headers: { "x-forwarded-for": requestHeaders.get("x-forwarded-for") ?? "" } }), max: 30, windowMs: 60_000 });
  const order = allowed ? await getOrderFromSession(orderNumber, (await cookies()).get(orderCookieName(orderNumber))?.value) : null;
  if (!order) notFound();

  const ebook = order.format === "EBOOK";
  const edition = ebook ? "eBook" : order.format === "PAPERBACK" ? "Paperback" : "Hardcover";
  const bookTitle = ebook ? "Behind the Mask: A Doctor’s Battles with Purpose" : "Behind the Mask";
  const status = { format: order.format, paymentStatus: order.paymentStatus, fulfillmentStatus: order.fulfillmentStatus, luluStatus: order.luluStatus, trackingNumber: order.trackingNumber, trackingUrl: order.trackingUrl, ebookDownloadUsed: Boolean(order.ebookDownloadConsumedAt) };

  return <section className="min-h-[70vh] bg-ivory"><Container className="max-w-3xl py-16 sm:py-20"><p className="text-xs font-semibold uppercase tracking-[.22em] text-gold-deep">Order status</p><h1 className="mt-4 font-serif text-4xl text-ink">Thank you for your order</h1><p className="mt-3 text-slate-body">Order {order.orderNumber}</p><div className="mt-10 rounded-md border border-hairline bg-paper p-6 sm:p-8"><dl className="grid gap-5 text-sm sm:grid-cols-2"><div><dt className="uppercase tracking-wide text-ink/50">Book</dt><dd className="mt-1 text-ink">{bookTitle} — {edition}</dd></div><div><dt className="uppercase tracking-wide text-ink/50">Quantity</dt><dd className="mt-1 text-ink">{order.quantity}</dd></div><div><dt className="uppercase tracking-wide text-ink/50">Amount paid</dt><dd className="mt-1 text-ink">${(order.totalAmount / 100).toFixed(2)} {order.currency}</dd></div><OrderStatus orderNumber={order.orderNumber} shippingMethod={order.shippingMethod} initial={status} />{ebook && order.paymentStatus === "PAID" && !order.ebookDownloadConsumedAt ? <div className="sm:col-span-2"><a href={`/api/orders/${order.orderNumber}/download`} className="inline-flex rounded-sm bg-gold px-5 py-3 font-semibold text-ink">Download eBook</a></div> : null}{ebook && order.ebookDownloadConsumedAt ? <div className="sm:col-span-2"><dt className="uppercase tracking-wide text-ink/50">Download</dt><dd className="mt-1 text-ink">eBook Download Used</dd></div> : null}</dl></div></Container></section>;
}
