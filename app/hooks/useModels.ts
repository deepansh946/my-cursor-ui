"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchModels } from "../services/chat";

export function useModels() {
  return useQuery({
    queryKey: ["models"],
    queryFn: fetchModels,
    staleTime: 60 * 60 * 1000,
  });
}
