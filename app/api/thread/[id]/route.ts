import { auth } from "@/auth";
import { config } from "../../../lib/config";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const url = `${config.upstreamBaseUrl}/thread/${encodeURIComponent(id)}`;
  const res = await fetch(url, { method: "DELETE" });
  return new Response(res.body, { status: res.status });
}
