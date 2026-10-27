import { randomUUID } from "node:crypto";
import { compress, type Kind } from "./core";
import { saveOriginal, saveTrace, type Block } from "./store";

/*
 * The proxy rewrites only tool results; prompts, system messages and the model's own turns pass through untouched.
 * Anthropic: user messages carry `tool_result` blocks. OpenAI: messages with role "tool".
 */
type AnyMsg = { role: string; content: unknown };

function squeeze(text: string, blocks: Block[]) {
  const r = compress(text);
  if (r.skipped) return text;
  saveOriginal(r.id, text, r.text);
  blocks.push({ kind: r.kind as Kind, before: r.before, after: r.after, original: r.id });
  return r.text;
}

export function rewriteAnthropic(body: { messages?: AnyMsg[] }, blocks: Block[]) {
  for (const m of body.messages ?? []) {
    if (m.role !== "user" || !Array.isArray(m.content)) continue;
    for (const part of m.content as { type: string; content?: unknown }[]) {
      if (part.type !== "tool_result") continue;
      if (typeof part.content === "string") part.content = squeeze(part.content, blocks);
      else if (Array.isArray(part.content))
        for (const c of part.content as { type: string; text?: string }[]) if (c.type === "text" && c.text) c.text = squeeze(c.text, blocks);
    }
  }
  return body;
}

export function rewriteOpenAI(body: { messages?: AnyMsg[] }, blocks: Block[]) {
  for (const m of body.messages ?? []) {
    if (m.role !== "tool") continue;
    if (typeof m.content === "string") m.content = squeeze(m.content, blocks);
    else if (Array.isArray(m.content)) for (const c of m.content as { type: string; text?: string }[]) if (c.type === "text" && c.text) c.text = squeeze(c.text, blocks);
  }
  return body;
}

/* Who is calling, from the User-Agent; good enough to split the dashboard by agent. */
export function agentOf(ua: string) {
  const u = ua.toLowerCase();
  if (u.includes("claude-cli") || u.includes("claude-code")) return "Claude Code";
  if (u.includes("codex")) return "Codex";
  if (u.includes("gemini")) return "Gemini CLI";
  if (u.includes("opencode")) return "OpenCode";
  if (u.includes("anthropic")) return "Anthropic SDK";
  if (u.includes("openai")) return "OpenAI SDK";
  return "Other";
}

const HOP = new Set(["host", "content-length", "connection", "accept-encoding", "transfer-encoding"]);

export async function forward(req: Request, provider: "anthropic" | "openai", upstream: string, path: string) {
  const raw = await req.text();
  let body: { model?: string; messages?: AnyMsg[] };
  try { body = JSON.parse(raw); } catch { return new Response("whittle: request body is not JSON", { status: 400 }); }

  const blocks: Block[] = [];
  if (process.env.WHITTLE_DISABLE !== "1") (provider === "anthropic" ? rewriteAnthropic : rewriteOpenAI)(body, blocks);

  const headers = new Headers();
  req.headers.forEach((v, k) => { if (!HOP.has(k)) headers.set(k, v); });
  const res = await fetch(upstream.replace(/\/$/, "") + path, { method: "POST", headers, body: JSON.stringify(body) });

  if (blocks.length) {
    saveTrace({
      id: randomUUID(), ts: Date.now(), provider, agent: agentOf(req.headers.get("user-agent") ?? ""), model: body.model ?? "unknown",
      before: blocks.reduce((n, b) => n + b.before, 0), after: blocks.reduce((n, b) => n + b.after, 0), blocks, status: res.status, demo: 0,
    });
  }
  // stream the provider's answer straight back (SSE included)
  const out = new Headers(res.headers);
  out.delete("content-encoding"); out.delete("content-length");
  out.set("x-whittle-blocks", String(blocks.length));
  return new Response(res.body, { status: res.status, headers: out });
}
