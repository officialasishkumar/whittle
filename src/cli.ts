import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compress, type Kind } from "./core";

const help = `whittle — make coding agents read less

  whittle compress [file] [--kind logs|tests|json|diff] [--stats]
      Compress a tool output (from a file or stdin) and print what the model would read.
  whittle serve [--port 4317]
      Start the proxy and dashboard.

  Point agents at the proxy:
      ANTHROPIC_BASE_URL=http://localhost:4317 claude
      OpenAI(base_url="http://localhost:4317/v1")
`;

const args = process.argv.slice(2);
const flag = (name: string) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const cmd = args[0];

if (cmd === "compress") {
  const file = args[1] && !args[1].startsWith("--") ? args[1] : undefined;
  const input = readFileSync(file ?? 0, "utf8");
  const r = compress(input, { kind: flag("kind") as Kind | undefined, minTokens: 0 });
  process.stdout.write(r.text.endsWith("\n") ? r.text : r.text + "\n");
  if (args.includes("--stats") || process.stderr.isTTY)
    process.stderr.write(`\x1b[2mwhittle: ${r.kind} · ${r.before} → ${r.after} tokens (−${r.before ? Math.round((1 - r.after / r.before) * 100) : 0}%)\x1b[0m\n`);
} else if (cmd === "serve") {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  spawn("npx", ["next", "start", "-p", flag("port") ?? "4317"], { cwd: root, stdio: "inherit" });
} else {
  process.stdout.write(help);
  process.exit(cmd ? 1 : 0);
}
