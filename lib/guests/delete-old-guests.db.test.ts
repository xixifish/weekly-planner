import { beforeEach, describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { utc } from "@/test/utc";
import { deleteOldGuests } from "./delete-old-guests";

describe("deleteOldGuests", () => {
  // Every test starts from an empty database
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  it("deletes only guests older than 7 days, along with their tasks", async () => {
    // A guest from 8 days ago, with one task
    await prisma.user.create({
      data: {
        id: "old-guest",
        email: "old-guest@example.com",
        name: "Guest",
        isAnonymous: true,
        createdAt: new Date("2026-11-03T12:00:00.000Z"),
        tasks: {
          create: {
            rules: {
              create: {
                text: "Gym",
                days: ["MON"],
                repeating: true,
                effectiveFrom: utc("2026-11-02"),
              },
            },
          },
        },
      },
    });
    // A guest from 6 days ago
    await prisma.user.create({
      data: {
        id: "new-guest",
        email: "new-guest@example.com",
        name: "Guest",
        isAnonymous: true,
        createdAt: new Date("2026-11-05T12:00:00.000Z"),
      },
    });
    // A Google user from months ago
    await prisma.user.create({
      data: {
        id: "old-member",
        email: "member@example.com",
        name: "Member",
        createdAt: new Date("2026-09-01T12:00:00.000Z"),
      },
    });

    const count = await deleteOldGuests(new Date("2026-11-11T12:00:00.000Z"));

    expect(count).toBe(1);

    const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
    expect(users.map((user) => user.id)).toEqual(["new-guest", "old-member"]);
    expect(await prisma.task.count()).toBe(0);
  });
});
