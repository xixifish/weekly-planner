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
      className="h-9 w-19 rounded-md border border-logo-blue text-[15px] font-extrabold text-logo-blue"
    >
      Sign in
    </button>
  );
}
