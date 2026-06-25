import { auth } from "../../../../auth";
import { config } from "../../../lib/config";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const { id } = await context.params;
  const url = `${config.upstreamBaseUrl}/thread/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      ...(session?.accessToken && {
        Authorization: `Bearer ${session.accessToken}`,
      }),
    },
  });
  return new Response(res.body, { status: res.status });
}
