/*
  Warnings:

  - You are about to drop the `TaskException` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TaskException" DROP CONSTRAINT "TaskException_taskId_fkey";

-- DropTable
DROP TABLE "TaskException";

-- CreateTable
CREATE TABLE "TaskSkip" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "TaskSkip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskSkip_taskId_date_key" ON "TaskSkip"("taskId", "date");

-- AddForeignKey
ALTER TABLE "TaskSkip" ADD CONSTRAINT "TaskSkip_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Task" ADD CONSTRAINT "Task_days_not_empty"
  CHECK (array_length("days", 1) >= 1);

ALTER TABLE "Task" ADD CONSTRAINT "Task_end_after_start"
  CHECK ("endDate" IS NULL OR "endDate" >= "startDate");