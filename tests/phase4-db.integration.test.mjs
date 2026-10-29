import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

// This suite never uses DATABASE_URL. It runs only against an explicitly supplied,
// disposable database that already has the Phase 4 migration applied.
const testDatabaseUrl = process.env.PHASE4_TEST_DATABASE_URL;
const integration = testDatabaseUrl ? test : test.skip;

integration("Phase 4 database lifecycle is atomic and replay-safe", async () => {
  const require = createRequire(import.meta.url);
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient({ datasources: { db: { url: testDatabaseUrl } } });
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const contactKey = `4f5146e2-4d2d-4c8d-8cf4-${suffix.slice(-12).padStart(12, "0")}`.slice(0, 36);
  const email = `phase4-${suffix}@example.test`;
  const created = { contactIds: [], eventIds: [], subscriberIds: [], bucketKeys: [] };

  try {
    const createContact = () => prisma.contactMessage.create({ data: { idempotencyKey: contactKey, name: "Phase Four", email, subject: "Test", message: "A test message that is long enough." } });
    const attempts = await Promise.allSettled([createContact(), createContact()]);
    const successes = attempts.filter((result) => result.status === "fulfilled");
    assert.equal(successes.length, 1, "unique contact idempotency keys allow one write");
    created.contactIds.push(successes[0].value.id);

    const rollbackKey = `d6a146e2-4d2d-4c8d-8cf4-${suffix.slice(-12).padStart(12, "0")}`.slice(0, 36);
    const duplicateEventKey = `contact:rollback:${suffix}`;
    const seedEvent = await prisma.transactionalEmail.create({ data: { eventKey: duplicateEventKey, eventType: "CONTACT_RECEIVED", recipient: email, payload: {} } });
    created.eventIds.push(seedEvent.id);
    await assert.rejects(prisma.$transaction(async (tx) => {
      const message = await tx.contactMessage.create({ data: { idempotencyKey: rollbackKey, name: "Rollback", email, subject: "Test", message: "This transaction must roll back completely." } });
      await tx.transactionalEmail.create({ data: { eventKey: duplicateEventKey, eventType: "CONTACT_RECEIVED", recipient: email, payload: {}, contactMessageId: message.id } });
    }));
    assert.equal(await prisma.contactMessage.count({ where: { idempotencyKey: rollbackKey } }), 0, "an outbox insertion failure rolls back the contact");

    const rateKey = `phase4-rate:${suffix}`;
    created.bucketKeys.push(rateKey);
    await Promise.all(Array.from({ length: 12 }, () => prisma.rateLimitBucket.upsert({ where: { key: rateKey }, create: { key: rateKey, count: 1, expiresAt: new Date(Date.now() + 60_000) }, update: { count: { increment: 1 } } })));
    assert.equal((await prisma.rateLimitBucket.findUniqueOrThrow({ where: { key: rateKey } })).count, 12, "concurrent bucket updates are atomic");

    const subscriber = await prisma.newsletterSubscriber.create({ data: { email: `subscriber-${suffix}@example.test` } });
    created.subscriberIds.push(subscriber.id);
    const firstNewsletter = await prisma.transactionalEmail.upsert({ where: { eventKey: `newsletter:${subscriber.id}:received` }, update: {}, create: { eventKey: `newsletter:${subscriber.id}:received`, eventType: "NEWSLETTER_RECEIVED", recipient: "admin@doctorrobertbooks.com", payload: {}, newsletterSubscriberId: subscriber.id } });
    const repeatedNewsletter = await prisma.transactionalEmail.upsert({ where: { eventKey: `newsletter:${subscriber.id}:received` }, update: {}, create: { eventKey: `newsletter:${subscriber.id}:received`, eventType: "NEWSLETTER_RECEIVED", recipient: "admin@doctorrobertbooks.com", payload: {}, newsletterSubscriberId: subscriber.id } });
    created.eventIds.push(firstNewsletter.id, repeatedNewsletter.id);
    assert.equal(firstNewsletter.id, repeatedNewsletter.id, "duplicate newsletter submissions share one notification event");
  } finally {
    await prisma.transactionalEmail.deleteMany({ where: { id: { in: created.eventIds } } });
    await prisma.rateLimitBucket.deleteMany({ where: { key: { in: created.bucketKeys } } });
    await prisma.newsletterSubscriber.deleteMany({ where: { id: { in: created.subscriberIds } } });
    await prisma.contactMessage.deleteMany({ where: { id: { in: created.contactIds } } });
    await prisma.$disconnect();
  }
});
