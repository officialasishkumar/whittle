import Link from "next/link";
import { KINDS, type Kind } from "@/src/core";
import { listTraces } from "@/src/store";
import { AgentIcon, fmt, KindChip, kindMeta, KindIcon, Reduction } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Traces({ searchParams }: { searchParams: Promise<{ q?: string; kind?: string }> }) {
  const { q = "", kind = "" } = await searchParams;
  const rows = listTraces({ q, kind, limit: 120 });
  return (
    <div className="min-h-screen px-6 py-6 lg:px-10">
      <header className="flex flex-wrap items-end gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Traces</h1>
          <p className="text-[13px] text-mute">Every request that had something to cut. Open one to see exactly what the model read.</p>
        </div>
      </header>
      <form className="mt-5 flex flex-wrap items-center gap-2">
        <label className="flex min-w-[260px] flex-1 items-center gap-2 rounded-lg border border-line bg-panel px-3 py-2 text-[13px] focus-within:border-line2">
          <svg className="h-4 w-4 text-mute" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <input name="q" defaultValue={q} placeholder="Search agent, model or trace id" className="w-full bg-transparent outline-none placeholder:text-dim" />
          <kbd className="rounded border border-line2 px-1.5 font-mono text-[10px] text-dim">/</kbd>
        </label>
        <div className="flex gap-1.5">
          <Link href="/traces" className={`rounded-lg border px-2.5 py-2 text-[12.5px] ${!kind ? "border-line2 bg-raise" : "border-line text-mute"}`}>All</Link>
          {KINDS.map((k) => (
            <Link key={k} href={`/traces?kind=${k}`} className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[12.5px] ${kind === k ? "border-line2 bg-raise" : "border-line text-mute"}`}>
              <KindIcon kind={k as Kind} size={12} />{kindMeta[k as Kind].label}
            </Link>
          ))}
        </div>
      </form>
      <div className="panel mt-4 overflow-hidden">
        <table className="w-full text-[13px]">
          <thead className="bg-raise/40 text-left text-[11px] uppercase tracking-[.08em] text-dim">
            <tr><th className="px-4 py-2.5 font-medium">When</th><th className="font-medium">Agent</th><th className="font-medium">Model</th><th className="font-medium">Cut from</th><th className="text-right font-medium">Tokens in → out</th><th className="px-4 text-right font-medium">Saved</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="group border-t border-line hover:bg-raise/40">
                <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[12px] text-mute"><Link href={`/traces/${r.id}`} className="block">{new Date(r.ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</Link></td>
                <td><Link href={`/traces/${r.id}`} className="flex items-center gap-2"><AgentIcon agent={r.agent} />{r.agent}</Link></td>
                <td className="font-mono text-[12px] text-mute">{r.model}</td>
                <td><span className="flex flex-wrap gap-1">{[...new Set(r.blocks.map((b) => b.kind))].map((k) => <KindChip key={k} kind={k} />)}</span></td>
                <td className="num text-right font-mono text-[12px] text-mute">{fmt(r.before)} → <span className="text-fg">{fmt(r.after)}</span></td>
                <td className="px-4 text-right"><Reduction before={r.before} after={r.after} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="p-10 text-center text-mute">Nothing matches.</p>}
      </div>
    </div>
  );
}
