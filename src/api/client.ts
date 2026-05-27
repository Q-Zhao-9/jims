const API_BASE = "/api/v1";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function detailMessage(data: unknown): string {
  if (data == null || typeof data !== "object") return "Request failed";
  const d = data as { detail?: unknown };
  if (typeof d.detail === "string") return d.detail;
  if (Array.isArray(d.detail)) return JSON.stringify(d.detail);
  return "Request failed";
}

export async function apiJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const headers: HeadersInit = {
    Accept: "application/json",
    ...(init?.body && !(init.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...init?.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      const hint =
        text.trimStart().startsWith("<") && res.status >= 500
          ? "The API is unavailable (server returned HTML instead of JSON). If you use Docker, restart the web container or rebuild after updating nginx config."
          : "The server returned a non-JSON response.";
      throw new ApiError(res.status, hint);
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, detailMessage(data), data);
  }

  return data as T;
}

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
