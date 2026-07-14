import { auth } from "../../../../../../auth";

export async function GET(
  _req: Request,
  context: { params: Promise<{ owner: string; repo: string }> },
) {
  const session = await auth();
  const { owner, repo } = await context.params;
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
    };
    if (session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
      { headers },
    );
    if (!res.ok) return Response.json({ tree: [] }, { status: res.status });
    const data = (await res.json()) as { tree?: { path: string; type: string }[] };
    return Response.json({ tree: data.tree ?? [] });
  } catch {
    return Response.json({ tree: [] }, { status: 500 });
  }
}
