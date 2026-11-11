import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";

import { prisma } from "@/lib/prisma";

import { anonymous } from "better-auth/plugins";
import { getToday, resolveTimeZone } from "@/lib/dates/today";
import { seedGuestTasks } from "@/lib/tasks/seed-guest-tasks";

function requireEnvironmentVariable(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not defined`);
  }

  return value;
}

export const auth = betterAuth({
  appName: "Weekly Planner",

  secret: requireEnvironmentVariable("BETTER_AUTH_SECRET"),
  baseURL: requireEnvironmentVariable("BETTER_AUTH_URL"),

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  socialProviders: {
    google: {
      clientId: requireEnvironmentVariable("GOOGLE_CLIENT_ID"),
      clientSecret: requireEnvironmentVariable("GOOGLE_CLIENT_SECRET"),
    },
  },

  user: {
    deleteUser: {
      enabled: true,
    },
  },

  plugins: [anonymous({ generateName: () => "Guest" })],

  databaseHooks: {
    user: {
      create: {
        // A new guest starts with a week of sample tasks
        after: async (user, context) => {
          if (!user.isAnonymous) return;

          // Today in the visitor's time zone, the same way the home page finds it
          const timeZone = resolveTimeZone(
            context?.request?.headers.get("x-vercel-ip-timezone") ?? null,
          );

          try {
            await seedGuestTasks(user.id, getToday(timeZone));
          } catch (error) {
            // An empty week is better than a failed sign-in
            console.error("Could not create the guest's sample tasks", error);
          }
        },
      },
    },
  },
});
