import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import type { PhysicalQuoteInput } from "@/lib/commerce/validation";

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

type ReviewedQuote = {
  version: 1;
  format: PhysicalQuoteInput["format"];
  quantity: number;
  shippingMethod: string;
  shippingAmount: number;
  totalAmount: number;
  inputHash: string;
  expiresAt: number;
};

const REVIEWED_QUOTE_TTL_MS = 15 * 60_000;

function quoteInputHash(input: PhysicalQuoteInput) {
  return hashSecret(JSON.stringify({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone ?? "",
    address1: input.address1,
    address2: input.address2 ?? "",
    city: input.city,
    state: input.state,
    postalCode: input.postalCode,
    country: input.country,
    format: input.format,
    quantity: input.quantity,
  }));
}

function quoteSignature(encodedPayload: string) {
  const key = process.env.QUOTE_SIGNING_SECRET;
  if (!key) throw new Error("QUOTE_SIGNING_SECRET must be configured before confirming a shipping quote.");
  return createHmac("sha256", key).update(encodedPayload).digest("base64url");
}

/** An opaque, short-lived receipt of the server total the customer reviewed. */
export function createReviewedQuote(input: PhysicalQuoteInput, shippingMethod: string, shippingAmount: number, totalAmount: number) {
  const payload: ReviewedQuote = {
    version: 1,
    format: input.format,
    quantity: input.quantity,
    shippingMethod,
    shippingAmount,
    totalAmount,
    inputHash: quoteInputHash(input),
    expiresAt: Date.now() + REVIEWED_QUOTE_TTL_MS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encodedPayload}.${quoteSignature(encodedPayload)}`;
}

export function matchesReviewedQuote(receipt: string, input: PhysicalQuoteInput, shippingMethod: string, shippingAmount: number, totalAmount: number) {
  const separator = receipt.lastIndexOf(".");
  if (separator < 1) return false;
  const encodedPayload = receipt.slice(0, separator);
  const signature = receipt.slice(separator + 1);
  try {
    const expected = Buffer.from(quoteSignature(encodedPayload), "base64url");
    const received = Buffer.from(signature, "base64url");
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return false;
    const quote = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as ReviewedQuote;
    return quote.version === 1
      && quote.expiresAt >= Date.now()
      && quote.format === input.format
      && quote.quantity === input.quantity
      && quote.shippingMethod === shippingMethod
      && quote.shippingAmount === shippingAmount
      && quote.totalAmount === totalAmount
      && quote.inputHash === quoteInputHash(input);
  } catch {
    return false;
  }
}
