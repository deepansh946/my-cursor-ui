import { config } from "../../../../lib/config";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const url = `${config.upstreamBaseUrl}/thread/${encodeURIComponent(id)}/messages`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) {
      return Response.json({ messages: [] });
    }
    const data = await res.json();
    return Response.json(data);
  } catch {
    return Response.json({ messages: [] });
  }
}
