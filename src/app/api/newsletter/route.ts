import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { enqueueNewsletterReceivedEmail } from "@/lib/commerce/email";
import { enforceRateLimit } from "@/lib/commerce/rate-limit";
import { browserWriteRejection } from "@/lib/commerce/browser-write";
import { newsletterSchema, normalizeEmail } from "@/lib/forms-core";

const success = { ok: true, message: "Thank you — your email has been received." };

export async function POST(request: Request) {
  const rejected = browserWriteRejection(request);
  if (rejected) return NextResponse.json({ ok: false, error: rejected.error }, { status: rejected.status });
  if (!await enforceRateLimit({ scope: "newsletter", request, max: 8, windowMs: 30 * 60_000 })) {
    return NextResponse.json({ ok: false, error: "Too many attempts. Please try again later." }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Please enter a valid email address.";
    return NextResponse.json({ ok: false, error: first }, { status: 422 });
  }
  if (parsed.data.website) return NextResponse.json(success);

  const email = normalizeEmail(parsed.data.email);
  try {
    await db.$transaction(async (tx) => {
      const subscriber = await tx.newsletterSubscriber.upsert({ where: { email }, update: {}, create: { email } });
      await enqueueNewsletterReceivedEmail(tx, subscriber);
    });
    return NextResponse.json(success);
  } catch (error) {
    console.error("[newsletter] subscription failed", { reason: error instanceof Error ? error.name : "unknown" });
    return NextResponse.json({ ok: false, error: "We couldn't subscribe you right now. Please try again." }, { status: 500 });
  }
}
