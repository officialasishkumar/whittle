import { forward } from "@/src/relay";

/* OpenAI-compatible: set the client's base URL to http://localhost:4317/v1. */
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  return forward(req, "openai", process.env.WHITTLE_OPENAI_UPSTREAM ?? "https://api.openai.com", "/v1/chat/completions");
}
