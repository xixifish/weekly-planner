import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";

import { prisma } from "@/lib/prisma";

function requireEnvironmentVariable(name: string) {
    const value = process.env[name]

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
});