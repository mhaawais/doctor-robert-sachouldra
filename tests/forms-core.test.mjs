import assert from "node:assert/strict";
import test from "node:test";
import { contactSchema, newsletterSchema, normalizeEmail, sanitizeFormText } from "../src/lib/forms-core.ts";
import { rateLimitKey, requesterIdentity } from "../src/lib/commerce/rate-limit-core.ts";
import { sendResendEmail } from "../src/lib/commerce/email-core.ts";

test("contact validation rejects malformed or oversized messages and accepts a replay-safe key", () => {
  const valid = contactSchema.safeParse({ idempotencyKey: "8f1846e2-4d2d-4c8d-8cf4-5799d5dc09e0", name: "Reader", email: "reader@example.com", subject: "Hello", reason: "", message: "A valid contact message.", company: "" });
  assert.equal(valid.success, true);
  assert.equal(contactSchema.safeParse({ ...valid.data, idempotencyKey: "not-a-uuid" }).success, false);
  assert.equal(contactSchema.safeParse({ ...valid.data, message: "short" }).success, false);
  assert.equal(contactSchema.safeParse({ ...valid.data, message: "x".repeat(5001) }).success, false);
});

test("newsletter validation and normalization reject bad input and normalize identity", () => {
  assert.equal(newsletterSchema.safeParse({ email: "person@example.com", website: "" }).success, true);
  assert.equal(newsletterSchema.safeParse({ email: "not-an-email", website: "" }).success, false);
  assert.equal(normalizeEmail("  Reader@Example.COM  "), "reader@example.com");
  assert.equal(sanitizeFormText("note\u0000   with space"), "note  with space");
});

test("rate-limit identity accepts only Vercel's platform-preserved client IP", () => {
  const spoofed = new Request("https://example.test", { headers: { "x-forwarded-for": "198.51.100.3", "x-real-ip": "198.51.100.4" } });
  assert.equal(requesterIdentity(spoofed), "anonymous");
  const trusted = new Request("https://example.test", { headers: { "x-vercel-id": "iad1::test", "x-vercel-forwarded-for": "203.0.113.8", "x-forwarded-for": "198.51.100.3" } });
  assert.equal(requesterIdentity(trusted), "203.0.113.8");
  const now = new Date("2026-10-29T00:00:00.000Z");
  assert.notEqual(rateLimitKey("contact", trusted, 1_000, now).key, rateLimitKey("newsletter", trusted, 1_000, now).key);
});

test("mocked Resend delivery preserves a stable idempotency key on retries", async () => {
  const requests = [];
  const fetcher = async (_url, init) => {
    requests.push(init);
    return new Response(JSON.stringify({ id: "email_123" }), { status: 200, headers: { "Content-Type": "application/json" } });
  };
  const payload = { from: "orders@example.test", recipient: "reader@example.test", replyTo: "reader@example.test", subject: "Test", text: "Text", html: "<p>Text</p>" };
  assert.equal((await sendResendEmail(fetcher, "contact:test:received", "test-key", payload)).providerMessageId, "email_123");
  await sendResendEmail(fetcher, "contact:test:received", "test-key", payload);
  assert.equal(requests.length, 2);
  assert.equal(requests[0].headers["Idempotency-Key"], requests[1].headers["Idempotency-Key"]);
  assert.equal(JSON.parse(requests[0].body).reply_to, "reader@example.test");
});
