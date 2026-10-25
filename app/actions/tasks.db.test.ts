import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "@/lib/prisma";
import { utc } from "@/test/utc";
import { saveThisAndFutureTasks } from "./tasks";

// There is no browser session in tests: pretend "test-user" is signed in
vi.mock("@/lib/current-user", () => ({
  SignedOutError: class SignedOutError extends Error {},
  SIGNED_OUT_RESULT: { error: "Your session has expired.", signedOut: true },
  requireCurrentUser: async () => ({ id: "test-user" }),
}));

// There is no Next.js server to refresh in tests
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

// Gym on Mondays and Wednesdays, repeating from Monday, Oct 5
function createGymTask() {
  return prisma.task.create({
    data: {
      userId: "test-user",
      rules: {
        create: {
          text: "Gym",
          days: ["MON", "WED"],
          repeating: true,
          effectiveFrom: utc("2026-10-05"),
        },
      },
    },
  });
}

// What the edit dialog sends when saving the card on `cardDate`
function editForm(
  taskId: string,
  cardDate: string,
  text: string,
  days: string[],
) {
  const formData = new FormData();
  formData.set("taskId", taskId);
  formData.set("date", cardDate);
  formData.set("description", text);
  for (const day of days) {
    formData.append("days", day);
  }
  formData.set("repeating", "true");
  return formData;
}

// The task's rule versions, oldest first
function rulesOf(taskId: string) {
  return prisma.taskRule.findMany({
    where: { taskId },
    orderBy: { effectiveFrom: "asc" },
  });
}

describe("saveThisAndFutureTasks", () => {
  // Every test starts from an empty database with one user
  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.user.create({
      data: { id: "test-user", email: "test@example.com", name: "Test" },
    });
  });

  it("closes the old rule the day before and starts a new one on the card", async () => {
    const task = await createGymTask();

    const result = await saveThisAndFutureTasks(
      editForm(task.id, "2026-10-21", "Swim", ["WED", "FRI"]),
    );

    expect(result).toEqual({ error: null });
    expect(await rulesOf(task.id)).toMatchObject([
      {
        text: "Gym",
        days: ["MON", "WED"],
        effectiveFrom: utc("2026-10-05"),
        effectiveTo: utc("2026-10-20"),
      },
      {
        text: "Swim",
        days: ["WED", "FRI"],
        effectiveFrom: utc("2026-10-21"),
        effectiveTo: null,
      },
    ]);
  });
});
