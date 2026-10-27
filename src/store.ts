import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { Kind } from "./core";

/* Everything lives in one local SQLite file. Nothing leaves the machine. */
export const DB_PATH = process.env.WHITTLE_DB ?? join(homedir(), ".whittle", "whittle.db");

export type Block = { kind: Kind; before: number; after: number; original: string };
export type Trace = {
  id: string; ts: number; provider: "anthropic" | "openai"; agent: string; model: string;
  before: number; after: number; blocks: Block[]; status: number; demo: number;
};

let db: DatabaseSync | null = null;
export function open() {
  if (db) return db;
  mkdirSync(dirname(DB_PATH), { recursive: true });
  db = new DatabaseSync(DB_PATH);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS traces (id TEXT PRIMARY KEY, ts INTEGER, provider TEXT, agent TEXT, model TEXT, before INTEGER, after INTEGER, blocks TEXT, status INTEGER, demo INTEGER DEFAULT 0);
    CREATE INDEX IF NOT EXISTS traces_ts ON traces(ts);
    CREATE TABLE IF NOT EXISTS originals (id TEXT PRIMARY KEY, text TEXT, compressed TEXT);
  `);
  return db;
}

export function saveOriginal(id: string, text: string, compressed: string) {
  open().prepare("INSERT OR IGNORE INTO originals (id, text, compressed) VALUES (?, ?, ?)").run(id, text, compressed);
}
export function getOriginal(id: string) {
  return open().prepare("SELECT id, text, compressed FROM originals WHERE id = ?").get(id) as { id: string; text: string; compressed: string } | undefined;
}

export function saveTrace(t: Trace) {
  open().prepare("INSERT OR REPLACE INTO traces (id, ts, provider, agent, model, before, after, blocks, status, demo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(t.id, t.ts, t.provider, t.agent, t.model, t.before, t.after, JSON.stringify(t.blocks), t.status, t.demo);
}

type Row = Omit<Trace, "blocks"> & { blocks: string };
const parse = (r: Row): Trace => ({ ...r, blocks: JSON.parse(r.blocks) });

export function listTraces(opts: { limit?: number; q?: string; kind?: string } = {}) {
  const { limit = 200, q = "", kind = "" } = opts;
  const rows = open().prepare(`SELECT * FROM traces WHERE (? = '' OR agent LIKE ? OR model LIKE ? OR id LIKE ?) AND (? = '' OR blocks LIKE ?) ORDER BY ts DESC LIMIT ?`)
    .all(q, `%${q}%`, `%${q}%`, `%${q}%`, kind, `%"kind":"${kind}"%`, limit) as Row[];
  return rows.map(parse);
}
export function getTrace(id: string) {
  const r = open().prepare("SELECT * FROM traces WHERE id = ?").get(id) as Row | undefined;
  return r ? parse(r) : undefined;
}

export function summary(days = 30) {
  const since = Date.now() - days * 864e5;
  const d = open();
  const totals = d.prepare("SELECT COUNT(*) n, COALESCE(SUM(before),0) before, COALESCE(SUM(after),0) after, COALESCE(MAX(demo),0) demo FROM traces WHERE ts >= ?").get(since) as { n: number; before: number; after: number; demo: number };
  const daily = d.prepare("SELECT CAST((ts - ?) / 86400000 AS INTEGER) day, SUM(before) before, SUM(after) after, COUNT(*) n FROM traces WHERE ts >= ? GROUP BY day ORDER BY day").all(since, since) as { day: number; before: number; after: number; n: number }[];
  const agents = d.prepare("SELECT agent, COUNT(*) n, SUM(before) before, SUM(after) after FROM traces WHERE ts >= ? GROUP BY agent ORDER BY SUM(before) - SUM(after) DESC").all(since) as { agent: string; n: number; before: number; after: number }[];
  const kinds: Record<string, { before: number; after: number; n: number }> = {};
  for (const r of d.prepare("SELECT blocks FROM traces WHERE ts >= ?").all(since) as { blocks: string }[]) {
    for (const b of JSON.parse(r.blocks) as Block[]) {
      const k = (kinds[b.kind] ??= { before: 0, after: 0, n: 0 });
      k.before += b.before; k.after += b.after; k.n++;
    }
  }
  const labels = Array.from({ length: days }, (_, i) => new Date(since + (i + 1) * 864e5).toLocaleDateString("en-US", { month: "short", day: "numeric" }));
  return { totals, daily, agents, kinds, days, labels };
}
