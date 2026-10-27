import type { Kind } from "@/src/core";

export const fmt = (n: number) => (n >= 1e9 ? (n / 1e9).toFixed(2) + "B" : n >= 1e6 ? (n / 1e6).toFixed(2) + "M" : n >= 1e4 ? (n / 1e3).toFixed(1) + "k" : Math.round(n).toLocaleString("en-US"));
export const pct = (before: number, after: number) => (before ? Math.round((1 - after / before) * 100) : 0);
export const PRICE = Number(process.env.WHITTLE_PRICE ?? 3); // USD per million input tokens
export const dollars = (tokens: number) => (tokens / 1e6) * PRICE;
export const money = (n: number) => "$" + (n >= 1000 ? n.toLocaleString("en-US", { maximumFractionDigits: 0 }) : n >= 1 ? n.toFixed(2) : n.toFixed(4));

export const kindMeta: Record<Kind, { label: string; color: string; icon: string }> = {
  logs: { label: "Logs", color: "#ff7a3d", icon: "M4 6h16M4 10h10M4 14h16M4 18h7" },
  tests: { label: "Test output", color: "#5eead4", icon: "M9 12l2 2 4-4M5 4h14v16H5z" },
  json: { label: "JSON", color: "#a78bfa", icon: "M8 4c-2 0-2 2-2 4s-2 4-2 4 2 2 2 4 0 4 2 4M16 4c2 0 2 2 2 4s2 4 2 4-2 2-2 4 0 4-2 4" },
  diff: { label: "Diffs", color: "#60a5fa", icon: "M12 4v16M5 9h4M7 7v4M15 15h4" },
};

export function KindIcon({ kind, size = 14 }: { kind: Kind; size?: number }) {
  const m = kindMeta[kind];
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={m.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={m.icon} /></svg>;
}

export function KindChip({ kind }: { kind: Kind }) {
  const m = kindMeta[kind];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-raise px-1.5 py-0.5 text-[11px] text-fg/85">
      <KindIcon kind={kind} size={11} />{m.label}
    </span>
  );
}

export const agentLogo: Record<string, string | undefined> = {
  "Claude Code": "/logos/anthropic.svg", "Anthropic SDK": "/logos/anthropic.svg", Codex: "/logos/openai.svg", "OpenAI SDK": "/logos/openai.svg", "Gemini CLI": "/logos/googlegemini.svg",
};
export function AgentIcon({ agent, size = 18 }: { agent: string; size?: number }) {
  const src = agentLogo[agent];
  return (
    <span className="grid shrink-0 place-items-center rounded-md bg-[#f2f2f5]" style={{ width: size, height: size }}>
      {src ? <img src={src} alt="" width={size * 0.62} height={size * 0.62} style={{ width: size * 0.62, height: size * 0.62 }} /> : <span className="text-[9px] font-bold text-black">{agent[0]}</span>}
    </span>
  );
}

export function Reduction({ before, after }: { before: number; after: number }) {
  const p = pct(before, after);
  return <span className="num inline-flex min-w-[46px] justify-center rounded-md bg-cut/12 px-1.5 py-0.5 text-[11.5px] font-medium text-cut">−{p}%</span>;
}

/* Two stacked areas: tokens the agent would have sent, and what actually went. The gap is the saving. */
export function SavingsChart({ data, labels, height = 260 }: { data: { before: number; after: number }[]; labels: string[]; height?: number }) {
  const W = 760, H = height, pad = { l: 44, r: 12, t: 16, b: 26 };
  const max = Math.max(1, ...data.map((d) => d.before)) * 1.08;
  const x = (i: number) => pad.l + (i / Math.max(1, data.length - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const smooth = (pts: [number, number][]) => pts.reduce((acc, [px, py], i, a) => {
    if (!i) return `M${px},${py}`;
    const [qx, qy] = a[i - 1], cx = (qx + px) / 2;
    return `${acc} C${cx},${qy} ${cx},${py} ${px},${py}`;
  }, "");
  const b = data.map((d, i) => [x(i), y(d.before)] as [number, number]);
  const a = data.map((d, i) => [x(i), y(d.after)] as [number, number]);
  const base = `L${x(data.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => max * t);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Input tokens before and after compression, per day">
      <defs>
        <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff7a3d" stopOpacity=".28" /><stop offset="1" stopColor="#ff7a3d" stopOpacity="0" /></linearGradient>
        <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5eead4" stopOpacity=".35" /><stop offset="1" stopColor="#5eead4" stopOpacity=".02" /></linearGradient>
      </defs>
      {ticks.map((t) => (
        <g key={t}><line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#1f1f26" />
          <text x={pad.l - 8} y={y(t) + 3.5} textAnchor="end" fontSize="10" fill="#5a5a66" fontFamily="var(--font-geist-mono)">{fmt(t)}</text></g>
      ))}
      <path d={smooth(b) + base} fill="url(#gb)" />
      <path d={smooth(b)} fill="none" stroke="#ff7a3d" strokeWidth="2" />
      <path d={smooth(a) + base} fill="url(#ga)" />
      <path d={smooth(a)} fill="none" stroke="#5eead4" strokeWidth="2" />
      {data.map((_, i) => (i % 5 === 0 || i === data.length - 1) && (
        <text key={i} x={x(i)} y={H - 8} textAnchor={i === data.length - 1 ? "end" : "middle"} fontSize="10" fill="#5a5a66" fontFamily="var(--font-geist-mono)">
          {labels[i]}
        </text>
      ))}
      <circle cx={b[b.length - 1][0]} cy={b[b.length - 1][1]} r="4" fill="#08080a" stroke="#ff7a3d" strokeWidth="2" />
      <circle cx={a[a.length - 1][0]} cy={a[a.length - 1][1]} r="4" fill="#08080a" stroke="#5eead4" strokeWidth="2" />
    </svg>
  );
}

export function Spark({ values, color = "#ff7a3d" }: { values: number[]; color?: string }) {
  const W = 120, H = 34, max = Math.max(1, ...values), min = Math.min(...values);
  const pts = values.map((v, i) => `${(i / Math.max(1, values.length - 1)) * W},${H - 3 - ((v - min) / Math.max(1, max - min)) * (H - 6)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[34px] w-[120px]" aria-hidden="true">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
