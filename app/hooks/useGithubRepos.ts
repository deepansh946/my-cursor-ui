"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRepos } from "../services/github";

export function useGithubRepos(enabled: boolean) {
  return useQuery({
    queryKey: ["github-repos"],
    queryFn: fetchRepos,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
