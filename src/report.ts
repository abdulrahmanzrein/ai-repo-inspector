import type { ChangedFile, ValidationResult } from "./types.js";

type ReportInput = {
  repositoryPath: string;
  changedFiles: ChangedFile[];
  validationResults: ValidationResult[];
};

export function markdownReport(input: ReportInput): string {
  const lines = [`# Review Report: ${input.repositoryPath}`, "", "## Changed files"];
  for (const file of input.changedFiles) {
    lines.push(`- ${file.path} (${file.status})`);
  }
  lines.push("", "## Validation output");
  for (const result of input.validationResults) {
    // the point of catching a failed command is telling the reader it
    // failed - just dumping the output without saying pass/fail makes
    // them guess, so the status goes right in the heading
    lines.push(`### ${result.command} (${result.status})`, "```", result.output, "```");
  }
  return lines.join("\n");
}