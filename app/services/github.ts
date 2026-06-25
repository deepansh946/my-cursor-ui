import { config } from "../lib/config";

export type RepoRow = {
  full_name: string;
  name: string;
  private: boolean;
  default_branch: string;
};

export type FlatNode = { path: string; type: string };

export async function fetchRepos(): Promise<RepoRow[]> {
  const res = await fetch(`${config.apiBaseUrl}/github/repos`);
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = (await res.json()) as { error?: string };
      if (typeof j.error === "string") msg = j.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  const data = (await res.json()) as { repos?: RepoRow[] };
  return data.repos ?? [];
}

export async function fetchFileTree(
  owner: string,
  repo: string,
): Promise<FlatNode[]> {
  const res = await fetch(
    `${config.apiBaseUrl}/github/tree/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
  );
  if (!res.ok) throw new Error("Failed to load tree");
  const data = (await res.json()) as { tree?: FlatNode[] };
  return data.tree ?? [];
}
