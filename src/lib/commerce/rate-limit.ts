import "server-only";
import { db } from "@/lib/db";
import { rateLimitKey } from "@/lib/commerce/rate-limit-core";

type Limit = { scope: string; request: Request; max: number; windowMs: number };

/** Database buckets remain effective across serverless instances. */
export async function enforceRateLimit({ scope, request, max, windowMs }: Limit) {
  const now = new Date();
  const { key, slot } = rateLimitKey(scope, request, windowMs, now);
  const cleanupSlot = Math.floor(now.getTime() / (15 * 60_000));
  const cleanupKey = `__rate-limit-cleanup:${cleanupSlot}`;
  const result = await db.$transaction(async (tx) => {
    // The unique key elects one cleanup leader without mutating a shared row.
    const cleanupClaimed = await tx.$executeRaw`
      INSERT INTO "RateLimitBucket" ("key", "count", "expiresAt", "createdAt")
      VALUES (${cleanupKey}, 1, ${new Date((cleanupSlot + 1) * 15 * 60_000)}, ${now})
      ON CONFLICT ("key") DO NOTHING
    `;
    if (cleanupClaimed === 1) {
      await tx.$executeRaw`
        DELETE FROM "RateLimitBucket"
        WHERE "key" IN (
          SELECT "key" FROM "RateLimitBucket"
          WHERE "expiresAt" < ${now} AND "key" <> ${cleanupKey}
          ORDER BY "expiresAt" ASC
          LIMIT 100
        )
      `;
    }
    return tx.rateLimitBucket.upsert({
      where: { key },
      create: { key, count: 1, expiresAt: new Date((slot + 1) * windowMs) },
      update: { count: { increment: 1 } },
      select: { count: true },
    });
  });
  return result.count <= max;
}
