import { requireCurrentUser } from "../current-user";
import { prisma } from "@/lib/prisma";

import { getWeekDates } from "../dates/get-week-dates";
import { buildOccurrences } from "./build-occurrences";

export async function getWeekOccurrences(weekStart: Date) {
  // 1. Get the authenticated user
  const user = await requireCurrentUser();

  // 2. Get the current week's dates
  const weekDates = getWeekDates(weekStart);

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
          AND: [
            { effectiveFrom: { lte: weekEnd } },
            {
              OR: [
                { effectiveTo: null },
                {
                  effectiveTo: {
                    gte: weekStart,
                  },
                },
              ],
            },
          ],
        },
        orderBy: {
          effectiveFrom: "asc",
        },
      },
      // Add loading completions
      completions: {
        where: {
          date: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
        select: {
          date: true,
        },
      },
      // Add loading taskskips
      skips: {
        where: {
          date: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
        select: {
          date: true,
        },
      },
      // Add loading this week's overrides
      overrides: {
        where: {
          date: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
        select: {
          date: true,
          text: true,
          label: true,
        },
      },
    },
  });

  // 4. Generate occurrences for the seven dates
  return buildOccurrences(tasks, weekDates);
}
