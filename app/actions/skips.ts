// Deletes one task occurrence by adding a TaskSkip
"use server";

import { revalidatePath } from "next/cache";

import { requireOwnedOccurrence } from "@/lib/tasks/require-owned-occurrence";
import { prisma } from "@/lib/prisma";
import { CreateTaskResult } from "./tasks";
import { SIGNED_OUT_RESULT, SignedOutError } from "@/lib/current-user";

export async function deleteThisTaskOnly(
  formData: FormData,
): Promise<CreateTaskResult> {
  let occurrence;
  try {
    occurrence = await requireOwnedOccurrence(formData);
  } catch (error) {
    if (error instanceof SignedOutError) {
      return SIGNED_OUT_RESULT;
    }
    throw error;
  }
  const { task, date } = occurrence;

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
  return { error: null };
}
