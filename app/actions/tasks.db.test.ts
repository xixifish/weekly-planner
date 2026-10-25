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

  it("changes the rule in place when the card is its first date", async () => {
    const task = await createGymTask();

    await saveThisAndFutureTasks(
      editForm(task.id, "2026-10-05", "Swim", ["WED", "FRI"]),
    );

    expect(await rulesOf(task.id)).toMatchObject([
      { text: "Swim", effectiveFrom: utc("2026-10-05"), effectiveTo: null },
    ]);
  });

  it("replaces later rule versions when an earlier card is saved", async () => {
    const task = await createGymTask();
    // First split on Wed, Oct 21, then save an earlier card, Mon, Oct 12
    await saveThisAndFutureTasks(
      editForm(task.id, "2026-10-21", "Swim", ["WED", "FRI"]),
    );
    await saveThisAndFutureTasks(
      editForm(task.id, "2026-10-12", "Run", ["MON"]),
    );

    expect(await rulesOf(task.id)).toMatchObject([
      {
        text: "Gym",
        effectiveFrom: utc("2026-10-05"),
        effectiveTo: utc("2026-10-11"),
      },
      { text: "Run", effectiveFrom: utc("2026-10-12"), effectiveTo: null },
    ]);
  });

  it("refuses to turn a repeating task into a one-off", async () => {
    const task = await createGymTask();
    const formData = editForm(task.id, "2026-10-12", "Gym", ["MON"]);
    formData.delete("repeating");

    const result = await saveThisAndFutureTasks(formData);

    expect(result.error).toContain("To stop repeating");
    expect(await rulesOf(task.id)).toMatchObject([
      { text: "Gym", repeating: true, effectiveTo: null },
    ]);
  });
});
