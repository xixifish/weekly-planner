"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

import { useCloseOnClickOutside } from "@/lib/use-close-on-click-outside";
import { errorBannerClass } from "./banner-styles";
import { SignInAgainButton } from "./sign-in-again-button";
import { ThemeSwitcher } from "./theme-switcher";

import { ChevronDownIcon, AlertIcon } from "./icons";
import { authClient } from "@/lib/auth-client";

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

// Items in the profile menu, like "Sign out"
const menuItemClass =
  "block w-full text-left text-sm font-semibold text-text-dark transition";

export function ProfileMenu({ name, email, image }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useCloseOnClickOutside(menuRef, open, () => setOpen(false));

  const confirmRef = useRef<HTMLDialogElement>(null);

  // A failed delete's message, and whether signing in again would fix it
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Close the menu, then ask before deleting anything
  function openDeleteConfirm() {
    setOpen(false);
    setDeleteError(null);
    setNeedsSignIn(false);
    confirmRef.current?.showModal();
  }

  const router = useRouter();

  // Ends the session, then reloads the page's data as a signed-out visitor
  async function handleSignOut() {
    await authClient.signOut();
    router.refresh();
  }

  // Delete the account and all its data, then show the signed-out page
  async function handleDeleteAccount() {
    setDeleteError(null);
    setNeedsSignIn(false);
    setDeleting(true);
    const { error } = await authClient.deleteUser();
    setDeleting(false);

    if (error) {
      // Better Auth only deletes after a recent sign-in
      if (error.code === "UNAUTHORIZED") {
        // Signed out
        setDeleteError("Your session has expired.");
        setNeedsSignIn(true);
      } else if (error.code === "SESSION_EXPIRED") {
        // Signed in, but too long ago for deleting
        setDeleteError(
          "For your security, please sign in again to delete your account.",
        );
        setNeedsSignIn(true);
      } else {
        setDeleteError("Couldn't delete your account. Please try again.");
      }
      return;
    }
    confirmRef.current?.close();
    router.refresh();
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 transition hover:border-link-blue-hover ${open ? "border-link-blue-hover" : "border-area-border-grey"}`}
      >
        <Avatar name={name} image={image} className="size-9 text-sm" />
        <ChevronDownIcon
          className={`size-4 text-text-dark transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 z-20 mt-1.5 w-65 rounded-xl border border-area-border-grey bg-surface p-4 shadow-md">
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
          <ThemeSwitcher />
          <hr className="my-4 border-area-border-grey" />
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleSignOut}
              className={`${menuItemClass} hover:text-link-blue-hover`}
            >
              Sign out
            </button>
            <button
              type="button"
              onClick={openDeleteConfirm}
              className={`${menuItemClass} hover:text-delete-red-hover`}
            >
              Delete this account
            </button>
          </div>
          <hr className="my-4 border-area-border-grey" />
          <Link
            href="/privacy"
            className="text-xs font-semibold text-text-grey transition hover:text-link-blue-hover"
          >
            Privacy Policy
          </Link>
        </div>
      )}
      {/* Deleting an account can't be undone, so it gets a real confirmation */}
      <dialog
        ref={confirmRef}
        aria-labelledby="delete-account-title"
        aria-describedby="delete-account-text"
        className="m-auto w-100 rounded-xl bg-surface px-7.5 py-8 text-center backdrop:bg-black/40"
      >
        <AlertIcon className="mx-auto size-8 text-delete-red" />
        <h2
          id="delete-account-title"
          className="mt-3 text-lg font-extrabold text-text-dark"
        >
          Delete Account
        </h2>
        <p
          id="delete-account-text"
          className="mt-1 font-medium text-sm text-text-dark"
        >
          This permanently deletes your account and all your tasks. It
          can&apos;t be undone.
        </p>
        {deleteError && (
          <p role="alert" className={`${errorBannerClass} mt-6`}>
            {deleteError}
            {needsSignIn && (
              <>
                {" "}
                <SignInAgainButton />
              </>
            )}
          </p>
        )}
        <div
          className={`${deleteError ? "mt-4" : "mt-8"} flex justify-center gap-3`}
        >
          <button
            type="button"
            onClick={() => confirmRef.current?.close()}
            className="h-9.5 rounded-md border border-link-blue px-4 font-bold text-link-blue transition hover:border-link-blue-hover hover:text-link-blue-hover"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="h-9.5 rounded-md bg-error-red px-4 font-bold text-white transition hover:bg-error-red-dark"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </dialog>
    </div>
  );
}
