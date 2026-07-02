import { config } from "../../lib/config";

export async function GET() {
  try {
    const res = await fetch(`${config.upstreamBaseUrl}/models`);
    if (!res.ok) {
      return Response.json({ models: [], default: "gemini-2.5-flash" }, { status: res.status });
    }
    return Response.json(await res.json());
  } catch {
    return Response.json({ models: [], default: "gemini-2.5-flash" }, { status: 500 });
  }
}
