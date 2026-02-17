const API_BASE = process.env.NEXT_PUBLIC_VERIFY_API_URL ?? "http://localhost:4000";

export async function fetchSession(token: string) {
  const res = await fetch(`${API_BASE}/api/sessions/${token}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error: string }).error);
  }
  return res.json();
}

export async function verifySession(token: string, proofData?: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/api/sessions/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, proofData }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error: string }).error);
  }
  return res.json();
}
