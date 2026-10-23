// Ticks or unticks one task occurrence by adding or removing its Completion
"use server";

import { revalidatePath } from "next/cache";

import { requireOwnedOccurrence } from "@/lib/tasks/require-owned-occurrence";
import { SignedOutError } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function toggleTaskCompletion(formData: FormData) {
  let occurrence;
  try {
    occurrence = await requireOwnedOccurrence(formData);
  } catch (error) {
    if (error instanceof SignedOutError) {
      // Signed out meanwhile: show the signed-out page instad of crashing
      revalidatePath("/");
      return;
    }
    throw error;
  }
  const { task, date } = occurrence;

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
