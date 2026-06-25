import { auth } from "../../../../../../auth";

export async function GET(
  _req: Request,
  context: { params: Promise<{ owner: string; repo: string }> },
) {
  const session = await auth();
  if (!session?.accessToken) {
    return Response.json({ tree: [] }, { status: 401 });
  }
  const { owner, repo } = await context.params;
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          Accept: "application/vnd.github+json",
        },
      },
    );
    if (!res.ok) return Response.json({ tree: [] }, { status: res.status });
    const data = (await res.json()) as { tree?: { path: string; type: string }[] };
    return Response.json({ tree: data.tree ?? [] });
  } catch {
    return Response.json({ tree: [] }, { status: 500 });
  }
}
