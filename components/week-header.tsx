import Link from "next/link";

import { ChevronLeftIcon, ChevronRightIcon } from "./icons";
import { ProgressBar } from "./progress-bar";
import {
  addDays,
  getIsoWeek,
  getWeeksInYear,
  toDateString,
  formatWeekRange,
} from "@/lib/dates/week";

type WeekHeaderProps = {
  weekStart: Date;
  doneCount: number;
  totalCount: number;
};

const navButtonClass =
  "flex h-7.5 items-center justify-center rounded-[5px] border border-area-border-grey bg-surface text-link-blue transition hover:border-link-blue-hover hover:text-link-blue-hover";

export function WeekHeader({
  weekStart,
  doneCount,
  totalCount,
}: WeekHeaderProps) {
  const { week, year } = getIsoWeek(weekStart);
  const weeksInYear = getWeeksInYear(year);
  const previousWeek = toDateString(addDays(weekStart, -7));
  const nextWeek = toDateString(addDays(weekStart, 7));

  return (
    <section className="flex flex-col gap-4 border-b border-area-border-grey bg-surface px-4 py-5 md:h-[121px] md:flex-row md:items-center md:justify-between md:gap-0 md:py-0 md:px-10">
      {/* Left: week number, dates, navigation */}
      <div className="flex-1">
        <p className="text-xs font-bold text-text-grey-blue">
          WEEK <span className="text-logo-orange">{week}</span> OF {weeksInYear}{" "}
          · {year}
        </p>
        <div className="flex flex-wrap items-center">
          <h1 className="text-[24px] font-extrabold text-text-dark md:w-52 md:text-[30px]">
            {formatWeekRange(weekStart)}
          </h1>
          <nav
            aria-label="Week"
            className="ml-auto flex items-center gap-1.5 md:ml-6"
          >
            <Link
              href={`/?week=${previousWeek}`}
              aria-label="Previous week"
              className={`${navButtonClass} w-7.5`}
            >
              <ChevronLeftIcon className="size-5" />
            </Link>
            <Link
              href={`/?week=${nextWeek}`}
              aria-label="Next week"
              className={`${navButtonClass} w-7.5`}
            >
              <ChevronRightIcon className="size-5" />
            </Link>
            <Link
              href="/"
              className={`${navButtonClass} md:ml-3.5 w-16 text-sm font-semibold`}
            >
              Today
            </Link>
          </nav>
          {/* An empty week: a prompt, in line with the navigation */}
          {totalCount === 0 && (
            <p className="mt-3 w-full text-sm font-bold text-logo-orange md:mt-0 md:ml-auto md:w-auto md:text-base">
              Add a task to start a productive week!
            </p>
          )}
        </div>
      </div>
      {/* Right: the week's progress */}
      {totalCount > 0 && <ProgressBar done={doneCount} total={totalCount} />}
    </section>
  );
}
