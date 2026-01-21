const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function buildUrl(path: string) {
  const base = (BASE_URL ?? "").replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export async function httpJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(buildUrl(path), {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      data?.message ||
      (data?.errors ? JSON.stringify(data.errors) : "") ||
      `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}
