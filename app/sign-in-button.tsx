"use client";

import { signInWithGoogle } from "@/lib/sign-in";

export function SignInButton() {
  return (
    <button
      type="button"
      onClick={() => signInWithGoogle()}
      className="h-9 w-19 rounded-md border border-logo-blue text-[15px] font-extrabold text-logo-blue hover:text-selected-blue hover:border-selected-blue"
    >
      Sign in
    </button>
  );
}
