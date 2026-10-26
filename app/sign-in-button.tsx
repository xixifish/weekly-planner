"use client";

import { signInWithGoogle } from "@/lib/sign-in";

export function SignInButton() {
  return (
    <button
      type="button"
      onClick={() => signInWithGoogle()}
      className="h-9 w-19 rounded-md border border-link-blue text-[15px] font-extrabold text-link-blue hover:text-link-blue-hover hover:border-link-blue-hover"
    >
      Sign in
    </button>
  );
}
