import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer, type Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

process.env.WHITTLE_DB = join(mkdtempSync(join(tmpdir(), "whittle-")), "test.db");
const { forward } = await import("./relay");
const { listTraces, getOriginal } = await import("./store");
const { jestRun, kubectlLogs } = await import("./core/samples");

/* A fake upstream that records what it was sent and streams a reply. */
let server: Server, url = "", seen: { path: string; body: string; headers: Record<string, unknown> } | null = null;
beforeAll(async () => {
  server = createServer((req, res) => {
    let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => {
      seen = { path: req.url ?? "", body: b, headers: req.headers };
      res.writeHead(200, { "content-type": "text/event-stream" }); res.write("data: {\"ok\":true}\n\n"); res.end();
    });
  });
  await new Promise<void>((r) => server.listen(0, r));
  url = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
});
afterAll(() => server.close());

describe("relay", () => {
  it("compresses Anthropic tool_result blocks and leaves everything else alone", async () => {
    const logs = kubectlLogs();
    const req = new Request("http://whittle/v1/messages", {
      method: "POST", headers: { "x-api-key": "test-key", "anthropic-version": "2023-06-01", "user-agent": "claude-cli/2.1 (external, cli)" },
      body: JSON.stringify({ model: "claude-sonnet", messages: [
        { role: "user", content: "why is the order service failing?" },
        { role: "assistant", content: [{ type: "tool_use", id: "t1", name: "bash", input: { command: "kubectl logs order-svc" } }] },
        { role: "user", content: [{ type: "tool_result", tool_use_id: "t1", content: logs }] },
      ] }),
    });
    const res = await forward(req, "anthropic", url, "/v1/messages");
    expect(await res.text()).toContain("ok");
    expect(seen!.path).toBe("/v1/messages");
    expect(seen!.headers["x-api-key"]).toBe("test-key");
    const sent = JSON.parse(seen!.body);
    expect(sent.messages[0].content).toBe("why is the order service failing?");
    const result = sent.messages[2].content[0].content as string;
    expect(result.length).toBeLessThan(logs.length / 3);
    expect(result).toContain("failed to commit offset");

    const [trace] = listTraces();
    expect(trace.agent).toBe("Claude Code");
    expect(trace.after).toBeLessThan(trace.before);
    expect(getOriginal(trace.blocks[0].original)?.text).toBe(logs); // nothing is lost
  });

  it("compresses OpenAI tool messages", async () => {
    const out = jestRun();
    const req = new Request("http://whittle/v1/chat/completions", {
      method: "POST", headers: { authorization: "Bearer test", "user-agent": "codex_cli_rs/0.40" },
      body: JSON.stringify({ model: "gpt-5", messages: [{ role: "user", content: "fix the failing test" }, { role: "tool", tool_call_id: "c1", content: out }] }),
    });
    await forward(req, "openai", url, "/v1/chat/completions");
    const sent = JSON.parse(seen!.body);
    expect(sent.messages[1].content).toContain("refunds a partially captured charge");
    expect(sent.messages[1].content.length).toBeLessThan(out.length / 2);
    expect(listTraces()[0].agent).toBe("Codex");
  });
});
