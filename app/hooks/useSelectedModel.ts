"use client";

import { useCallback, useEffect, useState } from "react";
import { loadSelectedModel, saveSelectedModel } from "../lib/selectedModels";

export function useSelectedModel() {
  const [modelId, setModelIdState] = useState<string | null>(() =>
    typeof window !== "undefined" ? loadSelectedModel() : null,
  );
  const hydrated = typeof window !== "undefined";

  useEffect(() => {
    if (!hydrated) return;
    saveSelectedModel(modelId);
  }, [modelId, hydrated]);

  const setSelectedModel = useCallback((next: string | null) => {
    setModelIdState(next);
  }, []);

  return { selectedModel: modelId, setSelectedModel, modelsHydrated: hydrated };
}
