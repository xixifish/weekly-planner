// Creates the Task and its initial TaskRule together
"use server";

import { revalidatePath } from "next/cache";

import { Weekday } from "../generated/prisma/enums";
import { requireCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function createTask(formData: FormData) {
  const user = await requireCurrentUser();
  const description = formData.get("description");
  const dateValue = formData.get("date");
  const rawSelectedDays = formData.getAll("days");
  const repeatingValue = formData.get("repeating") === "true";
  const endDateValue = formData.get("endDate");

  // Validate: description cannot be empty
  if (typeof description !== "string" || !description.trim()) {
    throw new Error("Enter a task description");
  }

  // Validate: description cannot be longer than 1000 characters
  if (description.trim().length > 1000) {
    throw new Error("Task description is too long");
  }

  if (typeof dateValue !== "string" || !dateValue) {
    throw new Error("Choose a date");
  }

  const validWeekdays = Object.values(Weekday);

  if (
    rawSelectedDays.some(
      (day) =>
        typeof day !== "string" || !validWeekdays.includes(day as Weekday),
    )
  ) {
    throw new Error("Invalid day");
  }

  const selectedDays = rawSelectedDays as Weekday[];

  if (selectedDays.length === 0) {
    throw new Error("Choose a day");
  }

  // Reject duplicated weekdays in the submitted FormData
  if (new Set(selectedDays).size !== selectedDays.length) {
    throw new Error("Each day can only be selected once");
  }

  const date = new Date(`${dateValue}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Choose a valid date");
  }

  if (typeof endDateValue !== "string") {
    throw new Error("Invalid end date");
  }

  let endDate: Date | null = null;

  if (endDateValue) {
    if (!repeatingValue) {
      throw new Error("Only a repeating task can have an end date");
    }

    endDate = new Date(`${endDateValue}T00:00:00.000Z`);

    if (Number.isNaN(endDate.getTime())) {
      throw new Error("Choose a valid end date");
    }

    if (endDate < date) {
      throw new Error("End date cannot be before the start date");
    }
  }

  if (!repeatingValue && selectedDays.length !== 1) {
    throw new Error("A non-repeating task must have one day");
  }

  await prisma.task.create({
    data: {
      userId: user.id,
      rules: {
        create: {
          text: description.trim(),
          days: selectedDays,
          repeating: repeatingValue,
          effectiveFrom: date,
          endDate: endDate,
        },
      },
    },
  });

  revalidatePath("/"); // Render home page again with fresh data
}

export async function deleteThisAndFutureTasks(formData: FormData) {
  // 1. Authenticate the user
  const user = await requireCurrentUser();

  // 2. Read the submitted taskId and the starting date to delete
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
      deletedFrom: true,
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  // 6. Keep the earliest deletion date; never move it later
  if (!task.deletedFrom || task.deletedFrom > date) {
    await prisma.task.update({
      where: {
        id: task.id,
      },
      data: {
        deletedFrom: date,
      },
    });
  }

  // 7. Reload the weekly data
  revalidatePath("/");
}
