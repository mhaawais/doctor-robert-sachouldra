import "server-only";
import { createHash } from "crypto";
import { db } from "@/lib/db";

type Limit = { scope: string; request: Request; max: number; windowMs: number };

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const source = forwarded || request.headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(source).digest("hex").slice(0, 24);
}

/** Database buckets remain effective across serverless instances. */
export async function enforceRateLimit({ scope, request, max, windowMs }: Limit) {
  const now = new Date();
  await db.rateLimitBucket.deleteMany({ where: { expiresAt: { lt: now } } });
  const slot = Math.floor(now.getTime() / windowMs);
  const key = `${scope}:${clientKey(request)}:${slot}`;
  const result = await db.rateLimitBucket.upsert({ where: { key }, create: { key, count: 1, expiresAt: new Date((slot + 1) * windowMs) }, update: { count: { increment: 1 } }, select: { count: true } });
  return result.count <= max;
}
