// Creates the Task and its initial TaskRule together

"use server";

import { revalidatePath } from "next/cache";

import { Weekday } from "../generated/prisma/enums";
import { requireCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

const weekdays = [
  Weekday.SUN,
  Weekday.MON,
  Weekday.TUE,
  Weekday.WED,
  Weekday.THU,
  Weekday.FRI,
  Weekday.SAT,
];

export async function createTask(formData: FormData) {
  const user = await requireCurrentUser();
  const description = formData.get("description");
  const dateValue = formData.get("date");

  if (typeof description !== "string" || !description.trim()) {
    throw new Error("Enter a task description");
  }

  if (description.trim().length > 1000) {
    throw new Error("Task description is too long");
  }

  if (typeof dateValue !== "string" || !dateValue) {
    throw new Error("Choose a date");
  }

  const date = new Date(`${dateValue}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Choose a valid date");
  }

  await prisma.task.create({
    data: {
      userId: user.id,
      rules: {
        create: {
          text: description.trim(),
          days: [weekdays[date.getUTCDay()]],
          repeating: false,
          effectiveFrom: date,
        },
      },
    },
  });

  revalidatePath("/"); // Render home page again with fresh data
}
