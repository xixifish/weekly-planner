"use client";

import { useRef } from "react";

import { AddIcon, CrossIcon } from "./icons";
import { formatLongDate } from "@/lib/dates/week";

type EndDateFieldProps = {
  min: string;
  // The date to start with, as "YYYY-MM-DD"; "" for none
  value: string;
  onChange: (value: string) => void;
};

// Same look as the day pills: plain until a date is chosen, then blue
const pillBaseClass =
  "flex h-8.5 items-center rounded-md border text-sm font-semibold transition";
const pillIdleClass =
  "border-area-border-grey bg-white text-text-dark hover:border-selected-blue hover:text-selected-blue";
const pillSelectedClass = "border-select-blue bg-select-blue text-logo-blue";

const hintClass = "text-[13px] text-text-grey-blue";

export function EndDateField({ min, value, onChange }: EndDateFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function openPicker() {
    inputRef.current?.showPicker();
  }

  return (
    <div className="flex items-center gap-3">
      {value === "" ? (
        <>
          <button
            type="button"
            onClick={openPicker}
            className={`${pillBaseClass} ${pillIdleClass} gap-1.5 px-3`}
          >
            <AddIcon className="size-3.5" />
            Add End Date
          </button>
          <p className={hintClass}>
            Optional: Leave blank to repeat indefinitely
          </p>
        </>
      ) : (
        <>
          <span className={`${pillBaseClass} ${pillSelectedClass}`}>
            <button
              type="button"
              onClick={openPicker}
              aria-label={`Change end date, ${formatLongDate(value)}`}
              className="h-full pr-1.5 pl-3 transition hover:text-selected-blue"
            >
              {formatLongDate(value)}
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Remove end date"
              className="flex h-full items-center pr-3 pl-1 transition hover:text-selected-blue"
            >
              <CrossIcon className="size-3.5" />
            </button>
          </span>
          <p className={hintClass}>Repeats until {formatLongDate(value)}</p>
        </>
      )}

      {/* Hidden: opened by the buttons above, and sent with the form */}
      <input
        ref={inputRef}
        type="date"
        name="endDate"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        min={min}
        tabIndex={-1}
        className="sr-only"
      />
    </div>
  );
}
