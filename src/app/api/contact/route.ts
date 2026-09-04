import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

/**
 * CONTACT API
 * -----------
 * - Server-side zod validation + input sanitization (client validates too)
 * - Submissions stored via Prisma (SQLite). No fake "email sent" claims —
 *   the UI says "Your message has been received", which is exactly true.
 * - Spam protection: honeypot field + simple in-memory rate limit.
 *   Integration point for reCAPTCHA/Turnstile or an email provider
 *   (Resend/Postmark) is marked below.
 */

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("A valid email is required").max(320),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  reason: z.string().trim().max(100).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Message should be at least 10 characters").max(5000),
  /** Honeypot — must stay empty. Bots fill it. */
  company: z.string().optional().or(z.literal("")),
});

/** Strip control characters / normalize whitespace before persisting. */
function sanitize(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\s{3,}/g, "  ")
    .trim();
}

/** Naive in-memory rate limiter: 5 submissions per IP per 30 minutes. */
const hits = new Map<string, number[]>();
const WINDOW_MS = 30 * 60 * 1000;
const MAX_HITS = 5;

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
        { ok: false, error: "Too many messages received. Please try again later." },
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

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? "Please check your details and try again.";
      return NextResponse.json({ ok: false, error: first }, { status: 422 });
    }

    // Honeypot filled → silently accept but do not store (bot trap)
    if (parsed.data.company) {
      return NextResponse.json({ ok: true, message: "Thank you — your message has been received." });
    }

    // TODO integration point: forward to an email provider (Resend/Postmark)
    // and/or spam service (Turnstile) using environment variables.
    await db.contactMessage.create({
      data: {
        name: sanitize(parsed.data.name),
        email: sanitize(parsed.data.email).toLowerCase(),
        subject: sanitize(parsed.data.subject),
        reason: parsed.data.reason ? sanitize(parsed.data.reason) : null,
        message: sanitize(parsed.data.message),
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Thank you — your message has been received.",
    });
  } catch (error) {
    console.error("[contact] submission failed:", error);
    return NextResponse.json(
      { ok: false, error: "We couldn't process your message right now. Please try again." },
      { status: 500 }
    );
  }
}
