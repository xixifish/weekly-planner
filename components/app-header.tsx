import Image from "next/image";

import { SignInButton } from "@/app/sign-in-button";
import { ChevronDownIcon } from "./icons";

type AppHeaderProps = {
  user?: {
    name: string;
    image?: string | null;
  };
};

export function AppHeader({ user }: AppHeaderProps) {
  return (
    <header className="flex h-15 items-center justify-between border-b border-area-border-grey bg-white px-10">
      {/* Logo and app name */}
      <div className="flex items-center gap-2.5">
        <Image src="/logo.svg" alt="" width={40} height={7} />
        <span className="text-sm font-extrabold text-text-dark">
          Weekly Planner
        </span>
      </div>
      {/* Account: avatar when signed in, Sign in button when not */}
      {user ? (
        <div className="flex items-center gap-1 rounded-lg px-2.5 py-1 hover:bg-card-border">
          {user.image ? (
            <Image
              src={user.image}
              alt=""
              width={36}
              height={36}
              className="size-9 rounded-full object-cover"
            />
          ) : (
            <span className="flex size-9 items-center justify-center rounded-full bg-logo-blue text-sm font-extrabold text-white">
              {user.name.charAt(0)}
            </span>
          )}
          <ChevronDownIcon className="size-4 text-text-dark" />
        </div>
      ) : (
        <SignInButton />
      )}
    </header>
  );
}
