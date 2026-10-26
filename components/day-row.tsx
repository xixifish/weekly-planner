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
      className={`flex min-h-25 px-10 py-7 border-b border-area-border-grey relative ${isToday ? "bg-today-yellow" : "bg-surface"}`}
    >
      {/* Today: orange edge on the left */}
      {isToday && (
        <div className="absolute inset-y-0 left-0 w-1 bg-logo-orange" />
      )}

      {/* Left: day name, number and summary */}
      <div className="w-[138px] shrink-0">
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
      <ul className="flex flex-wrap gap-x-3 gap-y-[17px]">
        {occurrences.map((occurrence) => (
          <TaskCard key={occurrence.taskId} occurrence={occurrence} />
        ))}
      </ul>
    </section>
  );
}
