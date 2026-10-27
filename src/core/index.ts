import { createHash } from "node:crypto";
import { compressDiff, looksLikeDiff } from "./diff";
import { compressJson, looksLikeJson } from "./json";
import { compressLogs } from "./logs";
import { compressTests, looksLikeTests } from "./tests";
import { tokens } from "./text";

export type Kind = "json" | "diff" | "tests" | "logs";
export const KINDS: Kind[] = ["logs", "tests", "json", "diff"];

export type Result = {
  kind: Kind;
  id: string;            // content hash; the original can be fetched back by this id
  before: number;        // tokens in
  after: number;         // tokens out (including the footer)
  text: string;          // what the model sees
  skipped?: "small" | "no-gain";
};

export function detect(text: string): Kind {
  if (looksLikeJson(text)) return "json";
  if (looksLikeDiff(text)) return "diff";
  if (looksLikeTests(text)) return "tests";
  return "logs";
}

const run: Record<Kind, (s: string) => string> = { json: compressJson, diff: compressDiff, tests: compressTests, logs: compressLogs };

/*
 * Compress one tool output. Small outputs pass through untouched, and so does anything we can't shrink by at least 10%.
 * The footer tells the model what happened and how to get the original back.
 */
export function compress(text: string, opts: { kind?: Kind; minTokens?: number; footer?: boolean } = {}): Result {
  const { minTokens = 300, footer = true } = opts;
  const id = "wh_" + createHash("sha256").update(text).digest("hex").slice(0, 12);
  const before = tokens(text);
  const kind = opts.kind ?? detect(text);
  if (before < minTokens) return { kind, id, before, after: before, text, skipped: "small" };

  let out: string;
  try { out = run[kind](text); } catch { out = compressLogs(text); }
  const note = footer ? `\n[whittle: ${kind} ${before.toLocaleString("en-US")} → ${tokens(out).toLocaleString("en-US")} tokens · full original: ${id}]` : "";
  const final = out + note;
  const after = tokens(final);
  if (after > before * 0.9) return { kind, id, before, after: before, text, skipped: "no-gain" };
  return { kind, id, before, after, text: final };
}

export { compressDiff, compressJson, compressLogs, compressTests, tokens };
