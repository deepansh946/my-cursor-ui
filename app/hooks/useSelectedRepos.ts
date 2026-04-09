"use client";

import { useCallback, useEffect, useState } from "react";
import { loadSelectedRepos, saveSelectedRepos } from "../lib/selectedRepos";

export function useSelectedRepos() {
  const [repos, setReposState] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setReposState(loadSelectedRepos());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveSelectedRepos(repos);
  }, [repos, hydrated]);

  const setSelectedRepos = useCallback((next: string[]) => {
    setReposState(next);
  }, []);

  return { selectedRepos: repos, setSelectedRepos };
}
