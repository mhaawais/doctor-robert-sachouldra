"use client";

import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CountrySelect } from "@/components/commerce/country-select";

declare global { interface Window { Square?: { payments: (app: string, location: string) => { card: () => Promise<Card> } } } }

type TokenizationError = { code?: string; detail?: string; message?: string };
type TokenizationResult = { status: string; token?: string; errors?: TokenizationError[] };
type Card = { attach: (target: HTMLElement) => Promise<void>; destroy?: () => Promise<void> | void; tokenize: (details: unknown) => Promise<TokenizationResult> };
type Format = "PAPERBACK" | "HARDCOVER" | "EBOOK";
type Fields = Record<"firstName" | "lastName" | "email" | "phone" | "address1" | "address2" | "city" | "state" | "postalCode" | "country", string>;
type ShippingOption = { id: string; label: string; shippingEstimateCents: number | null; currency: string; dispatch: { min: string | null; max: string | null }; delivery: { min: string | null; max: string | null }; transitDays: number | null; totalDays: { min: number | null; max: number | null } };

const initial: Fields = { firstName: "", lastName: "", email: "", phone: "", address1: "", address2: "", city: "", state: "", postalCode: "", country: "US" };
const fields = (Object.keys(initial) as (keyof Fields)[]).filter((key) => key !== "country");
const labels: Record<Format, string> = { PAPERBACK: "Paperback", HARDCOVER: "Hardcover", EBOOK: "eBook" };
const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

function dateRange(range: { min: string | null; max: string | null }) {
  if (!range.min && !range.max) return "Provided after order confirmation";
  const format = (value: string | null) => value ? new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)) : null;
  const min = format(range.min);
  const max = format(range.max);
  return min && max && min !== max ? `${min} – ${max}` : min ?? max ?? "Provided after order confirmation";
}

function transitEstimate(option: ShippingOption) {
  if (option.transitDays !== null) return `${option.transitDays} day${option.transitDays === 1 ? "" : "s"}`;
  if (option.totalDays.min !== null && option.totalDays.max !== null) return option.totalDays.min === option.totalDays.max ? `${option.totalDays.min} days` : `${option.totalDays.min}–${option.totalDays.max} days`;
  return "Provided after order confirmation";
}

export function CheckoutForm({ initialFormat = "PAPERBACK" }: { initialFormat?: Format }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [format, setFormat] = useState<Format>(initialFormat);
  const [quantity, setQuantity] = useState(1);
  const [methods, setMethods] = useState<ShippingOption[]>([]);
  const [method, setMethod] = useState(initialFormat === "EBOOK" ? "DIGITAL_DELIVERY" : "");
  const [bookSubtotal, setBookSubtotal] = useState<number | null>(initialFormat === "EBOOK" ? 299 : null);
  const [shippingAmount, setShippingAmount] = useState<number | null>(initialFormat === "EBOOK" ? 0 : null);
  const [total, setTotal] = useState<number | null>(initialFormat === "EBOOK" ? 299 : null);
  const [reviewedQuote, setReviewedQuote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shippingStage, setShippingStage] = useState<"options" | "cost" | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [cardReady, setCardReady] = useState(false);
  const [cardContainer, setCardContainer] = useState<HTMLDivElement | null>(null);
  const [error, setError] = useState("");
  const card = useRef<Card | null>(null);
  const paymentKey = useRef(crypto.randomUUID());
  const retry = useRef<{ orderNumber: string; token: string } | null>(null);
  const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
  const ebook = format === "EBOOK";
  const payload = useMemo(() => ({ ...values, format, quantity: ebook ? 1 : quantity }), [ebook, format, quantity, values]);
  const selectedOption = methods.find((option) => option.id === method) ?? null;

  const cardContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) {
      const instance = card.current;
      card.current = null;
      setCardReady(false);
      if (instance?.destroy) void Promise.resolve(instance.destroy()).catch(() => undefined);
    }
    setCardContainer(node);
  }, []);

  useEffect(() => {
    if (!sdkLoaded || !appId || !locationId || !window.Square || !cardContainer || card.current) return;
    const payments = window.Square.payments(appId, locationId);
    let cancelled = false;
    void (async () => {
      let instance: Card | null = null;
      try {
        instance = await payments.card();
        if (cancelled || !cardContainer.isConnected) { await instance.destroy?.(); return; }
        await instance.attach(cardContainer);
        if (cancelled || !cardContainer.isConnected) { await instance.destroy?.(); return; }
        card.current = instance;
        setCardReady(true);
      } catch {
        if (!cancelled) setError("Secure card payment could not be loaded.");
      }
    })();
    return () => { cancelled = true; };
  }, [sdkLoaded, appId, locationId, cardContainer]);

  const resetShipping = () => { setMethods([]); setMethod(""); setBookSubtotal(null); setShippingAmount(null); setTotal(null); setReviewedQuote(null); setShippingStage(null); };
  const set = (key: keyof Fields, value: string) => { setValues((current) => ({ ...current, [key]: value })); if (!ebook) resetShipping(); };
  const selectFormat = (value: Format) => {
    setFormat(value);
    setError("");
    if (value === "EBOOK") { setQuantity(1); setMethods([]); setMethod("DIGITAL_DELIVERY"); setBookSubtotal(299); setShippingAmount(0); setTotal(299); setReviewedQuote(null); setShippingStage(null); }
    else resetShipping();
  };

  async function quote() {
    resetShipping(); setLoading(true); setShippingStage("options"); setError("");
    try {
      const response = await fetch("/api/commerce/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!data.ok) return setError(data.error ?? "We couldn't retrieve shipping options. Please try again.");
      setMethods(Array.isArray(data.shippingOptions) ? data.shippingOptions : []);
      setBookSubtotal(typeof data.book?.subtotal === "number" ? data.book.subtotal : null);
      if (!Array.isArray(data.shippingOptions) || data.shippingOptions.length === 0) setError("No shipping options are available for this address. Please check your details and try again.");
    } catch { setError("We couldn't retrieve shipping options. Please try again."); }
    finally { setLoading(false); setShippingStage(null); }
  }

  async function choose(option: ShippingOption) {
    setLoading(true); setShippingStage("cost"); setError(""); setMethod(""); setShippingAmount(null); setTotal(null); setReviewedQuote(null);
    try {
      const response = await fetch("/api/commerce/quote", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, shippingMethod: option.id }) });
      const data = await response.json();
      if (!data.ok) return setError(data.error ?? "We couldn't confirm that shipping option. Please try again.");
      if (typeof data.shippingAmount !== "number" || typeof data.totalAmount !== "number" || typeof data.reviewedQuote !== "string") return setError("We couldn't confirm that shipping option. Please try again.");
      setMethod(option.id); setShippingAmount(data.shippingAmount); setTotal(data.totalAmount); setReviewedQuote(data.reviewedQuote);
    } catch { setError("We couldn't confirm that shipping option. Please try again."); }
    finally { setLoading(false); setShippingStage(null); }
  }

  async function buy() {
    const instance = card.current;
    if (!instance || total === null || !method) return setError(ebook ? "Wait for the secure card form to load." : "Select shipping and wait for the secure card form.");
    setLoading(true); setError("");
    try {
      const result = await instance.tokenize({ amount: (total / 100).toFixed(2), currencyCode: "USD", intent: "CHARGE", customerInitiated: true, sellerKeyedIn: false, billingContact: { givenName: values.firstName, familyName: values.lastName, email: values.email, phone: values.phone, addressLines: [values.address1, ...(values.address2 ? [values.address2] : [])], city: values.city, state: values.state, postalCode: values.postalCode, countryCode: values.country } });
      if (result.status !== "OK" || !result.token) {
        const firstError = result.errors?.[0];
        const detail = [firstError?.code, firstError?.detail ?? firstError?.message].filter(Boolean).join(": ").slice(0, 240);
        console.warn("Square card tokenization failed.", { status: result.status, code: firstError?.code, detail: firstError?.detail ?? firstError?.message });
        return setError(detail ? `Card tokenization failed: ${detail}` : "Card tokenization failed.");
      }
      const response = await fetch("/api/commerce/charge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, shippingMethod: method, ...(ebook ? {} : { reviewedQuote }), paymentToken: result.token, idempotencyKey: paymentKey.current, ...(retry.current ? { retryOrderNumber: retry.current.orderNumber, orderAccessToken: retry.current.token } : {}) }) });
      const data = await response.json();
      if (!data.ok) {
        if (!ebook && data.quoteChanged && typeof data.shippingAmount === "number" && typeof data.totalAmount === "number" && typeof data.reviewedQuote === "string") {
          setShippingAmount(data.shippingAmount); setTotal(data.totalAmount); setReviewedQuote(data.reviewedQuote);
          return setError(data.error ?? "Shipping price or total changed. Please review the updated total.");
        }
        if (data.retryOrderNumber && data.orderAccessToken) { retry.current = { orderNumber: data.retryOrderNumber, token: data.orderAccessToken }; paymentKey.current = crypto.randomUUID(); }
        return setError(data.error ?? "Payment could not be processed.");
      }
      router.push(`/order/${data.orderNumber}/access?token=${encodeURIComponent(data.orderAccessToken)}`);
    } catch { setError("Payment could not be processed."); }
    finally { setLoading(false); }
  }

  return <><Script src={process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === "production" ? "https://web.squarecdn.com/v1/square.js" : "https://sandbox.web.squarecdn.com/v1/square.js"} strategy="afterInteractive" onLoad={() => setSdkLoaded(true)} /><section className="bg-ivory"><div className="mx-auto max-w-3xl px-5 py-16"><p className="text-xs font-semibold uppercase tracking-[.22em] text-gold-deep">Direct purchase</p><h1 className="mt-4 font-serif text-4xl text-ink">Buy the book</h1><div className="mt-10 rounded-md border border-hairline bg-paper p-6"><div className="mt-6 flex flex-wrap gap-3">{(["PAPERBACK", "HARDCOVER", "EBOOK"] as const).map((value) => <button type="button" key={value} onClick={() => selectFormat(value)} disabled={loading} className={`border px-4 py-2 ${format === value ? "border-gold" : "border-hairline"}`}>{labels[value]}{value === "EBOOK" ? " · $2.99" : ""}</button>)}</div><p className="mt-5 text-sm text-slate-body">{ebook ? "Digital delivery for $2.99. Billing details are used only for secure card verification; no shipping address is collected for delivery." : "Enter your shipping details to receive live shipping methods and delivery estimates."}</p><div className="mt-6 grid gap-4 sm:grid-cols-2">{fields.map((key) => <label key={key} className={key.includes("address") ? "sm:col-span-2" : ""}><span className="text-xs uppercase text-ink/60">{ebook && key.startsWith("address") ? `Billing ${key.replace(/([A-Z])/g, " $1")}` : key.replace(/([A-Z])/g, " $1")}</span><input value={values[key]} onChange={(event) => set(key, event.target.value)} className="mt-1 w-full border border-hairline bg-white px-3 py-2" /></label>)}<CountrySelect value={values.country} onChange={(country) => set("country", country)} /></div>{!ebook ? <><div className="mt-5 flex flex-wrap items-end gap-4"><label><span className="text-xs uppercase text-ink/60">Quantity</span><input aria-label="Quantity" type="number" min="1" max="10" value={quantity} onChange={(event) => { setQuantity(Math.max(1, Math.min(10, Number(event.target.value) || 1))); resetShipping(); }} className="mt-1 block w-24 border border-hairline px-3 py-2" /></label><button type="button" onClick={quote} disabled={loading} className="bg-ink px-5 py-3 text-ivory">{shippingStage === "options" ? "Getting shipping options…" : "Get shipping options"}</button></div>{shippingStage === "options" ? <p className="mt-4 text-sm text-slate-body">Retrieving live Lulu shipping prices and delivery estimates…</p> : null}{methods.length ? <div className="mt-6 space-y-3">{bookSubtotal !== null ? <p className="text-sm text-slate-body">{labels[format]}: {money(bookSubtotal)}</p> : null}{methods.map((option) => <label key={option.id} className={`block cursor-pointer rounded-sm border p-4 ${method === option.id ? "border-gold bg-gold/5" : "border-hairline bg-white"}`}><input type="radio" name="shipping-method" checked={method === option.id} disabled={loading} onChange={() => choose(option)} /><span className="ml-2 font-semibold text-ink">{option.label}</span><span className="ml-2 text-sm text-slate-body">{option.shippingEstimateCents === null ? "Price confirmed after selection" : `Lulu shipping estimate: ${money(option.shippingEstimateCents)}`}</span><dl className="mt-3 grid gap-2 text-sm text-slate-body sm:grid-cols-3"><div><dt className="font-medium text-ink">Production / dispatch</dt><dd>{dateRange(option.dispatch)}</dd></div><div><dt className="font-medium text-ink">Shipping transit</dt><dd>{transitEstimate(option)}</dd></div><div><dt className="font-medium text-ink">Estimated arrival</dt><dd>{dateRange(option.delivery)}</dd></div></dl></label>)}</div> : null}{shippingStage === "cost" ? <p className="mt-4 text-sm text-slate-body">Confirming the selected shipping price and order total…</p> : null}</> : null}{total !== null ? <div className="mt-6 border-t border-hairline pt-5"><dl className="space-y-2 text-sm"><div className="flex justify-between"><dt>Book</dt><dd>{money(bookSubtotal ?? total)}</dd></div><div className="flex justify-between"><dt>Shipping</dt><dd>{shippingAmount === null ? "—" : money(shippingAmount)}</dd></div><div className="flex justify-between font-serif text-2xl text-ink"><dt>Total</dt><dd>{money(total)}</dd></div></dl>{selectedOption ? <p className="mt-3 text-sm text-slate-body">Dispatch: {dateRange(selectedOption.dispatch)} · Transit: {transitEstimate(selectedOption)} · Arrival: {dateRange(selectedOption.delivery)}</p> : null}<div ref={cardContainerRef} className="mt-4 border border-hairline bg-white p-4" /><button type="button" onClick={buy} disabled={loading || !cardReady || total === null || !method || (!ebook && !reviewedQuote)} className="mt-4 bg-gold px-5 py-3">{loading ? "Processing…" : ebook ? "Buy eBook" : "Buy the book"}</button></div> : null}{error ? <div role="alert" className="mt-4 text-destructive"><p>{error}</p>{!ebook ? <button type="button" onClick={quote} disabled={loading} className="mt-2 font-semibold underline">Retry shipping options</button> : null}</div> : null}</div></div></section></>;
}
