import type { TaskOccurrence } from "@/lib/tasks/build-occurrences";
import { TaskCard } from "./task-card";

type DayRowProps = {
  date: Date;
  isToday: boolean;
  occurrences: TaskOccurrence[];
};

export function DayRow({ date, isToday, occurrences }: DayRowProps) {
  const dayName = date.toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: "UTC",
  });

  const dayNumber = date.getUTCDate();

  const doneCount = occurrences.filter(
    (occurrences) => occurrences.completed,
  ).length;

  const summary =
    occurrences.length === 0
      ? "No tasks added"
      : `${doneCount}/${occurrences.length} done`;

  return (
    <section
      className={`relative flex flex-col gap-3 border-b border-area-border-grey px-4 py-5 md:min-h-25 md:px-10 md:flex-row md:gap-0 md:py-7 ${isToday ? "bg-today-yellow" : "bg-surface"}`}
    >
      {/* Today: orange edge on the left */}
      {isToday && (
        <div className="absolute inset-y-0 left-0 w-1 bg-logo-orange" />
      )}

      {/* Left: day name, number and summary */}
      <div className="shrink-0 md:w-[138px]">
        <p
          className={`text-[18px] ${isToday ? "text-logo-orange" : "text-text-dark"}`}
        >
          <span className="font-bold">{dayName}</span> {dayNumber}
        </p>
        <p className="text-[11px] font-semibold text-text-grey-blue">
          {summary}
        </p>
      </div>

      {/* Right: cards, wrapping onto new lines */}
      <ul className="flex flex-col gap-3 empty:hidden md:flex-row md:flex-wrap md:gap-x-3 md:gap-y-4">
        {occurrences.map((occurrence) => (
          <TaskCard key={occurrence.taskId} occurrence={occurrence} />
        ))}
      </ul>
    </section>
  );
}
