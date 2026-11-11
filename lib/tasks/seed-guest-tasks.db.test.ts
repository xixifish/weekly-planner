import { beforeEach, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { utc } from "@/test/utc";
import { buildSampleTasks } from "./sample-tasks";
import { seedGuestTasks } from "./seed-guest-tasks";

describe("seedGuestTasks", () => {
  // Every test starts from an empty database with one guest
  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.user.create({
      data: {
        id: "guest-user",
        email: "guest@example.com",
        name: "Guest",
        isAnonymous: true,
      },
    });
  });

  it("saves every sample task with its rule and its ticks", async () => {
    const today = utc("2026-11-11");
    const sampleTasks = buildSampleTasks(today);

    await seedGuestTasks("guest-user", today);

    const tasks = await prisma.task.findMany({
      where: { userId: "guest-user" },
      include: { rules: true, completions: true },
    });

    expect(tasks).toHaveLength(sampleTasks.length);
    for (const task of tasks) {
      expect(task.rules).toHaveLength(1);
    }
    expect(tasks.flatMap((task) => task.completions)).toHaveLength(
      sampleTasks.flatMap((task) => task.completedOn).length,
    );
  });
});
