import Link from "next/link";
import { KINDS } from "@/src/core";
import { listTraces, summary } from "@/src/store";
import { AgentIcon, dollars, fmt, KindChip, KindIcon, kindMeta, money, pct, PRICE, Reduction, SavingsChart, Spark } from "@/components/ui";

export const dynamic = "force-dynamic";

function Stat({ label, value, sub, spark, accent }: { label: string; value: string; sub: string; spark?: number[]; accent?: string }) {
  return (
    <div className="panel rise relative overflow-hidden p-5">
      <p className="label">{label}</p>
      <p className="num mt-3 text-[34px] font-semibold leading-none" style={accent ? { color: accent } : undefined}>{value}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-[12.5px] text-mute">{sub}</p>
        {spark && <Spark values={spark} color={accent} />}
      </div>
    </div>
  );
}

export default function Overview() {
  const s = summary(30);
  const t = s.totals;
  const saved = t.before - t.after;
  const byDay = Array.from({ length: 30 }, (_, i) => s.daily.find((d) => d.day === i) ?? { day: i, before: 0, after: 0, n: 0 });
  const recent = listTraces({ limit: 7 });
  const kinds = KINDS.map((k) => ({ k, ...(s.kinds[k] ?? { before: 0, after: 0, n: 0 }) })).sort((a, b) => b.before - b.after - (a.before - a.after));
  const maxKind = Math.max(1, ...kinds.map((k) => k.before));

  if (!t.n) {
    return (
      <div className="grid-bg grid min-h-screen place-items-center p-8 text-center">
        <div className="max-w-md">
          <p className="text-[22px] font-semibold">No traffic yet</p>
          <p className="mt-2 text-mute">Point an agent at the proxy and its tool outputs will show up here. Or load a demo workspace with <code className="font-mono text-cut">npm run seed</code>.</p>
          <Link href="/setup" className="mt-6 inline-block rounded-lg bg-cut px-4 py-2 text-[14px] font-medium text-black">Connect an agent</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid-bg min-h-screen px-6 py-6 lg:px-10">
      <header className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Overview</h1>
          <p className="text-[13px] text-mute">What your agents would have read, and what they actually read.</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {t.demo ? <span className="rounded-md border border-cut/30 bg-cut/10 px-2 py-1 text-[11.5px] text-cut2">Demo workspace</span> : null}
          <div className="flex rounded-lg border border-line bg-panel p-0.5 text-[12.5px]">
            {["24h", "7d", "30d"].map((r) => <span key={r} className={`rounded-md px-2.5 py-1 ${r === "30d" ? "bg-raise text-fg" : "text-mute"}`}>{r}</span>)}
          </div>
        </div>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Tokens not sent" value={fmt(saved)} sub={`of ${fmt(t.before)} in tool output`} spark={byDay.map((d) => d.before - d.after)} accent="#ff7a3d" />
        <Stat label="Estimated savings" value={money(dollars(saved))} sub={`at $${PRICE.toFixed(2)} / M input tokens`} spark={byDay.map((d) => dollars(d.before - d.after))} />
        <Stat label="Average reduction" value={`${pct(t.before, t.after)}%`} sub="across every compressed output" />
        <Stat label="Outputs compressed" value={fmt(Object.values(s.kinds).reduce((n, k) => n + k.n, 0))} sub={`in ${fmt(t.n)} requests`} spark={byDay.map((d) => d.n)} accent="#5eead4" />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <div className="panel rise p-5" style={{ animationDelay: ".05s" }}>
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-[14px] font-medium">Input tokens per day</p>
            <span className="flex items-center gap-1.5 text-[12px] text-mute"><i className="h-2 w-2 rounded-full bg-cut" />would have sent</span>
            <span className="flex items-center gap-1.5 text-[12px] text-mute"><i className="h-2 w-2 rounded-full bg-keep" />actually sent</span>
          </div>
          <div className="mt-3"><SavingsChart data={byDay} labels={s.labels} height={330} /></div>
        </div>
        <div className="panel rise p-5" style={{ animationDelay: ".1s" }}>
          <p className="text-[14px] font-medium">Where it cuts</p>
          <p className="text-[12.5px] text-mute">Tokens in vs. out, by content</p>
          <ul className="mt-5 space-y-5">
            {kinds.map(({ k, before, after, n }) => (
              <li key={k}>
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="grid h-6 w-6 place-items-center rounded-md border border-line bg-raise"><KindIcon kind={k} /></span>
                  {kindMeta[k].label}<span className="text-[11.5px] text-dim">{fmt(n)} outputs</span>
                  <span className="ml-auto"><Reduction before={before} after={after} /></span>
                </div>
                <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-raise">
                  <i className="absolute inset-y-0 left-0 rounded-full opacity-30" style={{ width: `${(before / maxKind) * 100}%`, background: kindMeta[k].color }} />
                  <i className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(after / maxKind) * 100}%`, background: kindMeta[k].color }} />
                </div>
                <p className="num mt-1.5 font-mono text-[11px] text-dim">{fmt(before)} → {fmt(after)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        <div className="panel rise p-5" style={{ animationDelay: ".15s" }}>
          <p className="text-[14px] font-medium">By agent</p>
          <table className="mt-3 w-full text-[13px]">
            <thead><tr className="text-left text-[11px] uppercase tracking-[.08em] text-dim"><th className="py-2 font-medium">Agent</th><th className="font-medium">Requests</th><th className="font-medium">Saved</th><th className="text-right font-medium">Cut</th></tr></thead>
            <tbody>
              {s.agents.map((a) => (
                <tr key={a.agent} className="border-t border-line">
                  <td className="py-2.5"><span className="flex items-center gap-2"><AgentIcon agent={a.agent} />{a.agent}</span></td>
                  <td className="num text-mute">{fmt(a.n)}</td>
                  <td className="num">{fmt(a.before - a.after)}</td>
                  <td className="text-right"><Reduction before={a.before} after={a.after} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel rise p-5" style={{ animationDelay: ".2s" }}>
          <div className="flex items-center"><p className="text-[14px] font-medium">Latest</p><Link href="/traces" className="ml-auto text-[12.5px] text-mute hover:text-fg">All traces →</Link></div>
          <ul className="mt-3">
            {recent.map((r) => (
              <li key={r.id} className="border-t border-line">
                <Link href={`/traces/${r.id}`} className="flex items-center gap-3 py-2.5 text-[13px] hover:bg-raise/40">
                  <AgentIcon agent={r.agent} />
                  <span className="w-[92px] truncate text-mute">{r.agent}</span>
                  <span className="hidden gap-1 sm:flex">{[...new Set(r.blocks.map((b) => b.kind))].map((k) => <KindChip key={k} kind={k} />)}</span>
                  <span className="num ml-auto font-mono text-[12px] text-mute">{fmt(r.before)} → <span className="text-fg">{fmt(r.after)}</span></span>
                  <Reduction before={r.before} after={r.after} />
                  <span className="hidden w-[58px] text-right text-[11.5px] text-dim md:block">{ago(r.ts)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function ago(ts: number) {
  const m = Math.round((Date.now() - ts) / 6e4);
  return m < 60 ? `${m}m ago` : m < 1440 ? `${Math.round(m / 60)}h ago` : `${Math.round(m / 1440)}d ago`;
}
