// Overrides one task occurrence by adding/updating a TaskOverride
"use server";

import { requireOwnedOccurrence } from "@/lib/tasks/require-owned-occurrence";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveThisTaskOnly(formData: FormData) {
  // Check whether occurrence is owned
  const { task, date } = await requireOwnedOccurrence(formData);

  // Read and validate the description
  const description = formData.get("description");
  if (typeof description !== "string" || !description.trim()) {
    throw new Error("Enter a task description");
  }
  if (description.trim().length > 1000) {
    throw new Error("Task description is too long");
  }

  // Create this occurrence's override, or update it if one exists
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
