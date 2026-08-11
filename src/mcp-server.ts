#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { reviewRepository } from "./core.js";

const server = new McpServer({ name: "repository-inspector", version: "2.0.0" });

// no validationCommands here on purpose - that would let any mcp caller
// run arbitrary shell commands through this tool. fine for a human at the
// cli (they already have shell access to their own machine), not fine for
// an ai agent whose tool arguments can be shaped by untrusted content it
// read elsewhere. mcp only ever gets the "what changed" part of a review.
server.tool(
  "review_repository",
  "Inspects a Git repository and returns a review report of changed files. Does not run validation commands - use the CLI for that.",
  {
    repo_path: z.string().describe("Repository path to inspect."),
    baseRef: z.string().optional(),
  },
  async (input: any) => {
    const report = await reviewRepository({
      repositoryPath: input.repo_path,
      baseRef: input.baseRef,
    });
    return { content: [{ type: "text", text: report }] };
  },
);

await server.connect(new StdioServerTransport());