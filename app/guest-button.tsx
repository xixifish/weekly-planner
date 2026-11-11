"use client";

import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

export function GuestButton() {
  const router = useRouter();

  // Creates a guest account, then reloads the page's data as that guest
  async function handleClick() {
    const { error } = await authClient.signIn.anonymous();

    if (error) {
      console.error(error);
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="h-9 rounded-md bg-logo-blue px-3.5 text-[15px] font-extrabold text-white transition hover:bg-selected-blue"
    >
      Try as guest
    </button>
  );
}
