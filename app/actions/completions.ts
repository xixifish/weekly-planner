// Reads taskId and date from FormData
"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function toggleTaskCompletion(formData: FormData) {
  // 1. Authenticate the user
  const user = await requireCurrentUser();

  // 2. Read the submitted occurrence identity
  const taskId = formData.get("taskId");
  const dateValue = formData.get("date");

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

  // 5. Confirm that the signed-in user owns the task
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

  // 6. Find an existing completion for this occurrence
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

  // 7. Toggle the completion
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

  // 8. Reload the weekly data
  revalidatePath("/");
}
