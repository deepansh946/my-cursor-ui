import { auth } from "../../../../../auth";
import { config } from "../../../../lib/config";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const { id } = await context.params;
  const repo = new URL(req.url).searchParams.get("repo");
  if (!repo) {
    return Response.json({ cloned: false }, { status: 400 });
  }
  const params = new URLSearchParams({ repo });
  const url = `${config.upstreamBaseUrl}/thread/${encodeURIComponent(id)}/repo-status?${params}`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: {
        ...(session?.accessToken && {
          Authorization: `Bearer ${session.accessToken}`,
        }),
      },
    });
    if (!res.ok) {
      return Response.json({ cloned: false }, { status: res.status });
    }
    return Response.json(await res.json());
  } catch {
    return Response.json({ cloned: false }, { status: 500 });
  }
}
