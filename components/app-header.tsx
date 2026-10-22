import Image from "next/image";

import { SignInButton } from "@/app/sign-in-button";
import { ProfileMenu } from "./profile-menu";

type AppHeaderProps = {
  user?: {
    name: string;
    email: string;
    image?: string | null;
  };
};

export function AppHeader({ user }: AppHeaderProps) {
  return (
    <header className="flex h-15 items-center justify-between border-b border-dark-border-grey bg-white px-10">
      {/* Logo and app name */}
      <div className="flex items-center gap-2.5">
        <Image src="/logo.svg" alt="" width={40} height={7} />
        <span className="text-sm font-extrabold text-text-dark">
          Weekly Planner
        </span>
      </div>
      {/* Account: avatar when signed in, Sign in button when not */}
      {user ? (
        <ProfileMenu name={user.name} email={user.email} image={user.image} />
      ) : (
        <SignInButton />
      )}
    </header>
  );
}
