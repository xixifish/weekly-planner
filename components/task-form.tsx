"use client";

import { useState, useTransition, useEffect, useRef } from "react";

import { CheckIcon, CrossIcon, ChevronDownIcon } from "./icons";
import { Weekday } from "@/app/generated/prisma/enums";
import { LABEL_OPTIONS } from "@/lib/tasks/labels";
import {
  addDays,
  formatWeekRange,
  toDateString,
  formatShortDate,
} from "@/lib/dates/week";
import { EndDateField } from "./end-date-field";
import {
  createTask,
  saveOneOffTask,
  deleteThisAndFutureTasks,
  CreateTaskResult,
  saveThisAndFutureTasks,
} from "@/app/actions/tasks";
import { deleteThisTaskOnly } from "@/app/actions/skips";
import type { TaskOccurrence } from "@/lib/tasks/get-week-occurrences";
import { saveThisTaskOnly } from "@/app/actions/overrides";

const WEEKDAY_OPTIONS = [
  { value: Weekday.MON, label: "Mon" },
  { value: Weekday.TUE, label: "Tue" },
  { value: Weekday.WED, label: "Wed" },
  { value: Weekday.THU, label: "Thu" },
  { value: Weekday.FRI, label: "Fri" },
  { value: Weekday.SAT, label: "Sat" },
  { value: Weekday.SUN, label: "Sun" },
];

// A pill-shaped option: a hidden checkbox inside a styled label
const pillClass =
  "flex h-8 px-4 cursor-pointer items-center justify-center rounded-md border border-area-border-grey text-sm font-semibold text-text-dark has-checked:border-select-blue has-checked:bg-select-blue has-checked:text-logo-blue has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-selected-blue hover:text-selected-blue hover:border-selected-blue transition";
// A form section with a line under it; the space above and below the line is the same
const sectionClass = "mt-4.5 border-b border-area-border-grey pb-4.5";
const sectionTitleClass = "mb-3.5 text-sm text-text-grey";
const sectionLabelClass = "font-bold text-text-dark";
// A round label option: a hidden radio inside a styled label
const swatchClass =
  "group flex size-8 cursor-pointer items-center justify-center rounded-full has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-logo-blue";
// Colour circles: a grey border, blue when selected
const colourSwatchClass = `${swatchClass} border-2 border-area-border-grey has-checked:border-logo-blue`;
// Footer buttons (Cancel, Save); each adds its own colours
const buttonClass = "h-9.5 rounded-md px-4 text-base font-bold transition";
// Items in the Delete ▾ menu: red text, filled red on hover
const menuItemClass =
  "px-3 py-2 text-left text-sm font-bold text-error-red transition hover:bg-error-red hover:text-white";
const deleteItemClass = `${menuItemClass} text-error-red hover:bg-error-red hover:text-white`;
const saveItemClass = `${menuItemClass} text-logo-blue hover:bg-logo-blue hover:text-white`;
// Full-width message banners: red for errors, grey for information
const bannerClass = "rounded-md px-3 py-1.5 text-[13px] font-normal";
const errorBannerClass = `${bannerClass} bg-error-background text-error-red-dark`;
const infoBannerClass = `${bannerClass} bg-background-grey text-text-grey-blue`;

type TaskFormProps = {
  occurrence: TaskOccurrence | null;
  onCancel: () => void;
  onSaved: () => void;
  onDeleted: () => void;
  weekStart: Date;
};

// Closes a menu when the user presses anywhere outside it
function useCloseOnClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  isOpen: boolean,
  close: () => void,
) {
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        close();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [ref, isOpen, close]);
}

export function TaskForm({
  occurrence,
  onCancel,
  onSaved,
  onDeleted,
  weekStart,
}: TaskFormProps) {
  // 1. State
  const [text, setText] = useState(occurrence?.text ?? "");
  const [days, setDays] = useState<Weekday[]>(occurrence?.days ?? []);
  // Show the error msg for empty description
  const [textTouched, setTextTouched] = useState(false);
  const [repeating, setRepeating] = useState(occurrence?.repeating ?? false);
  // The user tries to turn Repeating off while several days were selected
  const [turnOffBlocked, setTurnOffBlocked] = useState(false);
  // Save the task
  const [saving, startSaving] = useTransition();
  // A message from the server when saving failed
  const [saveError, setSaveError] = useState<string | null>(null);
  // The Delete menu of a repeating task
  const [deleteMenuOpen, setDeleteMenuOpen] = useState(false);
  // The Save menu of a repeating task
  const [saveMenuOpen, setSaveMenuOpen] = useState(false);
  // For close the dropdown menus of the delete and save buttons
  const deleteMenuRef = useRef<HTMLDivElement>(null);
  const saveMenuRef = useRef<HTMLDivElement>(null);

  useCloseOnClickOutside(deleteMenuRef, deleteMenuOpen, () =>
    setDeleteMenuOpen(false),
  );
  useCloseOnClickOutside(saveMenuRef, saveMenuOpen, () =>
    setSaveMenuOpen(false),
  );

  // The card's end date as "YYYY-MM-DD", or "" (also used as the starting value)
  const originalEndDate = occurrence?.endDate
    ? toDateString(occurrence.endDate)
    : "";

  // The end date as "YYYY-MM-DD"; "" means it repeats indefinitely
  const [endDate, setEndDate] = useState(originalEndDate);

  // 2. Handlers
  // If the day is already selected, remove it; otherwise add it
  function toggleDay(day: Weekday) {
    const nextDays = days.includes(day)
      ? days.filter((selected) => selected !== day)
      : [...days, day];

    setDays(nextDays);
    // Down to one day: the turn-off problem is solved
    if (nextDays.length <= 1) {
      setTurnOffBlocked(false);
    }
  }

  // Repeating can only be turned off when at most one day is selected
  function changeRepeating(checked: boolean) {
    if (!checked && days.length > 1) {
      setTurnOffBlocked(true);
      return;
    }

    setRepeating(checked);
    setTurnOffBlocked(false);
    // A one-off task has no end date
    if (!checked) {
      setEndDate("");
    }
  }

  // Send the form to the server
  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    // Reset the saveError
    setSaveError(null);

    startSaving(async () => {
      const result = occurrence
        ? await saveOneOffTask(occurrence.taskId, formData)
        : await createTask(formData);
      if (result.error) {
        setSaveError(result.error);
        return;
      }
      onSaved(); // close the dialog after saving the new task
    });
  }

  // Delete this card's occurrence, then close the dialog
  function handleDelete(deleteAction: (formData: FormData) => Promise<void>) {
    if (!occurrence) return;

    const formData = new FormData();
    formData.set("taskId", occurrence.taskId);
    formData.set("date", toDateString(occurrence.date));

    setSaveError(null);
    setDeleteMenuOpen(false);
    startSaving(async () => {
      try {
        await deleteAction(formData);
      } catch {
        setSaveError("Could not delete the task");
        return;
      }
      onDeleted();
    });
  }

  // Save a repeating task's edits with the chosen scope, then close the dialog
  function handleScopedSave(
    event: React.MouseEvent<HTMLButtonElement>,
    saveAction: (formData: FormData) => Promise<CreateTaskResult>,
  ) {
    const form = event.currentTarget.form;
    if (!occurrence || !form) return;

    const formData = new FormData(form);
    formData.set("taskId", occurrence.taskId);
    formData.set("date", toDateString(occurrence.date));

    setSaveError(null);
    setSaveMenuOpen(false);
    startSaving(async () => {
      const result = await saveAction(formData);
      if (result.error) {
        setSaveError(result.error);
        return;
      }
      onSaved();
    });
  }

  // 3. Calculated values
  // "Add Task", "Edit Task"
  const titleText = occurrence ? "Edit Task" : "Add Task";
  // Adding: the viewed week. Editing: the card's own date
  const titleDate = occurrence
    ? formatShortDate(occurrence.date)
    : formatWeekRange(weekStart);
  // A one-off task has exactly one day
  const tooManyDays = !repeating && days.length > 1;
  const daysError = tooManyDays
    ? "Choose one day, or turn on repeating"
    : turnOffBlocked
      ? "Leave one day to turn off repeating"
      : null;
  const textError = textTouched && text.trim() === "";
  const canSave =
    text.trim().length !== 0 && days.length !== 0 && daysError === null;
  // Repeating: starts on the week's Monday. One-off: that week's chosen day
  const dayOffset = WEEKDAY_OPTIONS.findIndex(
    (option) => option.value === days[0],
  );
  const taskDate =
    repeating || dayOffset === -1 ? weekStart : addDays(weekStart, dayOffset);
  // Editing: did days, Repeating or the end date change from the card's?
  const scheduleChanged =
    occurrence !== null &&
    (repeating !== occurrence.repeating ||
      endDate !== originalEndDate ||
      days.length !== occurrence.days.length ||
      days.some((day) => !occurrence.days.includes(day)));

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="date" value={toDateString(taskDate)} />
      <div className="-mx-7.5 -mt-5 border-b border-dark-border-grey px-7.5 py-5">
        {/* Form title */}
        <h2 id="task-dialog-title" className="text-lg text-text-dark">
          <span className="font-bold">{titleText}</span>
          <span className="text-text-grey"> · {titleDate}</span>
        </h2>
      </div>

      {/* Task fields */}
      <div className="mt-4 space-y-2">
        {textError && (
          <p role="alert" className={errorBannerClass}>
            Enter a task description
          </p>
        )}
        <textarea
          name="description"
          placeholder="Describe your task"
          maxLength={1000}
          className="block w-full mt-4 h-18 rounded-md border inset-shadow-xs px-2 py-1.5 text-lg font-semibold text-text-dark placeholder:font-medium placeholder:text-text-grey resize-none border-area-border-grey focus:border-logo-blue focus:outline-none"
          aria-label="Task description"
          aria-invalid={textError}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setTextTouched(true);
          }}
        />
      </div>

      {/* DAYS: seven weekday checkboxes and the Repeating Task toggle */}
      <fieldset className={`relative ${sectionClass}`}>
        <legend className={sectionTitleClass}>
          <span className={sectionLabelClass}>Weekdays:</span> only repeating
          task can have several days
        </legend>
        {daysError && (
          <p role="alert" className={`${errorBannerClass} mb-3`}>
            {daysError}
          </p>
        )}
        <div className="flex gap-2">
          <label className={`${pillClass} group gap-2`}>
            <input
              type="checkbox"
              name="repeating"
              value="true"
              className="sr-only"
              checked={repeating}
              onChange={(event) => changeRepeating(event.target.checked)}
            />
            <span className="flex size-5 items-center justify-center rounded-full border border-dark-border-grey text-white group-has-checked:border-check-green group-has-checked:bg-check-green">
              <CheckIcon className="hidden size-4 group-has-checked:block" />
            </span>
            Repeating
          </label>
          {/* A mode switch, not a day: keep it visually apart */}
          <span
            aria-hidden="true"
            className="mx-3 w-px self-stretch bg-area-border-grey"
          />
          {WEEKDAY_OPTIONS.map((day) => (
            <label key={day.value} className={`${pillClass} flex-1`}>
              <input
                type="checkbox"
                name="days"
                value={day.value}
                checked={days.includes(day.value)}
                onChange={() => toggleDay(day.value)}
                className="sr-only"
              />
              {day.label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* ENDS: only for a repeating task */}
      {repeating && (
        <fieldset className={sectionClass}>
          <legend className={sectionTitleClass}>
            <span className={sectionLabelClass}>End Date:</span> leave blank to
            repeat indefinitely
          </legend>
          <EndDateField
            min={toDateString(occurrence ? occurrence.date : weekStart)}
            value={endDate}
            onChange={setEndDate}
          />
        </fieldset>
      )}

      {/* LABEL: no line under it; the footer draws that one */}
      <fieldset className="mt-5">
        <legend className={sectionTitleClass}>
          <span className={sectionLabelClass}>Label:</span> optional
        </legend>
        <div className="flex gap-3">
          {LABEL_OPTIONS.map((option) => (
            <label
              key={option.value}
              title={option.label}
              className={`${colourSwatchClass} ${option.className}`}
            >
              <input
                type="radio"
                name="label"
                value={option.value}
                aria-label={option.label}
                className="sr-only"
                defaultChecked={occurrence?.label === option.value}
              />
              <CheckIcon className="hidden size-4.5 text-logo-blue group-has-checked:block" />
            </label>
          ))}

          {/* No label: selected by default */}
          <label
            title="No label"
            className={`${swatchClass} border-2 border-dark-border-grey text-button-off-grey has-checked:border-logo-blue has-checked:text-logo-blue`}
          >
            <input
              type="radio"
              name="label"
              value=""
              defaultChecked={!occurrence?.label}
              aria-label="No label"
              className="sr-only"
            />
            <CrossIcon className="size-4.5" />
          </label>
        </div>
      </fieldset>

      {/* Footer */}
      <div className="-mx-7.5 mt-5 border-t border-dark-border-grey px-7.5 pt-4">
        {saveError && (
          <p role="alert" className={`${errorBannerClass} mb-3`}>
            {saveError}
          </p>
        )}
        <div className="flex items-center justify-end gap-2">
          {/* Editing only: Delete sits on the left */}
          {occurrence &&
            (occurrence.repeating ? (
              // Repeating: Delete opens a menu with the two scopes
              <div ref={deleteMenuRef} className="relative">
                <button
                  type="button"
                  aria-expanded={deleteMenuOpen}
                  onClick={() => setDeleteMenuOpen((open) => !open)}
                  disabled={saving}
                  className={`${buttonClass} flex items-center gap-1 border border-error-red text-error-red hover:border-error-red-dark hover:text-error-red-dark`}
                >
                  Delete
                  <ChevronDownIcon className="-mr-1 size-4" />
                </button>
                {deleteMenuOpen && (
                  <div className="absolute top-full left-0 z-10 mt-2 flex w-max flex-col overflow-hidden rounded-md border border-error-red bg-white">
                    <button
                      type="button"
                      onClick={() => handleDelete(deleteThisTaskOnly)}
                      className={deleteItemClass}
                    >
                      Delete This Task Only
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(deleteThisAndFutureTasks)}
                      className={deleteItemClass}
                    >
                      Delete This and Future Tasks
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // One-off: a direct Delete, as before
              <button
                type="button"
                onClick={() => handleDelete(deleteThisTaskOnly)}
                disabled={saving}
                className={`${buttonClass} items-center gap-1 border border-error-red text-error-red hover:border-error-red-dark hover:text-error-red-dark`}
              >
                Delete
              </button>
            ))}
          <button
            type="button"
            onClick={onCancel}
            className={`${buttonClass} ml-auto border border-logo-blue text-logo-blue hover:border-selected-blue hover:text-selected-blue`}
          >
            Cancel
          </button>

          {occurrence?.repeating ? (
            // Repeating: Save ▾ opens a menu with the two scopes
            <div ref={saveMenuRef} className="relative">
              <button
                type="button"
                aria-expanded={saveMenuOpen}
                onClick={() => setSaveMenuOpen((open) => !open)}
                disabled={!canSave || saving}
                className={`${buttonClass} flex items-center gap-1 bg-logo-blue text-white hover:bg-selected-blue disabled:cursor-not-allowed disabled:bg-button-off-grey disabled:hover:bg-button-off-grey`}
              >
                Save
                <ChevronDownIcon className="-mr-1 size-4" />
              </button>

              {saveMenuOpen && (
                <div className="absolute top-full right-0 z-10 mt-2 flex w-max flex-col overflow-hidden rounded-md border border-logo-blue bg-white">
                  <button
                    type="button"
                    onClick={(event) =>
                      handleScopedSave(event, saveThisTaskOnly)
                    }
                    disabled={scheduleChanged}
                    className={`${saveItemClass} disabled:cursor-not-allowed disabled:text-button-off-grey disabled:hover:bg-white`}
                  >
                    Save This Task Only
                    {scheduleChanged && (
                      <span className="block text-[11px] font-medium text-text-grey">
                        Schedule changes apply to this and future tasks.
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(event) =>
                      handleScopedSave(event, saveThisAndFutureTasks)
                    }
                    className={saveItemClass}
                  >
                    Save This and Future Tasks
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Adding, or a one-off task: a direct Save
            <button
              type="submit"
              disabled={!canSave || saving}
              className={`${buttonClass} bg-logo-blue text-white hover:bg-selected-blue disabled:cursor-not-allowed disabled:bg-button-off-grey disabled:hover:bg-button-off-grey`}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
