import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

type GitHubRepo = {
  full_name?: string;
  name?: string;
  private?: boolean;
  default_branch?: string;
};

export async function GET(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  if (!token?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const collected: GitHubRepo[] = [];
  let nextUrl: string | null =
    "https://api.github.com/user/repos?per_page=100&sort=updated";

  while (nextUrl && collected.length < 200) {
    const ghRes: Response = await fetch(nextUrl, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token.accessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!ghRes.ok) {
      const errText = await ghRes.text();
      return Response.json(
        { error: errText || ghRes.statusText },
        { status: ghRes.status },
      );
    }

    const page = (await ghRes.json()) as unknown;
    if (!Array.isArray(page)) break;
    collected.push(...(page as GitHubRepo[]));

    const linkHeader: string | null = ghRes.headers.get("link");
    nextUrl = null;
    if (linkHeader) {
      const nextMatch: RegExpMatchArray | null = linkHeader.match(
        /<([^>]+)>;\s*rel="next"/,
      );
      if (nextMatch) nextUrl = nextMatch[1];
    }
  }

  const repos = collected
    .map((r) => ({
      full_name: r.full_name ?? "",
      name: r.name ?? "",
      private: !!r.private,
      default_branch: r.default_branch ?? "main",
    }))
    .filter((r) => r.full_name);

  return Response.json({ repos });
}
