CREATE TYPE "TransactionalEmailStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED');
CREATE TYPE "TransactionalEmailEventType" AS ENUM ('ORDER_PAID', 'ORDER_SHIPPED', 'ADMIN_FULFILLMENT_ATTENTION');

CREATE TABLE "TransactionalEmail" (
    "id" TEXT NOT NULL,
    "eventKey" TEXT NOT NULL,
    "eventType" "TransactionalEmailEventType" NOT NULL,
    "status" "TransactionalEmailStatus" NOT NULL DEFAULT 'PENDING',
    "recipient" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),
    "providerMessageId" TEXT,
    "lastError" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "TransactionalEmail_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TransactionalEmail_eventKey_key" ON "TransactionalEmail"("eventKey");
CREATE INDEX "TransactionalEmail_status_nextAttemptAt_idx" ON "TransactionalEmail"("status", "nextAttemptAt");
CREATE INDEX "TransactionalEmail_orderId_eventType_idx" ON "TransactionalEmail"("orderId", "eventType");

ALTER TABLE "TransactionalEmail" ADD CONSTRAINT "TransactionalEmail_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TransactionalEmail" ENABLE ROW LEVEL SECURITY;
REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE "TransactionalEmail" FROM PUBLIC, anon, authenticated;
