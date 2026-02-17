const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface FetchOptions {
  method?: string;
  body?: Record<string, unknown>;
  token?: string;
  apiKey?: string;
}

export async function api<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;
  if (opts.apiKey) headers["X-API-Key"] = opts.apiKey;

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method ?? (opts.body ? "POST" : "GET"),
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error: string }).error);
  }

  return res.json() as Promise<T>;
}
