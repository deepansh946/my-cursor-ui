import { auth } from "../../../../../auth";
import { config } from "../../../../lib/config";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const { id } = await context.params;
  const body = await req.json();
  const url = `${config.upstreamBaseUrl}/thread/${encodeURIComponent(id)}/clone`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(session?.accessToken && {
        Authorization: `Bearer ${session.accessToken}`,
      }),
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
