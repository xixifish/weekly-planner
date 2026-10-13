// Ticks or unticks one task occurrence by adding or removing its Completion
"use server";

import { revalidatePath } from "next/cache";

import { requireOwnedOccurrence } from "@/lib/tasks/require-owned-occurrence";
import { prisma } from "@/lib/prisma";

export async function toggleTaskCompletion(formData: FormData) {
  const { task, date } = await requireOwnedOccurrence(formData);

  // Find an existing completion for this occurrence
  const existingCompletion = await prisma.completion.findUnique({
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

  // Toggle the completion
  if (existingCompletion) {
    await prisma.completion.delete({
      where: {
        id: existingCompletion.id,
      },
    });
  } else {
    await prisma.completion.create({
      data: {
        taskId: task.id,
        date,
      },
    });
  }

  // Reload the weekly data
  revalidatePath("/");
}
