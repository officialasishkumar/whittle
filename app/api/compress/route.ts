import { compress, type Kind } from "@/src/core";

/* Used by the playground; nothing is stored. */
export async function POST(req: Request) {
  const { text, kind } = (await req.json()) as { text: string; kind?: Kind | "auto" };
  const r = compress(text ?? "", { kind: kind && kind !== "auto" ? kind : undefined, minTokens: 0, footer: false });
  return Response.json(r);
}
