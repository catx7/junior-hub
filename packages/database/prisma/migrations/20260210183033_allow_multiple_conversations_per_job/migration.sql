-- DropIndex
DROP INDEX "Conversation_jobId_key";

-- CreateIndex
CREATE INDEX "Conversation_jobId_idx" ON "Conversation"("jobId");
