import Link from "next/link";
import { notFound } from "next/navigation";
import { getOriginal, getTrace } from "@/src/store";
import { AgentIcon, dollars, fmt, KindChip, money, Reduction } from "@/components/ui";
import CopyId from "@/components/CopyId";
import { lineKey } from "@/src/core/normalize";

export const dynamic = "force-dynamic";

/* Lines from the original that never made it into what the model read. */
function marked(original: string, compressed: string) {
  const kept = new Set(compressed.split("\n").map(lineKey));
  return original.split("\n").map((l) => ({ l, cut: !kept.has(lineKey(l)) }));
}

export default async function TracePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = getTrace(id);
  if (!t) notFound();
  return (
    <div className="min-h-screen px-6 py-6 lg:px-10">
      <Link href="/traces" className="text-[12.5px] text-mute hover:text-fg">← Traces</Link>
      <header className="mt-3 flex flex-wrap items-center gap-4">
        <AgentIcon agent={t.agent} size={36} />
        <div>
          <h1 className="text-[20px] font-semibold tracking-[-0.02em]">{t.agent} · <span className="font-mono text-[16px] text-mute">{t.model}</span></h1>
          <p className="text-[12.5px] text-mute">{new Date(t.ts).toLocaleString("en-US")} · {t.blocks.length} tool output{t.blocks.length > 1 ? "s" : ""} · HTTP {t.status}</p>
        </div>
        <div className="ml-auto flex gap-3">
          {[["In", fmt(t.before)], ["Out", fmt(t.after)], ["Saved", money(dollars(t.before - t.after))]].map(([k, v]) => (
            <div key={k} className="panel min-w-[96px] px-4 py-2.5"><p className="label">{k}</p><p className="num mt-1 text-[18px] font-semibold">{v}</p></div>
          ))}
        </div>
      </header>

      <div className="mt-6 space-y-6">
        {t.blocks.map((b, i) => {
          const o = getOriginal(b.original);
          const lines = o ? marked(o.text, o.compressed) : [];
          const cut = lines.filter((x) => x.cut).length;
          return (
            <section key={i} className="panel overflow-hidden">
              <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
                <KindChip kind={b.kind} />
                <span className="num font-mono text-[12px] text-mute">{fmt(b.before)} → <span className="text-fg">{fmt(b.after)}</span> tokens</span>
                <Reduction before={b.before} after={b.after} />
                <span className="text-[12px] text-dim">{cut} of {lines.length} lines cut</span>
                <span className="ml-auto"><CopyId id={b.original} /></span>
              </div>
              <div className="grid md:grid-cols-2">
                <div className="border-line md:border-r">
                  <p className="label border-b border-line px-4 py-2">Original</p>
                  <pre className="scroll-thin max-h-[440px] overflow-auto py-2 font-mono text-[11.5px] leading-[1.65]">
                    {lines.map((x, j) => (
                      <div key={j} className={`flex px-4 ${x.cut ? "bg-cut/[.06] text-dim line-through decoration-cut/40" : "text-fg/90"}`}>
                        <span className="mr-4 w-8 shrink-0 select-none text-right text-dim/70">{j + 1}</span><span className="whitespace-pre">{x.l || " "}</span>
                      </div>
                    ))}
                  </pre>
                </div>
                <div>
                  <p className="label border-b border-line px-4 py-2 text-keep">What the model read</p>
                  <pre className="scroll-thin max-h-[440px] overflow-auto whitespace-pre-wrap px-4 py-2 font-mono text-[11.5px] leading-[1.65] text-fg/90">{o?.compressed}</pre>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
