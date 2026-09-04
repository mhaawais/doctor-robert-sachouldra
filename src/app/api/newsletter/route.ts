import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

/**
 * NEWSLETTER API
 * --------------
 * - Email is validated (zod) and stored via Prisma (SQLite).
 * - Idempotent: re-subscribing an existing address returns success.
 * - Integration point: forward the address to Mailchimp / ConvertKit /
 *   Resend via environment variables — see README ("Configuring the
 *   newsletter"). No fake provider claims are made.
 */

const newsletterSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").max(320),
  /** Honeypot — must stay empty. */
  website: z.string().optional().or(z.literal("")),
});

const hits = new Map<string, number[]>();
const WINDOW_MS = 30 * 60 * 1000;
const MAX_HITS = 8;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_HITS) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);
  return false;
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (rateLimited(ip)) {
      return NextResponse.json(
        { ok: false, error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { ok: false, error: "Invalid request." },
        { status: 400 }
      );
    }

    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? "Please enter a valid email address.";
      return NextResponse.json({ ok: false, error: first }, { status: 422 });
    }

    if (parsed.data.website) {
      // Honeypot: silently accept bots without storing
      return NextResponse.json({ ok: true, message: "Thank you — you're on the list." });
    }

    const email = parsed.data.email.toLowerCase();

    // TODO integration point: also POST the subscriber to the configured
    // email provider here (env-driven), keeping local storage as the record.
    await db.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    return NextResponse.json({
      ok: true,
      message: "Thank you — you're on the list. Robert's next update will land in your inbox.",
    });
  } catch (error) {
    console.error("[newsletter] subscription failed:", error);
    return NextResponse.json(
      { ok: false, error: "We couldn't subscribe you right now. Please try again." },
      { status: 500 }
    );
  }
}
