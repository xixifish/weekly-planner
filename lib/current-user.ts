import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export class SignedOutError extends Error {
  constructor() {
    super("You must be signed in");
    this.name = "SignedOutError";
  }
}

export async function requireCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new SignedOutError();
  }

  return session.user;
}

// What an action returns when it ran while nobody was signed in
export const SIGNED_OUT_RESULT = {
  error: "Your session has expired.",
  signedOut: true,
} as const;
