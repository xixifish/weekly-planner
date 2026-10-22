// Overrides one task occurrence by adding/updating a TaskOverride
"use server";

import { requireOwnedOccurrence } from "@/lib/tasks/require-owned-occurrence";
import { parseTaskForm } from "@/lib/tasks/parse-task-form";
import type { CreateTaskResult } from "./tasks";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SIGNED_OUT_RESULT, SignedOutError } from "@/lib/current-user";

export async function saveThisTaskOnly(
  formData: FormData,
): Promise<CreateTaskResult> {
  // Check whether occurrence is owned
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

  let fields;
  try {
    fields = parseTaskForm(formData);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not save the task",
    };
  }
  // This Task Only changes the card's text and label, never its schedule
  const { text, label } = fields;

  await prisma.taskOverride.upsert({
    where: { taskId_date: { taskId: task.id, date } },
    create: { taskId: task.id, date, text, label },
    update: { text, label },
  });

  revalidatePath("/");
  return { error: null };
}
