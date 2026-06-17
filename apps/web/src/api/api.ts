const API_BASE = import.meta.env.VITE_API_URL || "";

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return (await res.json()) as T;
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T | void> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    console.error("API error:", body); // add this
    throw new Error(body.error ?? "Request failed");
  }

  if (res.status === 204) return;
  return res.json();
}