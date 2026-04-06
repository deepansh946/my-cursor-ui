export const config = {
  upstreamBaseUrl: process.env.NEXT_API_BASE_URL ?? "http://localhost:8000",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
} as const;
