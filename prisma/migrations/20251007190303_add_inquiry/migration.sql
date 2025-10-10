-- CreateTable
CREATE TABLE "inquiries" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "phone" TEXT,
    "budget" TEXT,
    "timeline" TEXT,
    "projectType" TEXT NOT NULL,
    "goals" TEXT NOT NULL,
    "pages" TEXT,
    "extras" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);
