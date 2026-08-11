import { execFileSync } from "node:child_process";
import type { ChangedFile } from "./types.js";

function git(repositoryPath: string, args: string[]): string {
  return execFileSync("git", args, {
    cwd: repositoryPath,
    encoding: "utf8",
  }).trim();
}

// not every repo calls its default branch "main" - plenty of older repos
// still use "master". rather than hardcode one and crash on the other,
// try both and only give up if neither exists.
function resolveBaseRef(repositoryPath: string, baseRef?: string): string {
  if (baseRef) {
    return baseRef;
  }
  for (const candidate of ["main", "master"]) {
    try {
      // stdio is silenced here on purpose - a missing branch is an expected
      // outcome while probing, not a real error worth printing to the user
      execFileSync("git", ["rev-parse", "--verify", candidate], {
        cwd: repositoryPath,
        stdio: "ignore",
      });
      return candidate;
    } catch {
      // try the next candidate
    }
  }
  throw new Error(
    'Could not find a "main" or "master" branch to diff against. Pass --base-ref <branch> to specify one.',
  );
}

export function changedFiles(repositoryPath: string, baseRef?: string): ChangedFile[] {
  const base = resolveBaseRef(repositoryPath, baseRef);
  const output = git(repositoryPath, ["diff", "--name-status", `${base}...HEAD`]);

  return output
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [code, ...pathParts] = line.split("\t");
      const status = code === "A" ? "added" : code === "D" ? "deleted" : "modified";
      return { path: pathParts.join("\t"), status };
    });
}