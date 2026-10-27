import { countTokens } from "gpt-tokenizer";

/* Token counts use the o200k encoding as a stand-in for every model; it is close enough to compare before and after. */
export const tokens = (s: string) => (s ? countTokens(s) : 0);

import { stripAnsi, stripTimestamp } from "./normalize";
export { stripAnsi, stripTimestamp };

/* Carriage-return progress output ("12% ... 13% ...") keeps only the final state of each line. */
export const settleCarriageReturns = (s: string) => s.split("\n").map((l) => (l.includes("\r") ? l.split("\r").filter(Boolean).pop() ?? "" : l)).join("\n");


/* A line's "shape": numbers, hex, UUIDs and quoted values blanked, so near-identical lines group together. */
export const shape = (l: string) =>
  stripTimestamp(l)
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, "<id>")
    .replace(/\S*[@/=]\S*/g, "<v>") // package specs, paths, URLs, key=value pairs
    .replace(/\b0x[0-9a-f]+\b/gi, "<hex>")
    .replace(/\b[0-9a-f]{12,}\b/gi, "<hex>")
    .replace(/\d+(\.\d+)?/g, "#")
    .replace(/"[^"]*"|'[^']*'/g, "<s>")
    .trim();

export const IMPORTANT = /\b(error|err!|fatal|panic|exception|traceback|fail(ed|ure)?|warn(ing)?|denied|refused|timeout|timed out|unhandled|segfault|oom|killed|cannot|could not|undefined|not found)\b/i;
