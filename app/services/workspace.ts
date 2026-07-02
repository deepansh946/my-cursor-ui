import { apiFetch } from "../lib/apiClient";

export type RepoStatus = {
  cloned: boolean;
  branch?: string;
  commit?: string;
  dirty?: boolean;
  changed_count?: number;
  changes?: string[];
};

export async function fetchRepoStatus(
  threadId: string,
  repo: string,
): Promise<RepoStatus> {
  const params = new URLSearchParams({ repo });
  const res = await apiFetch(
    `/thread/${encodeURIComponent(threadId)}/repo-status?${params}`,
  );
  if (!res.ok) return { cloned: false };
  return (await res.json()) as RepoStatus;
}
