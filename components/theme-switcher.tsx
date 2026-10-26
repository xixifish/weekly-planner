"use client";

import { useState } from "react";

const THEME_OPTIONS = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

type Theme = (typeof THEME_OPTIONS)[number]["value"];

// The theme chosen on this device; the layout put it on <html> from the cookie
function readChosenTheme(): Theme {
  const theme = document.documentElement.dataset.theme;
  return theme === "light" || theme === "dark" ? theme : "system";
}

// One year, in seconds
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

// Show the theme now, and remember it on this device for the next visit
function applyTheme(theme: Theme) {
  const root = document.documentElement;

  if (theme === "system") {
    delete root.dataset.theme;
    document.cookie = "theme=; path=/; max-age=0; samesite=lax";
  } else {
    root.dataset.theme = theme;
    document.cookie = `theme=${theme}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
  }
}

export function ThemeSwitcher() {
  const [theme, setTheme] = useState(readChosenTheme);

  return (
    <fieldset>
      <legend className="text-xs font-semibold text-text-grey-blue">
        Colour Theme
      </legend>
      <div className="mt-2 flex rounded-md bg-background-grey p-0.5">
        {THEME_OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex-1 cursor-pointer rounded-[5px] border border-transparent py-1 text-center text-sm font-semibold text-text-grey transition hover:text-link-blue-hover has-checked:border-area-border-grey has-checked:bg-surface-raised has-checked:text-text-dark has-focus-visible:outline-2 has-focus-visible:outline-link-blue"
          >
            <input
              type="radio"
              name="theme"
              value={option.value}
              checked={theme === option.value}
              onChange={() => {
                setTheme(option.value);
                applyTheme(option.value);
              }}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
