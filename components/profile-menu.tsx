"use client";

import Image from "next/image";
import { useState, useRef } from "react";

import { useCloseOnClickOutside } from "@/lib/use-close-on-click-outside";

import { ChevronDownIcon } from "./icons";

type ProfileMenuProps = {
  name: string;
  email: string;
  image?: string | null;
};

// The user's photo, or their first initial when they have none
function Avatar({
  name,
  image,
  className,
}: {
  name: string;
  image?: string | null;
  className: string;
}) {
  return image ? (
    <Image
      src={image}
      alt=""
      width={64}
      height={64}
      className={`${className} rounded-full object-cover`}
    />
  ) : (
    <span
      className={`${className} flex items-center justify-center rounded-full bg-logo-blue font-extrabold text-white`}
    >
      {name.charAt(0)}
    </span>
  );
}

export function ProfileMenu({ name, email, image }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useCloseOnClickOutside(menuRef, open, () => setOpen(false));

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 transition hover:border-selected-blue ${open ? "border-selected-blue" : "border-transparent"}`}
      >
        <Avatar name={name} image={image} className="size-9 text-sm" />
        <ChevronDownIcon
          className={`size-4 text-text-dark transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 z-20 mt-1.5 w-65 rounded-xl border border-area-border-grey bg-white p-4 shadow-md">
          <p className="text-xs font-semibold text-text-grey-blue">
            Google Account
          </p>
          <div className="mt-3 flex items-center gap-3">
            <Avatar name={name} image={image} className="size-16 text-xl" />
            <div className="min-w-0">
              <p className="truncate font-bold text-text-dark">{name}</p>
              <p className="truncate text-xs text-text-grey">{email}</p>
            </div>
          </div>
          <hr className="my-4 border-area-border-grey" />
          {/* Sign out and Delete this account come in steps 3 and 5 */}
        </div>
      )}
    </div>
  );
}
