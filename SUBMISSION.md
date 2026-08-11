# Submission

## What did you investigate first, and why?

First, I read through all the code to understand it. It's a small codebase spread across 7 source files, so there was little reason not to. core.ts contains the orchestration logic, and cli.ts and mcp-server.ts merely wrap it.

I wanted to understand the differences between the interfaces before trying to answer the question, not after.

## What did you choose to implement or fix?

I found and fixed 6 bugs - each with a before/after demonstration attached, because I didn't want to assume that the fix actually fixed the issue:

1. MCP was reading the invalid field name repoPath instead of the schema's repo_path, causing real reviews to inspect wrong paths

2. A failing validate command caused the review to fail catastrophically instead of just reporting validation failure

3. Validation output was leaking ANSI color codes into the markdown report

4. The base-ref was hardcoded to main, preventing use of master

5. There was no timeout for validate commands, allowing permanent hangs

6. MCP interface allowed command injection via validationCommands

For each issue, I confirmed it first, then verified it again after the fix to make sure it's actually gone. For most issues, I even prepared a separate validation script committed in a separate change. For a couple issues (ANSI leak and base-ref), I ran a one-off command to verify, so they're grouped in one commit.

## What did you intentionally not do?

I did not blindly accept the suggestions from the agents - I always tried to understand the issues and their context first, and validate them myself. I also avoided speculative cleanup or refactors that were not tied to a confirmed issue, so each change stayed scoped to a specific verified problem.

## Interface decision

Decision: hybrid

Primary user and execution environment:
A developer running local repository reviews from a terminal (CLI), and an MCP client invoking the same review flow during an agent workflow.

Trust boundary and allowed capabilities:
CLI is a local human-operated interface where shell access already exists, so allowing validate commands does not create new privilege. MCP is an agent-facing interface where arguments can be influenced by untrusted external text, so unrestricted shell command execution is unsafe. I removed validationCommands from MCP while keeping them in CLI.

Reliability, discoverability, latency/context, and output tradeoffs:
Hybrid preserves one shared implementation path for core review behavior, which improves reliability and consistency while keeping maintenance small. CLI remains best for local discoverability and interactive workflows with explicit validation commands. MCP remains safer and lighter by returning changed-file analysis only, which also reduces output and execution risk.

How supported interfaces remain consistent:
Both adapters use the same reviewRepository() orchestration logic and share internals for changed-file detection, validation-specific resolution, and report generation where applicable. They also share cross-cutting logic, such as handling validation failures and resolving base-ref fallback policy, while retaining interface-specific policy logic in each adapter.

Evidence that would change this decision:
If using MCP can be guaranteed to only happen under human control and trust boundary, with no possibility for providing any input or prompt to untrusted external entities, the risk would be mitigated and CLI/MCP parity would be safer to implement.

## How did you use an AI coding agent?

I used mostly Claude Code, using it to write validation scripts, implement fixes, and suggest commit messages. I tried to use a verify-first paradigm at all times: find an issue in production, show that it's present in a test setup, fix it, and show that the fix works. I also used context files, prompt engineering and various skills in order to make sure the agent is doing exactly what I want it to do.

## Where did you check, correct, or reject an AI suggestion? (required)

I always made sure to understand the issues and their context before accepting any of the agent's suggestions. I reviewed all changes line by line, made sure that the actual issue is fixed, and that the tests are updated if needed.

One example: I saw an editor suggestion to modify TypeScript config/dependencies while working on the validation crash fix. I ran npm run typecheck first, and everything was fine - it was an editor-level warning, not a real project-level TypeScript error, so I didn't make the config or dependency changes the editor suggested.

## Commands used to verify the result, with outcomes

```bash
npm install && npm run typecheck && npm test
node scripts/repro-mcp-bug.mjs                  # undefined path -> real path
./scripts/repro-validation-crash.sh               # crash -> "(failed)" in report
npm run inspector -- review --repo . --validate "npm test"    # ANSI junk -> clean
npm run inspector -- review --repo /tmp/repro-baseref-repo    # crash -> works
./scripts/repro-validation-hang.sh                # no cap -> capped (verified via override)
node scripts/repro-mcp-injection.mjs               # $(whoami) executes -> empty output
```

## A blocker you hit and how you approached it

You cannot run MCP server in isolation and expect it to exhibit any bugs; it's a tool for other programs to use. I used the MCP SDK's client classes to actually call the server and invoke the tool, not faking the traffic manually.

## Known limitations and the next three things you would do

1. Write tests that directly test each of the changes made in this session

2. Limit or cap the output size for the MCP interface

3. Revisit the MCP capabilities to ensure that they're not overly broad in general

## Approximate focused-work time

Start: 2026-08-11, ~14:30
Finish: 2026-08-11, ~15:55
