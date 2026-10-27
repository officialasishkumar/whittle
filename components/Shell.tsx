"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Mark({ size = 28 }: { size?: number }) {
  // three shavings coming off a block
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs><linearGradient id="wm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffb085" /><stop offset="1" stopColor="#ff6a2b" /></linearGradient></defs>
      <rect width="32" height="32" rx="9" fill="url(#wm)" />
      <path d="M8 21 C 12 21, 13 12, 17 12" fill="none" stroke="#1a0d06" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M13 23 C 17 23, 18 15, 22 15" fill="none" stroke="#1a0d06" strokeWidth="2.4" strokeLinecap="round" opacity=".7" />
      <path d="M18 25 C 21 25, 22 19, 25 19" fill="none" stroke="#1a0d06" strokeWidth="2.4" strokeLinecap="round" opacity=".45" />
    </svg>
  );
}

const nav = [
  { href: "/", label: "Overview", icon: "M3 13h4v8H3zM10 8h4v13h-4zM17 3h4v18h-4z" },
  { href: "/traces", label: "Traces", icon: "M4 6h16M4 12h10M4 18h13" },
  { href: "/playground", label: "Playground", icon: "M8 5l-5 7 5 7M16 5l5 7-5 7" },
  { href: "/setup", label: "Connect", icon: "M10 14a4 4 0 0 1 0-6l2-2a4 4 0 0 1 6 6l-1 1M14 10a4 4 0 0 1 0 6l-2 2a4 4 0 0 1-6-6l1-1" },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-[236px] shrink-0 flex-col border-r border-line bg-[#0b0b0d] px-3 py-4 md:flex">
        <Link href="/" className="flex items-center gap-2.5 px-2 py-1">
          <Mark /><span className="text-[17px] font-semibold tracking-[-0.02em]">whittle</span>
          <span className="ml-auto rounded-md border border-line2 px-1.5 py-0.5 font-mono text-[10px] text-mute">v0.1</span>
        </Link>
        <button type="button" className="mt-5 flex items-center gap-2 rounded-lg border border-line bg-panel px-2.5 py-2 text-left text-[13px] hover:border-line2">
          <span className="grid h-5 w-5 place-items-center rounded-md bg-gradient-to-br from-[#2b2b35] to-[#1a1a20] text-[10px] font-semibold">L</span>
          Local workspace
          <svg className="ml-auto h-3.5 w-3.5 text-mute" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 10l5 5 5-5" /></svg>
        </button>
        <nav className="mt-5 space-y-0.5">
          {nav.map((n) => {
            const on = n.href === "/" ? path === "/" : path.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] transition-colors ${on ? "bg-raise text-fg" : "text-mute hover:bg-raise/60 hover:text-fg"}`}>
                <svg className={`h-4 w-4 ${on ? "text-cut" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={n.icon} /></svg>
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-3 px-1">
          <div className="rounded-xl border border-line bg-panel p-3">
            <div className="flex items-center gap-2 text-[12.5px]"><span className="live h-2 w-2 rounded-full bg-keep" />Proxy running</div>
            <p className="mt-1 font-mono text-[11px] text-mute">localhost:4317</p>
          </div>
          <a href="https://github.com/officialasishkumar/whittle" className="flex items-center gap-2 px-1.5 text-[12.5px] text-mute hover:text-fg">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5z" /></svg>
            Open source · Apache-2.0
          </a>
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
