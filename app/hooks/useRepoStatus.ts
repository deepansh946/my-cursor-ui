"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRepoStatus } from "../services/workspace";

export function useRepoStatus(
  threadId: string | null,
  repo: string | null,
  streaming: boolean,
) {
  return useQuery({
    queryKey: ["repo-status", threadId, repo],
    queryFn: () => fetchRepoStatus(threadId!, repo!),
    enabled: !!threadId && !!repo,
    refetchInterval: streaming ? 3000 : 120_000,
    staleTime: 0,
  });
}
