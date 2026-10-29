ALTER TYPE "TransactionalEmailEventType" ADD VALUE IF NOT EXISTS 'CONTACT_RECEIVED';
ALTER TYPE "TransactionalEmailEventType" ADD VALUE IF NOT EXISTS 'NEWSLETTER_RECEIVED';

ALTER TABLE "ContactMessage" ADD COLUMN "idempotencyKey" TEXT;
CREATE UNIQUE INDEX "ContactMessage_idempotencyKey_key" ON "ContactMessage"("idempotencyKey");

ALTER TABLE "TransactionalEmail" ALTER COLUMN "orderId" DROP NOT NULL;
ALTER TABLE "TransactionalEmail" ADD COLUMN "contactMessageId" TEXT;
ALTER TABLE "TransactionalEmail" ADD COLUMN "newsletterSubscriberId" TEXT;
ALTER TABLE "TransactionalEmail" ADD CONSTRAINT "TransactionalEmail_contactMessageId_fkey" FOREIGN KEY ("contactMessageId") REFERENCES "ContactMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TransactionalEmail" ADD CONSTRAINT "TransactionalEmail_newsletterSubscriberId_fkey" FOREIGN KEY ("newsletterSubscriberId") REFERENCES "NewsletterSubscriber"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "TransactionalEmail_contactMessageId_eventType_idx" ON "TransactionalEmail"("contactMessageId", "eventType");
CREATE INDEX "TransactionalEmail_newsletterSubscriberId_eventType_idx" ON "TransactionalEmail"("newsletterSubscriberId", "eventType");
