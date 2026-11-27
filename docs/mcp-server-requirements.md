# Weekly Planner MCP server: requirements

Written 26 Nov 2026. Not started. Do it later, as the one building project at a time.

## 1. Goal

Let a person's own AI app (Claude, ChatGPT, Cursor and others) read and change their Weekly
Planner tasks through MCP (Model Context Protocol). Examples:

- "What's on my plate this week?"
- "Add gym every Monday and Thursday."
- "Mark today's tasks done."
- "Move this week's swim to Friday, just this once."

## 2. Why

- **For users:** plan the week by talking to an AI they already use.

## 3. The main rule

**An AI can only ever reach the tasks of the person who connected it.** Every tool checks
ownership, the same way the web app does. If a task id belongs to someone else, the tool
answers "not found", the same as a task that doesn't exist.

## 4. Phases

Stop after each phase and decide whether to go on.

### Phase 1: read-only, on your own computer

- A local MCP server (stdio) that Claude Code or Claude Desktop starts on your machine.
- It uses your own account only: the user id comes from a local `.env` setting.
- One or two tools: `get_week` and maybe `get_today` (see section 5).
- **Never deploy this version.** It skips sign-in, so it's only safe on your own machine.

Done when: Claude Code, connected to the server, correctly answers "what's on my plate this
week?" from your real data.

### Phase 2: create and complete

- Add `create_task` and `set_task_done`.
- Still local, still your own account.

Done when: you can add a repeating task by talking to Claude, see it in the web app, and tick
it off by talking to Claude.

### Phase 3: other users can connect (remote server with sign-in)

- The server runs inside the deployed app (for example a route under `app/api/mcp`).
- Users connect with OAuth: they click "connect" in their AI app, sign in to Weekly Planner,
  approve, and the AI gets a token tied to their account only.
- The token says which user it is. The server never trusts a user id sent by the AI.
- A user can see their connected AI apps on a settings page and disconnect them.
- Guest accounts can't connect, because they are deleted after 7 days.

Done when: a second test account connects, works, and can't see your tasks.

### Phase 4: edit and delete, with a confirmation step

- Add `edit_task` and `delete_task`.
- Both require the repeating choice (see section 6).
- Delete needs a second call to confirm it: the first call returns what would be deleted, and
  the second call (with `confirm: true`) deletes it. The tool description tells the AI to ask
  the user before confirming.

## 5. Tools

Dates are `YYYY-MM-DD`. A single task on a single day is identified by `taskId` + `date`,
the same as in the app (`lib/tasks/require-owned-occurrence.ts`). Weeks follow the app's
week rules (`lib/dates/`).

| Tool            | Phase        | Inputs                                                                                        | Returns                                                                               |
| --------------- | ------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `get_week`      | 1            | `weekStart` (optional; default this week)                                                     | Each day with its tasks: `taskId`, `date`, text, label, repeating or not, done or not |
| `get_today`     | 1 (optional) | none                                                                                          | Today's tasks, same fields                                                            |
| `create_task`   | 2            | `text`, `days` (weekdays), `repeating`, `startDate`, `endDate` (optional), `label` (optional) | The new task                                                                          |
| `set_task_done` | 2            | `taskId`, `date`, `done` (true or false)                                                      | The task's new state                                                                  |
| `edit_task`     | 4            | `taskId`, `date`, `scope` (`this_only` or `this_and_future`), new text, days and/or label     | The changed task                                                                      |
| `delete_task`   | 4            | `taskId`, `date`, `scope`, `confirm`                                                          | First call: what would be deleted. With `confirm: true`: the result                   |

Rules for every tool:

- Check inputs the same way the web forms do (`lib/tasks/parse-task-form.ts`): text length
  up to 1,000 characters, real dates, valid weekdays and labels.
- Error messages are short and plain, so the AI can explain them to the user ("That task
  wasn't found", "End date is before start date").
- Each tool description says clearly what it does and what it changes. The AI reads these
  descriptions to choose a tool.

## 6. Repeating tasks

For a repeating task, the user's request can mean "just this one" or "this and all future
ones". The app already asks people this. The tools must too:

- `scope` is a required input on `edit_task` and `delete_task`. No default.
- The tool description tells the AI: "If the user didn't say, ask them before calling."
- Past weeks never change, the same as in the app (versioned rules in `TaskRule`).

## 7. Changes needed in the existing code

- **Who the user is.** Today the server actions get the user from the browser cookie
  (`lib/current-user.ts`, `requireCurrentUser`), and `requireOwnedOccurrence` reads
  `FormData`. MCP calls have no cookie and no form. So split each action into two parts:
  1. A core function that takes `userId` plus plain inputs and does the work, with the
     ownership check inside it.
  2. A thin wrapper: the server action gets the user from the cookie, and the MCP tool gets
     the user from the token (phase 3) or `.env` (phases 1–2). Both call the same core function.
- No second copy of the task logic. The web app and the MCP tools must always behave the
  same way.
- Existing tests must still pass after the split.

## 8. Testing

**Code tests (Vitest):**

- Each core function, including: another user's `taskId` returns "not found" and changes
  nothing.
- `scope` missing on edit or delete is rejected.
- Delete without `confirm` changes nothing.
- Database tests for create, complete, edit and delete, like `app/actions/tasks.db.test.ts`.

**Real-request tests (the evaluation):**

- Write 10–15 real requests the way a person would type them, for example: "what's on
  Thursday?", "add yoga every weekday morning", "I didn't go to gym today, untick it",
  "change Monday's meeting to Tuesday" (should ask: just this one or all future ones?).
- For each, write the expected result **before** running it, like the Popcorn test queries.
- Run them through Claude with the server connected. Record pass or fail and what went wrong.
- Re-run after each change to the tool descriptions.

## 9. Not in scope

- Natural-language parsing inside the app. The user's AI does the understanding; the server
  only offers clear tools.
- Calling an LLM from the Weekly Planner app itself, or paying for any AI usage.
- Sharing tasks between users.
- Reminders or notifications.

## 10. Check before starting

- The current MCP TypeScript SDK (`@modelcontextprotocol/sdk`): how to make a stdio server
  (phase 1) and a remote HTTP server (phase 3).
- Whether Better Auth (already used, v1.7) has an MCP or OAuth provider plugin for phase 3.
  Read its docs instead of building OAuth by hand.
- Next.js in this repo is a newer version with breaking changes: read
  `node_modules/next/dist/docs/` before adding a route (see `AGENTS.md`).
- Rate limits for phase 3, so a looping AI can't flood the database.
