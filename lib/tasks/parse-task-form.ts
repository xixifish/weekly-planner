import { Weekday } from "@/app/generated/prisma/enums";

export function parseTaskForm(formData: FormData) {
  const description = formData.get("description");
  const dateValue = formData.get("date");
  const rawSelectedDays = formData.getAll("days");
  const repeatingValue = formData.get("repeating") === "true";
  const endDateValue = formData.get("endDate");

  // Validate: description cannot be empty
  if (typeof description !== "string" || !description.trim()) {
    throw new Error("Enter a task description");
  }

  // Validate: description cannot be longer than 1000 characters
  if (description.trim().length > 1000) {
    throw new Error("Task description is too long");
  }

  if (typeof dateValue !== "string" || !dateValue) {
    throw new Error("Choose a date");
  }

  const validWeekdays = Object.values(Weekday);

  if (
    rawSelectedDays.some(
      (day) =>
        typeof day !== "string" || !validWeekdays.includes(day as Weekday),
    )
  ) {
    throw new Error("Invalid day");
  }

  const selectedDays = rawSelectedDays as Weekday[];

  if (selectedDays.length === 0) {
    throw new Error("Choose a day");
  }

  // Reject duplicated weekdays in the submitted FormData
  if (new Set(selectedDays).size !== selectedDays.length) {
    throw new Error("Each day can only be selected once");
  }

  // Validate the date
  const date = new Date(`${dateValue}T00:00:00.000Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== dateValue
  ) {
    throw new Error("Choose a valid date");
  }

  if (typeof endDateValue !== "string") {
    throw new Error("Invalid end date");
  }

  let endDate: Date | null = null;

  if (endDateValue) {
    if (!repeatingValue) {
      throw new Error("Only a repeating task can have an end date");
    }

    endDate = new Date(`${endDateValue}T00:00:00.000Z`);

    if (
      Number.isNaN(endDate.getTime()) ||
      endDate.toISOString().slice(0, 10) !== endDateValue
    ) {
      throw new Error("Choose a valid end date");
    }

    if (endDate < date) {
      throw new Error("End date cannot be before the start date");
    }
  }

  if (!repeatingValue && selectedDays.length !== 1) {
    throw new Error("A non-repeating task must have one day");
  }

  return {
    text: description.trim(),
    days: selectedDays,
    repeating: repeatingValue,
    date,
    endDate,
  };
}
