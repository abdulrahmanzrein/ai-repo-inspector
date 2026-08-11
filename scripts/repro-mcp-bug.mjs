import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "node:url";
import path from "node:path";

// scratch repro, not part of the tool itself. just acts like a real mcp client
// would - spawn the actual server, call the actual tool, see what comes back
const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const client = new Client({ name: "repro-client", version: "0.0.0" });
const transport = new StdioClientTransport({
  command: "npx",
  args: ["tsx", "src/mcp-server.ts"],
  cwd: repoRoot,
});

await client.connect(transport);

// repo_path on purpose - that's the field name the server's own zod schema
// declares. server code actually reads input.repoPath, so if that mismatch
// is still there this comes back undefined and the report header proves it
const result = await client.callTool({
  name: "review_repository",
  arguments: { repo_path: repoRoot },
});

console.log(result.content[0].text);

await client.close();
