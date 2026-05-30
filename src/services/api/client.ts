/**
 * Central API client + mock toggle.
 *
 * Real API integration:
 *   1. Set USE_MOCK = false below.
 *   2. Make sure your backend exposes the endpoints declared in each
 *      resource file under src/services/api/* (paths + payload shapes).
 *   3. Optionally set VITE_API_BASE_URL to a non-empty origin.
 *
 * Everything UI-side (hooks in src/hooks/queries, admin pages, public pages)
 * stays exactly the same.
 */
export const USE_MOCK = true;

const BASE_URL =
  (typeof import.meta !== "undefined" &&
    (import.meta as unknown as { env?: Record<string, string> }).env
      ?.VITE_API_BASE_URL) ||
  "";

export type ListParams = {
  q?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  filters?: Record<string, unknown>;
};

export type ListResult<T> = { data: T[]; total: number };

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  query?: Record<string, unknown>,
): Promise<T> {
  const url = new URL(
    path,
    BASE_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost"),
  );
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, typeof v === "object" ? JSON.stringify(v) : String(v));
    }
  }
  const res = await fetch(url.toString(), {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} failed: ${res.status}`);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const httpClient = {
  get: <T>(path: string, query?: Record<string, unknown>) =>
    request<T>("GET", path, undefined, query),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
