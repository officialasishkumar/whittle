import { AgentIcon } from "@/components/ui";

const steps = [
  { agent: "Claude Code", title: "Claude Code", text: "Route Claude Code through the proxy. Your key still goes straight to Anthropic.", code: "ANTHROPIC_BASE_URL=http://localhost:4317 claude" },
  { agent: "Codex", title: "OpenAI SDKs and Codex", text: "Any OpenAI-compatible client: change the base URL, keep your key.", code: 'client = OpenAI(base_url="http://localhost:4317/v1")' },
  { agent: "Anthropic SDK", title: "Anthropic SDK", text: "Same idea for the Anthropic SDKs in Python and TypeScript.", code: 'client = Anthropic(base_url="http://localhost:4317")' },
  { agent: "CLI", title: "Pipe anything", text: "Use the compressor on its own, in scripts or CI.", code: "npm test 2>&1 | npx whittle compress" },
];

export default function Setup() {
  return (
    <div className="min-h-screen px-6 py-6 lg:px-10">
      <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Connect an agent</h1>
      <p className="text-[13px] text-mute">Whittle runs on your machine. It rewrites tool results only; prompts and replies pass through untouched, and every original is kept.</p>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {steps.map((s, i) => (
          <section key={s.title} className="panel rise p-5" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-center gap-3"><AgentIcon agent={s.agent} size={28} /><p className="text-[15px] font-medium">{s.title}</p><span className="ml-auto font-mono text-[11px] text-dim">0{i + 1}</span></div>
            <p className="mt-2 text-[13px] text-mute">{s.text}</p>
            <pre className="mt-4 overflow-x-auto rounded-lg border border-line bg-bg px-3.5 py-3 font-mono text-[12.5px] text-fg/90"><span className="select-none text-cut">$ </span>{s.code}</pre>
          </section>
        ))}
      </div>
      <section className="panel mt-4 p-5">
        <p className="text-[15px] font-medium">How the model gets the full output back</p>
        <p className="mt-2 max-w-3xl text-[13px] text-mute">
          Every compressed output ends with a one-line footer such as <code className="font-mono text-fg/85">[whittle: logs 4,812 → 612 tokens · full original: wh_3f2a…]</code>.
          If the agent needs the details it can fetch <code className="font-mono text-fg/85">GET /api/originals/wh_3f2a…</code>. Nothing is thrown away.
        </p>
      </section>
    </div>
  );
}
