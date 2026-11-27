import { beforeEach, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { utc } from "@/test/utc";
import { getWeekOccurrencesForUser } from "./get-week-occurrences-for-user";
import { seedGuestTasks } from "./seed-guest-tasks";

describe("getWeekOccurrencesForUser", () => {
  // Two users, each with the guest sample tasks for the week of 9 Nov 2026
  beforeEach(async () => {
    await prisma.user.deleteMany();
    for (const id of ["user-a", "user-b"]) {
      await prisma.user.create({
        data: { id, email: `${id}@example.com`, name: id },
      });
      await seedGuestTasks(id, utc("2026-11-11"));
    }
  });
  it("returns only the given user's tasks", async () => {
    const occurrences = await getWeekOccurrencesForUser(
      "user-a",
      utc("2026-11-09"),
    );

    const userATasks = await prisma.task.findMany({
      where: { userId: "user-a" },
      select: { id: true },
    });
    const userATaskIds = userATasks.map((task) => task.id);

    expect(occurrences.length).toBeGreaterThan(0);
    for (const occurrence of occurrences) {
      expect(userATaskIds).toContain(occurrence.taskId);
    }
  });
});
