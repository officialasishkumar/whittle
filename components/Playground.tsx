"use client";
import { useEffect, useMemo, useState } from "react";
import { fmt, KindChip } from "./ui";
import type { Kind, Result } from "@/src/core";
import { lineKey } from "@/src/core/normalize";

export default function Playground({ samples }: { samples: Record<string, string> }) {
  const names = Object.keys(samples);
  const [name, setName] = useState(names[1]);
  const [text, setText] = useState(samples[names[1]]);
  const [kind, setKind] = useState<Kind | "auto">("auto");
  const [res, setRes] = useState<Result | null>(null);
  const [view, setView] = useState<"output" | "cut">("output");

  useEffect(() => {
    const id = setTimeout(async () => {
      const r = await fetch("/api/compress", { method: "POST", body: JSON.stringify({ text, kind }) });
      setRes(await r.json());
    }, 180);
    return () => clearTimeout(id);
  }, [text, kind]);

  const kept = useMemo(() => new Set((res?.text ?? "").split("\n").map(lineKey)), [res]);
  const lines = text.split("\n");
  const p = res && res.before ? Math.round((1 - res.after / res.before) * 100) : 0;

  return (
    <div className="flex min-h-screen flex-col px-6 py-6 lg:px-10">
      <header className="flex flex-wrap items-end gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Playground</h1>
          <p className="text-[13px] text-mute">Paste any tool output and see what the model would read instead.</p>
        </div>
      </header>
      <div className="mt-5 flex flex-wrap items-center gap-1.5">
        {names.map((n) => (
          <button key={n} type="button" onClick={() => { setName(n); setText(samples[n]); }}
            className={`rounded-lg border px-2.5 py-1.5 text-[12.5px] transition-colors ${name === n ? "border-cut/50 bg-cut/10 text-cut2" : "border-line text-mute hover:border-line2 hover:text-fg"}`}>{n}</button>
        ))}
        <select value={kind} onChange={(e) => setKind(e.target.value as Kind | "auto")} className="ml-auto rounded-lg border border-line bg-panel px-2.5 py-1.5 text-[12.5px] text-fg outline-none">
          {["auto", "logs", "tests", "json", "diff"].map((k) => <option key={k} value={k}>{k === "auto" ? "Detect automatically" : k}</option>)}
        </select>
      </div>

      {/* the meter */}
      <div className="panel mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 px-5 py-4">
        <div><p className="label">Detected</p><div className="mt-1.5">{res ? <KindChip kind={res.kind} /> : "…"}</div></div>
        <div><p className="label">Tokens in</p><p className="num mt-1 text-[20px] font-semibold">{fmt(res?.before ?? 0)}</p></div>
        <div><p className="label">Tokens out</p><p className="num mt-1 text-[20px] font-semibold text-keep">{fmt(res?.after ?? 0)}</p></div>
        <div className="min-w-[220px] flex-1">
          <div className="flex justify-between"><p className="label">Cut</p><p className="num text-[20px] font-semibold text-cut">−{p}%</p></div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-raise">
            <i className="block h-full rounded-full bg-gradient-to-r from-cut2 to-cut transition-[width] duration-700 ease-out" style={{ width: `${p}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-4 grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
        <div className="panel flex min-h-[520px] flex-col overflow-hidden">
          <div className="flex items-center border-b border-line px-4 py-2"><p className="label">Input</p><span className="ml-auto font-mono text-[11px] text-dim">{lines.length} lines</span></div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} spellCheck={false}
            className="scroll-thin flex-1 resize-none bg-transparent px-4 py-3 font-mono text-[11.5px] leading-[1.65] text-fg/90 outline-none" />
        </div>
        <div className="panel flex min-h-[520px] flex-col overflow-hidden">
          <div className="flex items-center gap-1 border-b border-line px-2 py-1.5">
            {(["output", "cut"] as const).map((v) => (
              <button key={v} type="button" onClick={() => setView(v)} className={`rounded-md px-2.5 py-1 text-[12px] ${view === v ? "bg-raise text-fg" : "text-mute hover:text-fg"}`}>{v === "output" ? "What the model reads" : "What was cut"}</button>
            ))}
          </div>
          {view === "output" ? (
            <pre className="scroll-thin flex-1 overflow-auto whitespace-pre-wrap px-4 py-3 font-mono text-[11.5px] leading-[1.65] text-fg/90">{res?.text}</pre>
          ) : (
            <pre className="scroll-thin flex-1 overflow-auto py-3 font-mono text-[11.5px] leading-[1.65]">
              {lines.map((l, i) => {
                const cut = !kept.has(lineKey(l));
                return <div key={i} className={`whitespace-pre px-4 ${cut ? "bg-cut/[.07] text-dim line-through decoration-cut/40" : "text-fg/90"}`}>{l || " "}</div>;
              })}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
