-- AlterTable: Add navigation preference columns to user_preferences
ALTER TABLE "user_preferences" ADD COLUMN IF NOT EXISTS "adminNavMode" TEXT NOT NULL DEFAULT 'sidebar';
ALTER TABLE "user_preferences" ADD COLUMN IF NOT EXISTS "folderClickMode" TEXT NOT NULL DEFAULT 'zoom';
