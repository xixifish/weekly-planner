import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";

// The AI app starts this file and talks to it through stdin and stdout
serveStdio(() => {
  const server = new McpServer({ name: "weekly-planner", version: "0.1.0" });

  // A test tool: proves the AI app can reach the server
  server.registerTool(
    "ping",
    { description: "Check that the Weekly Planner server is running" },
    async () => ({ content: [{ type: "text", text: "pong" }] }),
  );

  return server;
});

// stdout carries the messages to the AI app, so logs must go to stderr
console.error("Weekly Planner MCP server is running");
