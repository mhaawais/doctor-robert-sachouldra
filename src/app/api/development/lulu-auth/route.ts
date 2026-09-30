import { NextResponse } from "next/server";
import { verifyLuluAuthentication } from "@/lib/commerce/lulu";

export const runtime = "nodejs";

/** Temporary sandbox-only diagnostic. It is unavailable unless Lulu is explicitly in sandbox mode. */
export async function POST() {
  if (process.env.LULU_API_ENVIRONMENT !== "sandbox") return new NextResponse(null, { status: 404 });

  try {
    await verifyLuluAuthentication();
    return NextResponse.json({ ok: true, message: "Lulu authentication succeeded." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lulu authentication failed.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
