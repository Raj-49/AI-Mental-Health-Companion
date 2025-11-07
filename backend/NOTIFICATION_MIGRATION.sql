-- =====================================================
-- NOTIFICATION TABLE MIGRATION
-- Run this SQL script on your PostgreSQL database
-- =====================================================

-- Step 1: Create the Notification table
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- Step 2: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "Notification_user_id_idx" ON "Notification"("user_id");
CREATE INDEX IF NOT EXISTS "Notification_created_at_idx" ON "Notification"("created_at");
CREATE INDEX IF NOT EXISTS "Notification_is_read_idx" ON "Notification"("is_read");

-- Step 3: Add foreign key constraint
ALTER TABLE "Notification" 
ADD CONSTRAINT "Notification_user_id_fkey" 
FOREIGN KEY ("user_id") 
REFERENCES "User"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if table was created successfully
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Notification'
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'Notification';

-- Check foreign key constraints
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'Notification'
    AND tc.constraint_type = 'FOREIGN KEY';
