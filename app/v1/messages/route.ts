import { forward } from "@/src/relay";

/* Anthropic-compatible: point ANTHROPIC_BASE_URL at whittle. */
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  return forward(req, "anthropic", process.env.WHITTLE_ANTHROPIC_UPSTREAM ?? "https://api.anthropic.com", "/v1/messages");
}
