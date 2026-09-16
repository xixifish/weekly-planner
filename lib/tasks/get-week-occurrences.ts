"use server";

import { requireCurrentUser } from "../current-user";
import { prisma } from "@/lib/prisma";

import { Weekday } from "@/app/generated/prisma/enums";

export async function getWeekOccurrences(weekStart: Date) {
  const weekdays = [
    Weekday.SUN,
    Weekday.MON,
    Weekday.TUE,
    Weekday.WED,
    Weekday.THU,
    Weekday.FRI,
    Weekday.SAT,
  ];

  // 1. Get the authenticated user
  const user = await requireCurrentUser();

  // 2. Get the current week's dates
  const weekDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setUTCDate(weekStart.getUTCDate() + index);
    return date;
  });

  // 3. Load that user's relevant task rules
  const weekEnd = weekDates.at(-1);
  if (!weekEnd) {
    throw new Error("Unable to calculate the week end");
  }

  const tasks = await prisma.task.findMany({
    where: {
      userId: user.id,
    },
    include: {
      rules: {
        where: {
          effectiveFrom: {
            lte: weekEnd,
          },
          OR: [
            {
              effectiveTo: null,
            },
            {
              effectiveTo: {
                gte: weekStart,
              },
            },
          ],
        },
        orderBy: {
          effectiveFrom: "asc",
        },
      },
    },
  });

  // 4. Generate occurrences for the seven dates
  type TaskOccurrence = {
    taskId: string;
    ruleId: string;
    date: Date;
    text: string;
  };

  const occurrences: TaskOccurrence[] = [];

  for (const task of tasks) {
    for (const rule of task.rules) {
      for (const date of weekDates) {
        // Does this rule create a card on this date?

        // Not start yet
        if (date < rule.effectiveFrom) continue;

        // Ends already
        if (rule.effectiveTo && date > rule.effectiveTo) continue;
        if (rule.endDate && date > rule.endDate) continue;

        // Has deleted
        if (task.deletedFrom && date >= task.deletedFrom) continue;

        // If repeating task
        if (rule.repeating) {
          // Get weekday of the current date
          const weekday = weekdays[date.getUTCDay()];
          // If not repeat on this weekday
          if (weekday === undefined || !rule.days.includes(weekday)) continue;
        } else {
          // Non-repeating task only appears on one weekday
          if (date.getTime() !== rule.effectiveFrom.getTime()) continue;
        }

        // One occurrence
        occurrences.push({
          taskId: task.id,
          ruleId: rule.id,
          date,
          text: rule.text,
        });
      }
    }
  }

  // 5. Return occurrence objects
  return occurrences;
}
