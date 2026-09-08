/*
  Warnings:

  - The values [RED] on the enum `LabelColour` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `days` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `dueDate` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `repeats` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Task` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');

-- RenameEnumValue
ALTER TYPE "LabelColour" RENAME VALUE 'RED' TO 'PINK';

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "days",
DROP COLUMN "dueDate",
DROP COLUMN "endDate",
DROP COLUMN "label",
DROP COLUMN "repeats",
DROP COLUMN "startDate",
DROP COLUMN "text",
DROP COLUMN "updatedAt",
ADD COLUMN  "deletedFrom" DATE;

-- CreateTable
CREATE TABLE "TaskRule" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "text" VARCHAR(1000) NOT NULL,
    "days" "Weekday"[],
    "repeating" BOOLEAN NOT NULL DEFAULT false,
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "endDate" DATE,
    "label" "LabelColour",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskOverride" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "text" VARCHAR(1000) NOT NULL,
    "label" "LabelColour",

    CONSTRAINT "TaskOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskRule_taskId_effectiveFrom_key" ON "TaskRule"("taskId", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "TaskOverride_taskId_date_key" ON "TaskOverride"("taskId", "date");

-- AddForeignKey
ALTER TABLE "TaskRule" ADD CONSTRAINT "TaskRule_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskOverride" ADD CONSTRAINT "TaskOverride_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add custom CHECK constraints
ALTER TABLE "TaskRule"
    ADD CONSTRAINT "TaskRule_text_not_blank"
        CHECK (length(btrim("text")) > 0),

    ADD CONSTRAINT "TaskRule_days_not_empty"
        CHECK ("days" IS NOT NULL
            AND cardinality("days") >= 1
        ),

    ADD CONSTRAINT "TaskRule_non_repeating_one_day"
        CHECK ("repeating" OR cardinality("days") = 1),

    ADD CONSTRAINT "TaskRule_end_after_start"
        CHECK (
            "endDate" IS NULL
            OR "endDate" >= "effectiveFrom"
        ),

    ADD CONSTRAINT "TaskRule_end_requires_repeating"
        CHECK ("endDate" is NULL OR "repeating"),

    ADD CONSTRAINT "TaskRule_effective_end_after_start"
        CHECK (
            "effectiveTo" is NULL
            OR "effectiveTo" >= "effectiveFrom"
        );

ALTER TABLE "TaskOverride"
    ADD CONSTRAINT "TaskOverride_text_not_blank"
        CHECK (length(btrim("text")) > 0);
