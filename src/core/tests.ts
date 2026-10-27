import { settleCarriageReturns, stripAnsi } from "./text";

/*
 * Test output: the agent needs the failures and the totals, not 400 green ticks.
 * Works on Jest/Vitest, pytest, `go test` and Mocha-style output by recognising pass lines, fail blocks and summaries.
 */
const PASS = /^\s*(✓|✔|√|PASS\b|ok\s|--- PASS|=== RUN|=== PAUSE|=== CONT|\[\s*PASSED\s*\]|.*\bPASSED\b|[\w/.-]+::[\w\[\]-]+ PASSED|\.+\s*\[\s*\d+%\]$)/;
const FAIL_START = /^\s*(✕|✗|×|FAIL\b|--- FAIL|●|FAILED\b|_{3,} .* _{3,}|E\s{2,}|panic:|AssertionError|Error:|\d+\) )/;
const SUMMARY = /^\s*(Tests?:|Test Suites:|Snapshots:|Time:|Ran all|=+ .*(passed|failed|error).* =+|ok\s+\S+\s+[\d.]+s|FAIL\s+\S+\s+[\d.]+s|PASS$|FAIL$|\d+ (passing|failing|pending)|short test summary)/i;

export function compressTests(input: string) {
  const lines = settleCarriageReturns(stripAnsi(input)).split("\n").map((l) => l.trimEnd());
  const out: string[] = [];
  let passed = 0, inFail = false, failLines = 0;

  for (const l of lines) {
    if (!l.trim()) { if (inFail) out.push(""); continue; }
    if (SUMMARY.test(l)) { inFail = false; out.push(l); continue; }
    if (FAIL_START.test(l)) { inFail = true; failLines = 0; out.push(l); continue; }
    if (/^\s+[\w./-]+\.(go|py|ts|tsx|js|rs|java|rb):\d+/.test(l)) { out.push(l); continue; } // assertion messages printed with a file:line
    if (inFail) {
      // keep the failure body, but cap very long stack traces
      if (PASS.test(l)) { inFail = false; passed++; continue; }
      failLines++;
      if (failLines <= 18) out.push(l);
      else if (failLines === 19) out.push("    … stack trimmed");
      continue;
    }
    if (PASS.test(l)) { passed++; continue; }
    // ordinary chatter between tests (setup logs, dots) is dropped
  }
  if (passed) out.unshift(`[${passed} passing test lines omitted]`);
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export const looksLikeTests = (s: string) => {
  const sample = s.slice(0, 20000);
  const hits = (sample.match(/^\s*(✓|✔|✕|PASS |FAIL |--- (PASS|FAIL)|=== RUN|ok\s+\S+|.*\bPASSED\b|.*\bFAILED\b|Tests?:\s+\d)/gm) ?? []).length;
  return hits >= 3;
};
