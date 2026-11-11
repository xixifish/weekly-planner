import { prisma } from "@/lib/prisma";

import { buildSampleTasks } from "./sample-tasks";

// Saves the sample tasks for a new guest
export async function seedGuestTasks(userId: string, today: Date) {
  const sampleTasks = buildSampleTasks(today);

  // All the tasks are saved, or none of them
  await prisma.$transaction(async (tx) => {
    for (const { completedOn, ...rule } of sampleTasks) {
      await tx.task.create({
        data: {
          userId,
          rules: { create: rule },
          completions: {
            create: completedOn.map((date) => ({ date })),
          },
        },
      });
    }
  });
}
