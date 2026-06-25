import { auth } from "../../../auth";
import { config } from "../../lib/config";

export async function POST(req: Request) {
  const session = await auth();
  const body = (await req.json()) as Record<string, unknown>;
  const upstream = await fetch(`${config.upstreamBaseUrl}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(session?.accessToken && {
        Authorization: `Bearer ${session.accessToken}`,
      }),
    },
    body: JSON.stringify({
      ...body,
      github_token: session?.accessToken ?? "",
    }),
  });
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { "Content-Type": "text/event-stream" },
  });
}
