import { describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";

describe("test database", () => {
  it("uses the test branch", async () => {
    expect(process.env.DATABASE_URL).toBe(process.env.TEST_DATABASE_URL);
    expect(await prisma.taskRule.count()).toBeGreaterThanOrEqual(0);
  });
});
