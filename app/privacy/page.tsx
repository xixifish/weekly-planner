import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy · Weekly Planner",
};

const headingClass = "mt-8 mb-2 text-lg font-bold text-text-dark";
const listClass = "list-disc space-y-1 pl-5";

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-10 py-12 text-sm leading-relaxed text-text-dark">
      <Link
        href="/"
        className="font-bold text-logo-blue hover:text-selected-blue"
      >
        ← Weekly Planner
      </Link>

      <h1 className="mt-6 text-2xl font-extrabold">Privacy Policy</h1>
      <p className="text-text-grey">Last updated: October 25, 2026</p>

      <h2 className={headingClass}>What Weekly Planner stores</h2>
      <ul className={listClass}>
        <li>
          <span className="font-bold">From your Google account</span>, when you
          sign in: your name, email address and profile picture. Nothing else is
          requested from Google.
        </li>
        <li>
          <span className="font-bold">What you create</span>: your tasks, their
          days, end dates and labels, and which ones you have ticked.
        </li>
        <li>
          <span className="font-bold">To keep you signed in</span>: a session
          cookie, the sign-in tokens Google returns, and the IP address and
          browser type of each session.
        </li>
      </ul>

      <h2 className={headingClass}>How it is used</h2>
      <p>
        Only to run Weekly Planner: to sign you in, show your name and picture
        in the profile menu, and show your tasks. Your time zone is worked out
        from your IP address on each visit, to highlight today, and is not
        stored. There are no ads and no analytics, and your data is never sold
        or shared.
      </p>

      <h2 className={headingClass}>Where it is kept</h2>
      <p>
        The app is hosted by Vercel. The database is hosted by Neon, in its
        Sydney, Australia region.
      </p>

      <h2 className={headingClass}>Deleting your data</h2>
      <p>
        Open the profile menu and choose{" "}
        <span className="font-bold">Delete this account</span>. Your account and
        all your tasks are removed at once and cannot be recovered.
      </p>

      <h2 className={headingClass}>Google user data</h2>
      <p>
        Weekly Planner&apos;s use of information received from Google APIs
        adheres to the{" "}
        <a
          href="https://developers.google.com/terms/api-services-user-data-policy"
          className="text-logo-blue underline hover:text-selected-blue"
        >
          Google API Services User Data Policy
        </a>
        , including the Limited Use requirements.
      </p>

      <h2 className={headingClass}>Contact</h2>
      <p>Questions about your data: jing1234chen@gmail.com</p>
    </main>
  );
}
