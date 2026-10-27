/*
 * Diffs: keep every changed line and the file/hunk headers; trim context to one line either side;
 * summarise lockfiles and generated files instead of printing them; cap huge new files.
 */
const LOCKFILE = /(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|go\.sum|Cargo\.lock|poetry\.lock|Gemfile\.lock|composer\.lock|\.min\.(js|css)|\.snap|dist\/|\.map)$/;

export function compressDiff(input: string, opts: { context?: number; maxNewFileLines?: number } = {}) {
  const { context = 1, maxNewFileLines = 40 } = opts;
  const files = input.split(/^(?=diff --git )/m);
  const out: string[] = [];

  for (const file of files) {
    const lines = file.split("\n");
    const header = lines[0] ?? "";
    const path = header.match(/ b\/(\S+)$/)?.[1] ?? "";
    const plus = lines.filter((l) => l.startsWith("+") && !l.startsWith("+++")).length;
    const minus = lines.filter((l) => l.startsWith("-") && !l.startsWith("---")).length;

    if (path && LOCKFILE.test(path)) { out.push(`${header}\n  [generated/lock file: +${plus} −${minus} lines, contents omitted]`); continue; }
    if (/^Binary files/m.test(file)) { out.push(`${header}\n  [binary file changed]`); continue; }

    const isNew = /^new file mode/m.test(file);
    let addedShown = 0, newCut = 0;
    const body: string[] = [];
    // within each hunk, keep changes plus `context` lines around them
    const keep = new Set<number>();
    lines.forEach((l, i) => {
      if (/^(diff --git|index |--- |\+\+\+ |@@|new file mode|deleted file mode|rename (from|to)|similarity index)/.test(l)) keep.add(i);
      else if (/^[+-]/.test(l)) for (let k = i - context; k <= i + context; k++) keep.add(k);
    });
    let gap = 0;
    lines.forEach((l, i) => {
      if (!keep.has(i)) { gap++; return; }
      if (gap) { body.push(` ⋯ ${gap} unchanged lines`); gap = 0; }
      if (isNew && l.startsWith("+") && !l.startsWith("+++")) {
        if (addedShown >= maxNewFileLines) { newCut++; return; }
        addedShown++;
      }
      body.push(l);
    });
    if (newCut) body.push(`+ ⋯ ${newCut} more added lines`);
    out.push(body.join("\n").trimEnd());
  }
  return out.filter(Boolean).join("\n");
}

export const looksLikeDiff = (s: string) => /^diff --git /m.test(s) || (/^@@ .* @@/m.test(s) && /^[+-]/m.test(s));
