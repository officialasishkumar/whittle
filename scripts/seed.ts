/*
 * Fill a demo workspace: 30 days of agent traffic. The tool outputs are synthetic (src/core/samples.ts), but every
 * number on the dashboard comes from running the real compressor over them. Rows are flagged demo=1.
 *   npm run seed            # into ~/.whittle/whittle.db
 *   WHITTLE_DB=./demo.db npm run seed
 */
import { randomUUID } from "node:crypto";
import { compress } from "../src/core";
import { apiJson, dockerBuild, gitDiff, goTest, jestRun, kubectlLogs, npmInstall, pytestRun, rng } from "../src/core/samples";
import { open, saveOriginal, saveTrace, type Block } from "../src/store";

const r = rng(42);
const pick = <T,>(xs: [T, number][]) => { let x = r() * xs.reduce((n, [, w]) => n + w, 0); for (const [v, w] of xs) { if ((x -= w) < 0) return v; } return xs[0][0]; };
const sources = [npmInstall, jestRun, pytestRun, goTest, kubectlLogs, dockerBuild, apiJson, gitDiff];
const agents: [[string, string, string], number][] = [
  [["Claude Code", "claude-sonnet-4-5", "anthropic"], 46], [["Codex", "gpt-5-codex", "openai"], 24],
  [["Gemini CLI", "gemini-2.5-pro", "openai"], 12], [["OpenCode", "claude-sonnet-4-5", "anthropic"], 8], [["OpenAI SDK", "gpt-5-mini", "openai"], 10],
];

open().exec("DELETE FROM traces WHERE demo = 1");
let n = 0;
const now = Date.now();
for (let day = 29; day >= 0; day--) {
  const weekend = new Date(now - day * 864e5).getDay() % 6 === 0;
  const count = Math.round((weekend ? 9 : 22) * (1 + (29 - day) / 45) + r() * 8);
  for (let i = 0; i < count; i++) {
    const [agent, model, provider] = pick(agents);
    const blocks: Block[] = [];
    for (let b = 0, nb = 1 + Math.floor(r() * 3); b < nb; b++) {
      const text = sources[Math.floor(r() * sources.length)](Math.floor(r() * 400) + 1);
      const c = compress(text);
      if (c.skipped) continue;
      saveOriginal(c.id, text, c.text);
      blocks.push({ kind: c.kind, before: c.before, after: c.after, original: c.id });
    }
    if (!blocks.length) continue;
    saveTrace({
      id: randomUUID(), ts: now - day * 864e5 - Math.floor(r() * 864e5 * (day ? 1 : 0.4)), provider: provider as "anthropic" | "openai", agent, model,
      before: blocks.reduce((s, x) => s + x.before, 0), after: blocks.reduce((s, x) => s + x.after, 0), blocks, status: 200, demo: 1,
    });
    n++;
  }
}
console.log(`seeded ${n} demo traces`);
