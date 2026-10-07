import { NextResponse } from "next/server";
import { quoteSchema } from "@/lib/commerce/validation";
import { checkoutEnabled, productFormat } from "@/lib/commerce/config";
import { costCalculation, shippingOptions } from "@/lib/commerce/lulu";
import { enforceRateLimit } from "@/lib/commerce/rate-limit";

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
    return NextResponse.json({ ok: true, book: { format: input.format, label: format.label, quantity: input.quantity, unitPrice: format.priceCents, subtotal: format.priceCents * input.quantity }, shippingOptions: options });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "We could not quote shipping." }, { status: 400 });
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
    return NextResponse.json({ ok: true, shippingAmount: shipping, totalAmount: format.priceCents * input.quantity + shipping, currency: "USD", quote });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "We could not confirm this shipping method." }, { status: 400 });
  }
}
