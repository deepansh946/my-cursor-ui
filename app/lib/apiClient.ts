import { getSession } from "next-auth/react";
import { config } from "./config";

export async function authHeaders(): Promise<Record<string, string>> {
  const session = await getSession();
  const headers: Record<string, string> = {};
  if (session?.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return headers;
}

export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const auth = await authHeaders();
  const headers = new Headers(init?.headers);
  for (const [key, value] of Object.entries(auth)) {
    headers.set(key, value);
  }
  return fetch(`${config.apiBaseUrl}${path}`, { ...init, headers });
}
