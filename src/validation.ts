import { exec } from "node:child_process";
import type { ValidationResult } from "./types.js";

// vitest, eslint, and pretty much every other cli tool colorize their
// terminal output with ansi escape codes. looks great in a real terminal,
// turns into unreadable junk once that same string gets dropped into a
// markdown file, so we strip it before it ever reaches the report.
const ANSI_ESCAPE_PATTERN = /\x1B\[[0-9;]*[a-zA-Z]/g;

function stripAnsi(text: string): string {
  return text.replace(ANSI_ESCAPE_PATTERN, "");
}

export function runValidation(command: string, cwd: string): Promise<ValidationResult> {
  return new Promise((resolve) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      // a command failing is a totally normal thing to happen here - that's
      // the whole reason someone runs a validation. so we resolve with a
      // "failed" result instead of rejecting, which used to blow up the
      // entire review just because one check came back red.
      if (error) {
        resolve({ command, status: "failed", output: stripAnsi(stdout || stderr || error.message) });
        return;
      }
      resolve({ command, status: "passed", output: stripAnsi(stdout || stderr) });
    });
  });
}

export async function runValidations(commands: string[], cwd: string): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];
  for (const command of commands) {
    results.push(await runValidation(command, cwd));
  }
  return results;
}