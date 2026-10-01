import { NextResponse } from "next/server";
import { diagnoseShippingOptions } from "@/lib/commerce/lulu";
import { enforceRateLimit } from "@/lib/commerce/rate-limit";
import { quoteSchema } from "@/lib/commerce/validation";

export const runtime = "nodejs";

/** Temporary sandbox-only diagnostic; remove after the provider response is captured. */
export async function POST(request: Request) {
  if (process.env.LULU_API_ENVIRONMENT !== "sandbox") return new NextResponse(null, { status: 404 });
  if (!await enforceRateLimit({ scope: "lulu-shipping-diagnostic", request, max: 3, windowMs: 60_000 })) return new NextResponse("Too many requests", { status: 429 });
  const parsed = quoteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Please check your shipping details." }, { status: 422 });
  try {
    return NextResponse.json({ ok: true, ...(await diagnoseShippingOptions(parsed.data)) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lulu diagnostic failed.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
