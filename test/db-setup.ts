import { afterAll } from "vitest";
import { config } from "dotenv";

// Database tests use only the test branch, never .env's DATABASE_URL
config({ path: ".env.test", quiet: true });

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
if (!testDatabaseUrl) {
  throw new Error("TEST_DATABASE_URL is missing: add it to .env.test");
}
process.env.DATABASE_URL = testDatabaseUrl;

// Close the connection when a test file is done
afterAll(async () => {
  const { prisma } = await import("@/lib/prisma");
  await prisma.$disconnect();
});
