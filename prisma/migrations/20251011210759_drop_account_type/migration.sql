/*
  Warnings:

  - You are about to drop the column `accountType` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "accountType",
ALTER COLUMN "role" SET DEFAULT 'CLIENT';

-- DropEnum
DROP TYPE "AccountType";
