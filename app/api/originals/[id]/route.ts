import { getOriginal } from "@/src/store";

/* Agents (or you) can fetch the untouched original behind any "full original: wh_…" footer. */
export const dynamic = "force-dynamic";
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const o = getOriginal(id);
  return o ? new Response(o.text, { headers: { "content-type": "text/plain; charset=utf-8" } }) : new Response("not found", { status: 404 });
}
