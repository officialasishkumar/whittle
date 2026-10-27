"use client";
import { useState } from "react";

/* The id an agent quotes back to fetch the untouched original from /api/originals/<id>. */
export default function CopyId({ id }: { id: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" onClick={async () => { await navigator.clipboard.writeText(id); setDone(true); setTimeout(() => setDone(false), 1200); }}
      className="rounded-md border border-line px-2 py-1 font-mono text-[11px] text-mute hover:border-line2 hover:text-fg">
      {done ? "copied" : id}
    </button>
  );
}
