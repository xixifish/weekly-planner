"use client";

import { signInWithGoogle } from "@/lib/sign-in";

// Signs in with Google, then comes back to this same page (and week)
export function SignInAgainButton() {
  return (
    <button
      type="button"
      onClick={() =>
        signInWithGoogle(window.location.pathname + window.location.search)
      }
      className="font-bold text-link-blue underline transition hover:text-link-blue-hover"
    >
      Sign in again
    </button>
  );
}
