/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `pricing_rules` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "pricing_rules_name_key" ON "pricing_rules"("name");
