"use client";

import { useCallback, useEffect, useState } from "react";
import { loadSelectedRepo, saveSelectedRepo } from "../lib/selectedRepos";

export function useSelectedRepos() {
  const [repo, setRepoState] = useState<string | null>(() =>
    typeof window !== "undefined" ? loadSelectedRepo() : null,
  );
  const hydrated = typeof window !== "undefined";

  useEffect(() => {
    if (!hydrated) return;
    saveSelectedRepo(repo);
  }, [repo, hydrated]);

  const setSelectedRepo = useCallback((next: string | null) => {
    setRepoState(next);
  }, []);

  return { selectedRepo: repo, setSelectedRepo, reposHydrated: hydrated };
}
