import Link from "next/link";

import { ChevronLeftIcon, ChevronRightIcon } from "./icons";
import { ProgressBar } from "./progress-bar";
import {
  addDays,
  getIsoWeek,
  getWeeksInYear,
  toDateString,
} from "@/lib/dates/week";

type WeekHeaderProps = {
  weekStart: Date;
  doneCount: number;
  totalCount: number;
};

// "Mon dayNum - (Mon) dayNum"
function formatWeekRange(weekStart: Date) {
  const weekEnd = addDays(weekStart, 6);
  const month = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });

  const start = `${month(weekStart)} ${weekStart.getUTCDate()}`;
  const end =
    month(weekStart) === month(weekEnd)
      ? `${weekEnd.getUTCDate()}`
      : `${month(weekEnd)} ${weekEnd.getUTCDate()}`;

  return `${start} - ${end}`;
}

const navButtonClass =
  "flex h-7.5 items-center justify-center rounded-[5px] border border-area-border-grey bg-white text-logo-blue hover:border-logo-blue";

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
    <section className="flex h-[121px] items-center justify-between border-b border-area-border-grey bg-white px-10">
      {/* Left: week number, dates, navigation */}
      <div>
        <p className="text-xs font-bold text-text-grey-blue">
          WEEK <span className="text-logo-orange">{week}</span> OF {weeksInYear}{" "}
          · {year}
        </p>
        <div className="flex items-center">
          <h1 className="w-52 text-[30px] font-extrabold text-text-dark">
            {formatWeekRange(weekStart)}
          </h1>
          <nav aria-label="Week" className="ml-6 flex items-center gap-1.5">
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
              className={`${navButtonClass} ml-3.5 w-16 text-sm font-semibold`}
            >
              Today
            </Link>
          </nav>
        </div>
      </div>

      {/* Right: progress, or a prompt when the week is empty */}
      {totalCount > 0 ? (
        <ProgressBar done={doneCount} total={totalCount} />
      ) : (
        <p className="text-base font-extrabold text-logo-orange">
          Add a task to start a brand new week!
        </p>
      )}
    </section>
  );
}
