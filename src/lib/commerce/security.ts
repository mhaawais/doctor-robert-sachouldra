import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "crypto";

export function newSecret() { return randomBytes(32).toString("base64url"); }
export function hashSecret(value: string) { return createHash("sha256").update(value).digest("hex"); }
export function matchesSecret(value: string, expectedHash: string) {
  const actual = Buffer.from(hashSecret(value), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function constantTimeEquals(left: string, right: string) {
  return matchesSecret(left, hashSecret(right));
}

export function orderAccessUrl(orderNumber: string, token: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) throw new Error("NEXT_PUBLIC_SITE_URL must be configured for order access.");
  return new URL(`/order/${orderNumber}/access?token=${encodeURIComponent(token)}`, siteUrl).toString();
}

export function safeTrackingUrl(value: string | undefined) {
  if (!value) return null;
  try { const url = new URL(value); return url.protocol === "https:" ? url.toString() : null; }
  catch { return null; }
}
