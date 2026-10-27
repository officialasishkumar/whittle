/*
 * JSON: still valid JSON afterwards, just smaller.
 * Minify, drop null/empty fields, keep the first few items of long arrays (with a marker saying how many were cut),
 * and shorten very long strings. Shapes and keys survive, so the agent can still reason about the structure.
 */
type J = null | boolean | number | string | J[] | { [k: string]: J };

export function compressJson(input: string, opts: { keepItems?: number; maxString?: number; maxDepth?: number } = {}) {
  const { keepItems = 3, maxString = 160, maxDepth = 8 } = opts;
  const walk = (v: J, depth: number): J | undefined => {
    if (v === null) return undefined;
    if (typeof v === "string") return v.length > maxString ? `${v.slice(0, maxString)}…(+${v.length - maxString} chars)` : v;
    if (typeof v !== "object") return v;
    if (depth >= maxDepth) return Array.isArray(v) ? `[… ${v.length} items]` : `{… ${Object.keys(v).length} keys}`;
    if (Array.isArray(v)) {
      const kept = v.slice(0, keepItems).map((x) => walk(x, depth + 1)).filter((x) => x !== undefined) as J[];
      if (v.length > keepItems) kept.push(`… ${v.length - keepItems} more items`);
      return kept;
    }
    const o: { [k: string]: J } = {};
    for (const [k, x] of Object.entries(v)) {
      const w = walk(x, depth + 1);
      if (w === undefined || w === "" || (Array.isArray(w) && !w.length) || (typeof w === "object" && w && !Array.isArray(w) && !Object.keys(w).length)) continue;
      o[k] = w;
    }
    return o;
  };
  const parsed = JSON.parse(input) as J;
  return JSON.stringify(walk(parsed, 0) ?? null);
}

export const looksLikeJson = (s: string) => {
  const t = s.trim();
  if (!/^[[{]/.test(t)) return false;
  try { JSON.parse(t); return true; } catch { return false; }
};
