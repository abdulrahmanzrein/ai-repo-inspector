import { exec } from "node:child_process";
import type { ValidationResult } from "./types.js";

export function runValidation(command: string, cwd: string): Promise<ValidationResult> {
  return new Promise((resolve) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      // a command failing is a totally normal thing to happen here - that's
      // the whole reason someone runs a validation. so we resolve with a
      // "failed" result instead of rejecting, which used to blow up the
      // entire review just because one check came back red.
      if (error) {
        resolve({ command, status: "failed", output: stdout || stderr || error.message });
        return;
      }
      resolve({ command, status: "passed", output: stdout || stderr });
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