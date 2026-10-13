// Overrides one task occurrence by adding/updating a TaskOverride
"use server";

import { requireCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveThisTaskOnly(formData: FormData) {
  // 1. Authenticate the user
  const user = await requireCurrentUser();

  // 2. Read the submitted occurrence identity
  const taskId = formData.get("taskId");
  const dateValue = formData.get("date");
  const description = formData.get("description");

  // 3. Validate taskId
  if (typeof taskId !== "string" || !taskId) {
    throw new Error("Invalid task");
  }

  // 4. Validate and convert the date
  if (typeof dateValue !== "string" || !dateValue) {
    throw new Error("Invalid occurrence date");
  }
  const date = new Date(`${dateValue}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== dateValue
  ) {
    throw new Error("Invalid occurrence date");
  }

  // 5. Validate the text
  if (typeof description !== "string" || !description.trim()) {
    throw new Error("Enter a task description");
  }

  if (description.trim().length > 1000) {
    throw new Error("Task description is too long");
  }

  // 6. Confirm that the signed-in user owns the task
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId: user.id,
    },
    select: {
      id: true,
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  // 7. Create this occurrence's override, or update it if one exists
  await prisma.taskOverride.upsert({
    where: {
      taskId_date: {
        taskId: task.id,
        date,
      },
    },
    create: {
      taskId: task.id,
      date,
      text: description.trim(),
    },
    update: {
      text: description.trim(),
    },
  });

  // 9. Reload the weekly data
  revalidatePath("/");
}
