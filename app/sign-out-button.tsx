"use client";

import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="rounded-md border border-zinc-300 bg-white px-4 py-2 font-medium text-zinc-900 shadow-sm hover:bg-zinc-50"
    >
      Sign out
    </button>
  );
}