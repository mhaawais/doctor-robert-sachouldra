import { NextResponse } from "next/server";
import { quoteSchema } from "@/lib/commerce/validation";
import { checkoutEnabled, productFormat } from "@/lib/commerce/config";
import { costCalculation, shippingOptions } from "@/lib/commerce/lulu";
import { enforceRateLimit } from "@/lib/commerce/rate-limit";
import { createReviewedQuote } from "@/lib/commerce/security";

function cents(value: unknown) {
  const amount = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : null;
}

function date(value: unknown) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value)) ? value : null;
}

function shippingOption(option: Record<string, unknown>) {
  const level = typeof option.level === "string" ? option.level : "";
  return {
    id: level,
    label: typeof option.name === "string" ? option.name : level.replaceAll("_", " "),
    shippingEstimateCents: cents(option.cost_excl_tax),
    currency: typeof option.currency === "string" ? option.currency : "USD",
    dispatch: { min: date(option.min_dispatch_date), max: date(option.max_dispatch_date) },
    delivery: { min: date(option.min_delivery_date), max: date(option.max_delivery_date) },
    transitDays: typeof option.transit_time === "number" && option.transit_time >= 0 ? option.transit_time : null,
    totalDays: { min: typeof option.total_days_min === "number" && option.total_days_min >= 0 ? option.total_days_min : null, max: typeof option.total_days_max === "number" && option.total_days_max >= 0 ? option.total_days_max : null },
  };
}

export async function POST(request: Request) {
  if (!await enforceRateLimit({ scope: "quote", request, max: 20, windowMs: 60_000 })) return NextResponse.json({ ok: false, error: "Too many quote requests. Please wait and try again." }, { status: 429 });
  const parsed = quoteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Please check your shipping details." }, { status: 422 });
  try {
    const input = parsed.data;
    if (!checkoutEnabled(input.format)) return NextResponse.json({ ok: false, error: "Direct checkout is not configured yet." }, { status: 503 });
    const format = productFormat(input.format);
    if (input.format === "EBOOK") return NextResponse.json({ ok: true, book: { format: input.format, label: format.label, quantity: 1, unitPrice: format.priceCents, subtotal: format.priceCents }, shippingOptions: [] });
    const options = await shippingOptions(input);
    return NextResponse.json({ ok: true, book: { format: input.format, label: format.label, quantity: input.quantity, unitPrice: format.priceCents, subtotal: format.priceCents * input.quantity }, shippingOptions: (Array.isArray(options) ? options : []).map((option) => shippingOption(option as Record<string, unknown>)).filter((option) => option.id) });
  } catch {
    return NextResponse.json({ ok: false, error: "We couldn't retrieve shipping options. Please check your address and try again." }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  if (!await enforceRateLimit({ scope: "quote-confirm", request, max: 20, windowMs: 60_000 })) return NextResponse.json({ ok: false, error: "Too many quote requests. Please wait and try again." }, { status: 429 });
  const body = await request.json().catch(() => null);
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success || typeof body?.shippingMethod !== "string") return NextResponse.json({ ok: false, error: "Please select a shipping method." }, { status: 422 });
  try {
    const input = parsed.data;
    if (!checkoutEnabled(input.format)) return NextResponse.json({ ok: false, error: "Direct checkout is not configured yet." }, { status: 503 });
    const format = productFormat(input.format);
    if (input.format === "EBOOK") {
      if (body.shippingMethod !== "DIGITAL_DELIVERY") return NextResponse.json({ ok: false, error: "Digital delivery does not require shipping." }, { status: 422 });
      return NextResponse.json({ ok: true, shippingAmount: 0, totalAmount: format.priceCents, currency: "USD", quote: null });
    }
    const quote = await costCalculation(input, body.shippingMethod);
    const shipping = Math.round(Number(quote.shipping_cost?.total_cost_incl_tax ?? 0) * 100);
    const totalAmount = format.priceCents * input.quantity + shipping;
    return NextResponse.json({ ok: true, shippingAmount: shipping, totalAmount, currency: "USD", reviewedQuote: createReviewedQuote(input, body.shippingMethod, shipping, totalAmount), quote: { shippingAmount: shipping, totalAmount } });
  } catch {
    return NextResponse.json({ ok: false, error: "We couldn't confirm that shipping option. Please try again." }, { status: 400 });
  }
}
