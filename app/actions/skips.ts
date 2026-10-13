// Deletes one task occurrence by adding a TaskSkip
"use server";

import { revalidatePath } from "next/cache";

import { requireOwnedOccurrence } from "@/lib/tasks/require-owned-occurrence";
import { prisma } from "@/lib/prisma";

export async function deleteThisTaskOnly(formData: FormData) {
  const { task, date } = await requireOwnedOccurrence(formData);

  // Check if the task has TaskSkip on the date
  const existingSkip = await prisma.taskSkip.findUnique({
    where: {
      taskId_date: {
        taskId: task.id,
        date,
      },
    },
    select: {
      id: true,
    },
  });

  if (!existingSkip) {
    await prisma.taskSkip.create({
      data: {
        taskId: task.id,
        date,
      },
    });
  }

  // Reload the weekly data
  revalidatePath("/");
}
