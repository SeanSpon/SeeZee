-- AlterTable
ALTER TABLE "users" ADD COLUMN     "questionnaireCompleted" TIMESTAMP(3),
ADD COLUMN     "briefQuestionnaireId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_briefQuestionnaireId_key" ON "users"("briefQuestionnaireId");

