"use client";

import { authClient } from "@/lib/auth-client";

export function SignInButton() {
  async function handleSignIn() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  }

  return (
    <button
      type="button"
      onClick={handleSignIn}
      className="rounded-md border border-zinc-300 bg-white px-4 py-2 font-medium text-zinc-900 shadow-sm hover:bg-zinc-50"
    >
      Sign in with Google
    </button>
  );
}
