import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { enqueueContactReceivedEmail } from "@/lib/commerce/email";
import { enforceRateLimit } from "@/lib/commerce/rate-limit";
import { contactSchema, normalizeEmail, sanitizeFormText } from "@/lib/forms-core";

const success = { ok: true, message: "Thank you — your message has been received." };

function isIdempotencyConflict(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Please check your details and try again.";
    return NextResponse.json({ ok: false, error: first }, { status: 422 });
  }
  if (parsed.data.company) return NextResponse.json(success);

  const input = parsed.data;
  try {
    const existing = await db.contactMessage.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
    if (existing) return NextResponse.json(success);
    if (!await enforceRateLimit({ scope: "contact", request, max: 5, windowMs: 30 * 60_000 })) {
      return NextResponse.json({ ok: false, error: "Too many messages received. Please try again later." }, { status: 429 });
    }
    await db.$transaction(async (tx) => {
      const message = await tx.contactMessage.create({
        data: {
          idempotencyKey: input.idempotencyKey,
          name: sanitizeFormText(input.name),
          email: normalizeEmail(input.email),
          subject: sanitizeFormText(input.subject),
          reason: input.reason ? sanitizeFormText(input.reason) : null,
          message: sanitizeFormText(input.message),
        },
      });
      await enqueueContactReceivedEmail(tx, message);
    });
    return NextResponse.json(success);
  } catch (error) {
    if (isIdempotencyConflict(error) && await db.contactMessage.findUnique({ where: { idempotencyKey: input.idempotencyKey } })) return NextResponse.json(success);
    console.error("[contact] submission failed", { reason: error instanceof Error ? error.name : "unknown" });
    return NextResponse.json({ ok: false, error: "We couldn't process your message right now. Please try again." }, { status: 500 });
  }
}
