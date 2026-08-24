# Weekly Planner — Design

A planner for one week at a time. Seven day rows, one per day. Tasks are small cards you add, tick off, and repeat.

Design finished **23 August 2026**, before any code was written.

Figma file: https://www.figma.com/design/PMOiVwojpmtcMso4lWKBma/weekly-planner

---

## 1. The week view

One week fills the screen. Seven day rows, stacked.

Each row has the day name and a "N/M done" count on the left, and the task cards to the right.

- Cards are 220px wide, in a row that wraps. Five fit at 1440px, four at 1200, three at 1024.
- A row grows taller when its cards wrap: 100px by default, plus 61px for each extra line.
- Today's row has an orange left edge, a pale yellow background, and an orange day name.
- A weekly progress bar sits top right, with a done/total count.
- Minimum width is 1024px. Below that is phone territory, which v1 does not cover.

**Old undone tasks stay in their past week.** Nothing rolls forward. This works like a paper planner — last week stays last week.

---

## 2. What a task is

A task has: text, the days it falls on, a repeat flag, an optional due date, and an optional label colour.

**Text is the only required field.** A task cannot be saved without it. Days, repeat, due date and label are all optional.

**Text.** One line on the card, cut off with "…" when it is too long. Hovering the card shows the full text. The edit box shows all of it.

**Days.** Pick any days of the week. "Daily" is only a shortcut for picking all seven — it lights up if you pick all seven by hand.

**Due date.** Optional, a single date. A stopwatch icon appears on the card, and turns red once the date has passed.

**Label.** Colour only in v1, no names. Six colours, or none.

---

## 3. Repeats

This is the part most planners skip, and the part worth getting right.

Ticking "repeat in future weeks" on a task created in week 20 with Wed and Fri means: the task shows on Wed and Fri of week 20, **and every week after that, with no end date.**

Because "every week after week 20" never ends, the app cannot create rows in advance. So:

- **One row per task rule** — text, days, start week, repeat flag, optional end week, due date, label.
- **The week's cards are worked out when you open the week**, from those rules.
- **A separate exceptions table** holds anything that only applies to one week.
- **A one-off task is the same rule with repeat off.** One table covers both.

Deleting all future weeks from week N does not delete the rule. It sets the rule's end week to N-1, so weeks 20 to N-1 still show it.

**Ticking a task done is per week.** Done in week 20 does not tick it in week 21.

---

## 4. Editing and deleting

Because a repeat task lives in many weeks, changing one is ambiguous. So both editing and deleting ask the same question:

> This week only, or this and all future weeks?

"This week only" writes an exception. "This and all future" changes the rule.

**Deleting a task has no confirm box.** It deletes, and an Undo bar appears for about five seconds. A confirm box costs a click every single time, which fights the whole point of the app being quick. The this-week/all-future choice already provides a pause for the risky case.

**Deleting your account is the exception. It does get a real confirm**, because it cannot be undone.

---

## 5. The card

States: plain, has a due date, overdue, done, hover.

**The coloured left bar is the label the user picked.** It never changes to show state. A done task keeps its own colour.

- **Done**: green filled tick, greyed text. The left bar stays the label colour.
- **Overdue**: the stopwatch icon turns red.
- **Hover**: the tick button appears straight away. Its space is reserved in the resting card, so the text does not shift when you hover.
- **Hover, after about 400ms**: the full text appears above the card, but only when the text is actually cut off. The delay stops it flashing as the mouse crosses a row. It is at most 280px wide, ignores the mouse, and flips sides near the edge of the window.

**A due date on a repeating task belongs to the rule.** It shows in every week, and stays red once the date has passed. To get rid of it, edit the task and remove the due date. This keeps one rule instead of a special case, and the way out is one click.

---

## 6. Adding and editing a task

The dialog has: the task text, the day picker, the repeat toggle, the due date picker, and the label colours.

**The text input is a box, not a single line.** It has a fixed height and scrolls when the text is long, so the dialog can never grow past the screen. There is no character limit shown to the user — a limit would only be treating the symptom. Enter saves; a task title does not have line breaks. Save stays off until there is text — no error message needed, the button simply is not available. Spaces alone do not count as text. The database keeps a quiet 500-character cap as a backstop.

---

## 7. Accounts

**Sign in with social accounts only.** No email and password.

**The profile dropdown has four things**: name, email, Log out, Delete my account.

Four, not one, because social sign-in means you need to see *which* account you are in, and because storing someone's data means giving them a way to remove it. The avatar itself must never log you out — the dropdown is the safety.

**There is no settings page.** Those four items make one unnecessary.

**A new user sees the empty week** after signing in, the same as before signing in. No onboarding, no sample data.

---

## 8. Cut from v1, and why

| Cut | Why |
|---|---|
| Phone layout | Below 1024px is a different design, not a smaller one. v1 is desktop. |
| Drag a card to another day | The edit dialog already moves a task by changing its days. Drag is polish. It is also a different action — dragging one card changes one week, changing days changes every week. |
| Label names | Colours are enough to group things. Labels are still stored with an id, so names can be added later without a migration. |
| Carry unfinished tasks forward | A paper planner does not do it, and it hides the fact you did not do the thing. |
| Settings page | The four dropdown items cover everything a settings page would hold. |
| Clickable Figma prototype | A prototype exists to show an idea to someone before it is built. I am both the designer and the builder, and the live app is the demo. |

---

## 9. Numbers and colours

**Layout.** Header 60px · week title bar 121px · card 220x44 with a 6px coloured left bar · column pitch 232px · day row 100px, +61px per extra line · add button 72px, bottom right.

**Colours.** blue `#0084d9` · orange `#ff7700` · text dark `#303741` · text grey `#999999` · text grey-blue `#99a7bd` · card border `#f2f2f2` · area border `#ececec` · today `#fffcf5` · done green `#06ad06`.

**Labels.** red `#ff7778` · purple `#e283f5` · blue `#77afff` · yellow `#f5dd8e`, plus green and orange. Six, plus none.

---

## 10. A note on the drawings

The numbers in the Figma frames are placeholders. The day counts and the progress bar are there to show the layout, not to add up. The rules behind them are written above — those are what gets built.

---

## Not in this document

The stack, the database schema and the build order. Those go in the build notes. The direction is settled — one rules table plus one exceptions table — but the rest is a build decision, not a design one.
