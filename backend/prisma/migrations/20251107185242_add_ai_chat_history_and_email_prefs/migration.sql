-- DropIndex
DROP INDEX "Notification_created_at_idx";

-- DropIndex
DROP INDEX "Notification_is_read_idx";

-- DropIndex
DROP INDEX "Notification_user_id_idx";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email_schedule_days" TEXT DEFAULT '0',
ADD COLUMN     "email_schedule_time" TEXT DEFAULT '08:00',
ADD COLUMN     "therapy_plan_in_email" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "weekly_email_enabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "AIChatHistory" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "chat_title" TEXT,
    "user_message" TEXT NOT NULL,
    "ai_response" TEXT NOT NULL,
    "context" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIChatHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AIChatHistory" ADD CONSTRAINT "AIChatHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
