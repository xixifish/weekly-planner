import { LabelColour } from "@/app/generated/prisma/enums";

// The label colours in the order the dialog shows them.
// className must be a full class name so Tailwind can find it when it scans the code
export const LABEL_OPTIONS = [
  { value: LabelColour.GREEN, label: "Green", className: "bg-tag-green" },
  { value: LabelColour.PINK, label: "Pink", className: "bg-tag-pink" },
  { value: LabelColour.PURPLE, label: "Purple", className: "bg-tag-purple" },
  { value: LabelColour.ORANGE, label: "Orange", className: "bg-tag-orange" },
  { value: LabelColour.BLUE, label: "Blue", className: "bg-tag-blue" },
  { value: LabelColour.YELLOW, label: "Yellow", className: "bg-tag-yellow" },
];
