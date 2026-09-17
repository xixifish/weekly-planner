import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export async function requireCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("You must be signed in");
  }

  return session.user;
}
