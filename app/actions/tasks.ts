// Server actions that change a Task and its rules
"use server";

import { revalidatePath } from "next/cache";

import { parseTaskForm } from "@/lib/tasks/parse-task-form";
import { requireOwnedOccurrence } from "@/lib/tasks/require-owned-occurrence";
import { requireCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function createTask(formData: FormData) {
  const user = await requireCurrentUser();

  const { text, days, repeating, date, endDate } = parseTaskForm(formData);

  await prisma.task.create({
    data: {
      userId: user.id,
      rules: {
        create: {
          text,
          days,
          repeating,
          effectiveFrom: date,
          endDate,
        },
      },
    },
  });

  revalidatePath("/"); // Render home page again with fresh data
}

export async function deleteThisAndFutureTasks(formData: FormData) {
  const { task, date } = await requireOwnedOccurrence(formData);

  // Read the task's current deletion date
  const current = await prisma.task.findUnique({
    where: {
      id: task.id,
    },
    select: {
      deletedFrom: true,
    },
  });

  // Keep the earliest deletion date; never move it later
  if (!current?.deletedFrom || current.deletedFrom > date) {
    await prisma.task.update({
      where: {
        id: task.id,
      },
      data: {
        deletedFrom: date,
      },
    });
  }

  // Reload the weekly data
  revalidatePath("/");
}
