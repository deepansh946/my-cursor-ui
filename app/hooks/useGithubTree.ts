"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchFileTree } from "../services/github";

export function useGithubTree(activeRepo: string | null) {
  const [owner, repo] = (activeRepo ?? "").split("/");
  return useQuery({
    queryKey: ["github-tree", owner, repo],
    queryFn: () => fetchFileTree(owner, repo),
    enabled: !!owner && !!repo,
    staleTime: 5 * 60 * 1000,
  });
}
