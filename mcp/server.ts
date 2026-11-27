import "./load-env";

import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";

import { getWeekDates } from "@/lib/dates/get-week-dates";
import { getToday, resolveTimeZone } from "@/lib/dates/today";
import { getWeekday, parseWeekParam, toDateString } from "@/lib/dates/week";
import { getWeekOccurrencesForUser } from "@/lib/tasks/get-week-occurrences-for-user";

// Phase 1: the server always acts as one account, set in .env, never chosen by the AI
const userId = process.env.MCP_USER_ID;
if (!userId) {
  throw new Error("MCP_USER_ID is missing: add your user id to .env");
}

// The AI app starts this file and talks to it through stdin and stdout
serveStdio(() => {
  const server = new McpServer({ name: "weekly-planner", version: "0.1.0" });

  // A test tool: proves the AI app can reach the server
  server.registerTool(
    "get_week",
    {
      title: "Get week",
      description:
        "List the user's Weekly Planner tasks for one week (Monday to Sunday), " +
        "day by day, with whether each task is done. Use it for questions like " +
        '"what\'s on this week?" or "what do I have on Thursday?". ' +
        "Read-only: it changes nothing.",
      inputSchema: z.object({
        weekStart: z.iso
          .date()
          .optional()
          .describe(
            "Any date in the week, as YYYY-MM-DD. Leave it out for this week.",
          ),
      }),
    },
    async ({ weekStart }) => {
      // Uses this computer's time zone for "today"
      const today = getToday(resolveTimeZone(null));
      const monday = parseWeekParam(weekStart, today);
      const occurrences = await getWeekOccurrencesForUser(userId, monday);

      const days = getWeekDates(monday).map((date) => ({
        date: toDateString(date),
        weekday: getWeekday(date),
        tasks: occurrences
          .filter((occurrence) => occurrence.date.getTime() === date.getTime())
          .map((occurrence) => ({
            taskId: occurrence.ruleId,
            text: occurrence.text,
            label: occurrence.label,
            repeating: occurrence.repeating,
            done: occurrence.completed,
          })),
      }));

      const week = {
        today: toDateString(today),
        weekStart: toDateString(monday),
        days,
      };
      return {
        content: [{ type: "text", text: JSON.stringify(week, null, 2) }],
      };
    },
  );

  return server;
});

// stdout carries the messages to the AI app, so logs must go to stderr
console.error("Weekly Planner MCP server is running");
