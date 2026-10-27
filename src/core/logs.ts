import { IMPORTANT, settleCarriageReturns, shape, stripAnsi, stripTimestamp } from "./text";

/*
 * Logs: keep what an agent acts on (errors, warnings, the start and the end), fold everything repetitive.
 * 1. strip ANSI codes, carriage-return progress and timestamps
 * 2. fold exact and near-duplicate runs ("same shape") into one line with a count
 * 3. if still long, keep the head, the tail and every important line with a little context
 */
export function compressLogs(input: string, opts: { head?: number; tail?: number; context?: number; budget?: number } = {}) {
  const { head = 12, tail = 25, context = 2, budget = 80 } = opts;
  const raw = settleCarriageReturns(stripAnsi(input)).split("\n").map((l) => stripTimestamp(l).trimEnd());

  // drop progress bars and blank noise
  const lines = raw.filter((l) => l.trim() && !/^[\s#=>\-.|█▓▒░]*\d{1,3}%[\s#=>\-.|█▓▒░]*$/.test(l) && !/^[\s.]+$/.test(l));

  // fold runs of lines with the same shape
  const folded: string[] = [];
  for (let i = 0; i < lines.length; ) {
    const s = shape(lines[i]);
    let j = i + 1;
    while (j < lines.length && shape(lines[j]) === s) j++;
    const n = j - i;
    if (n === 1) folded.push(lines[i]);
    else if (n === 2) folded.push(lines[i], lines[i + 1]);
    else folded.push(lines[i], `  … ${n - 1} more like this`);
    i = j;
  }
  if (folded.length <= budget) return folded.join("\n");

  // too long: head + tail + important lines in context
  const keep = new Set<number>();
  for (let i = 0; i < Math.min(head, folded.length); i++) keep.add(i);
  for (let i = Math.max(0, folded.length - tail); i < folded.length; i++) keep.add(i);
  folded.forEach((l, i) => { if (IMPORTANT.test(l)) for (let k = i - context; k <= i + context; k++) if (k >= 0 && k < folded.length) keep.add(k); });

  const out: string[] = [];
  let gap = 0;
  for (let i = 0; i < folded.length; i++) {
    if (keep.has(i)) { if (gap) out.push(`  … ${gap} lines omitted`); gap = 0; out.push(folded[i]); }
    else gap++;
  }
  if (gap) out.push(`  … ${gap} lines omitted`);
  return out.join("\n");
}
