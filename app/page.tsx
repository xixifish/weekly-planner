import { headers } from "next/headers";
import { auth } from "@/lib/auth";

import { SignInButton } from "@/app/sign-in-button";
import { SignOutButton } from "./sign-out-button";

export default async function Home() {
  // `async` because reading and validating the session takes time

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 px-6">
      <h1 className="text-3xl font-semibold text-zinc-900">Weekly Planner</h1>
      {session ? (
        <div>
          <p className="text-zinc-900">Signed in as {session.user.email}</p>
          <SignOutButton />
        </div>
      ) : (
        <SignInButton />
      )}
    </main>
  );
}
