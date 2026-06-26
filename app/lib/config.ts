export const config = {
  /** FastAPI — browser calls directly in prod (SSE). */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
  /** Next.js routes — GitHub tree proxy, local dev fallback. */
  appApiBaseUrl: "/api",
  upstreamBaseUrl: process.env.NEXT_API_BASE_URL ?? "http://localhost:8000",
} as const;
