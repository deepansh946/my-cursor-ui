import { auth } from "../../../../auth";
import { config } from "../../../lib/config";

export async function GET() {
  const session = await auth();
  if (!session?.accessToken) {
    return Response.json({ repos: [] }, { status: 401 });
  }
  try {
    const res = await fetch(`${config.upstreamBaseUrl}/github/repos`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    if (!res.ok) return Response.json({ repos: [] }, { status: res.status });
    return Response.json(await res.json());
  } catch {
    return Response.json({ repos: [] }, { status: 500 });
  }
}
