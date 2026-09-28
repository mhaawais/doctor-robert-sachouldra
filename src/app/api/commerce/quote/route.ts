import { NextResponse } from "next/server";
import { quoteSchema } from "@/lib/commerce/validation";
import { checkoutEnabled, directFormat } from "@/lib/commerce/config";
import { costCalculation, shippingOptions } from "@/lib/commerce/lulu";
import { enforceRateLimit } from "@/lib/commerce/rate-limit";

export async function POST(request: Request) {
  if (!await enforceRateLimit({ scope: "quote", request, max: 20, windowMs: 60_000 })) return NextResponse.json({ ok: false, error: "Too many quote requests. Please wait and try again." }, { status: 429 });
  if (!checkoutEnabled()) return NextResponse.json({ ok: false, error: "Direct checkout is not configured yet." }, { status: 503 });
  const parsed = quoteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Please check your shipping details." }, { status: 422 });
  try {
    const input = parsed.data;
    const options = await shippingOptions(input);
    const format = directFormat(input.format);
    return NextResponse.json({ ok: true, book: { format: input.format, label: format.label, quantity: input.quantity, unitPrice: format.priceCents, subtotal: format.priceCents * input.quantity }, shippingOptions: options });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "We could not quote shipping." }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  if (!await enforceRateLimit({ scope: "quote-confirm", request, max: 20, windowMs: 60_000 })) return NextResponse.json({ ok: false, error: "Too many quote requests. Please wait and try again." }, { status: 429 });
  if (!checkoutEnabled()) return NextResponse.json({ ok: false, error: "Direct checkout is not configured yet." }, { status: 503 });
  const body = await request.json().catch(() => null);
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success || typeof body?.shippingMethod !== "string") return NextResponse.json({ ok: false, error: "Please select a shipping method." }, { status: 422 });
  try {
    const quote = await costCalculation(parsed.data, body.shippingMethod);
    const format = directFormat(parsed.data.format);
    const shipping = Math.round(Number(quote.shipping_cost?.total_cost_incl_tax ?? 0) * 100);
    return NextResponse.json({ ok: true, shippingAmount: shipping, totalAmount: format.priceCents * parsed.data.quantity + shipping, currency: "USD", quote });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "We could not confirm this shipping method." }, { status: 400 });
  }
}
