// Server actions that change a Task and its rules
"use server";

import { revalidatePath } from "next/cache";

import { parseTaskForm } from "@/lib/tasks/parse-task-form";
import { requireOwnedOccurrence } from "@/lib/tasks/require-owned-occurrence";
import { requireCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

// What the add dialog gets back: an error message, or null when saved
export type CreateTaskResult = { error: string | null };

export async function createTask(
  formData: FormData,
): Promise<CreateTaskResult> {
  const user = await requireCurrentUser();

  let fields;
  try {
    fields = parseTaskForm(formData);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not save the task",
    };
  }

  const { text, days, repeating, date, endDate, label } = fields;

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
          label,
        },
      },
    },
  });

  revalidatePath("/"); // Render home page again with fresh data
  return { error: null };
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

export async function saveThisAndFutureTasks(formData: FormData) {
  const { task, date } = await requireOwnedOccurrence(formData);
  const { text, days, repeating, endDate, label } = parseTaskForm(formData);

  if (!repeating) {
    throw new Error("Turning off repeating is not supported yet");
  }

  // Find the rule active on the date
  const taskRule = await prisma.taskRule.findFirst({
    where: {
      taskId: task.id,
      effectiveFrom: {
        lte: date,
      },
      OR: [
        {
          effectiveTo: {
            gte: date,
          },
        },
        {
          effectiveTo: null,
        },
      ],
    },
    select: {
      id: true,
      effectiveFrom: true,
    },
  });

  if (!taskRule) {
    throw new Error("No rule found for this date");
  }

  // The day before the selected card closes the old rule
  const dayBefore = new Date(date);
  dayBefore.setUTCDate(date.getUTCDate() - 1);

  await prisma.$transaction(async (tx) => {
    // a. Remove later rule versions; the new values replace them
    await tx.taskRule.deleteMany({
      where: {
        taskId: task.id,
        effectiveFrom: { gt: date },
      },
    });

    if (taskRule.effectiveFrom.getTime() === date.getTime()) {
      // b1. The rule starts on this card: change it in place
      await tx.taskRule.update({
        where: {
          id: taskRule.id,
        },
        data: {
          text,
          days,
          repeating,
          endDate,
          effectiveTo: null,
          label,
        },
      });
    } else {
      // b2. Close the old rule the day before
      await tx.taskRule.update({
        where: {
          id: taskRule.id,
        },
        data: {
          effectiveTo: dayBefore,
        },
      });
      // b3. Start a new rule
      await tx.taskRule.create({
        data: {
          taskId: task.id,
          text,
          days,
          repeating,
          endDate,
          effectiveFrom: date,
          label,
        },
      });
    }
  });

  revalidatePath("/");
}

// Saves an edited one-off task: its only rule is changed in place
export async function saveOneOffTask(
  taskId: string,
  formData: FormData,
): Promise<CreateTaskResult> {
  const user = await requireCurrentUser();

  // The task must belong to this user, and be a one-off task
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId: user.id },
    include: { rules: true },
  });
  const rule = task?.rules[0];
  if (!task || task.rules.length !== 1 || !rule || rule.repeating) {
    return { error: "This task can't be edited here" };
  }

  let fields;
  try {
    fields = parseTaskForm(formData);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not save the task",
    };
  }
  const { text, days, repeating, date, endDate, label } = fields;

  await prisma.taskRule.update({
    where: { id: rule.id },
    data: { text, days, repeating, effectiveFrom: date, endDate, label },
  });

  revalidatePath("/");
  return { error: null };
}
