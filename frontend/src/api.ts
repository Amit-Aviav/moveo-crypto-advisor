// frontend/src/api.ts
const API = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

type Json = Record<string, unknown>;

async function request<T = any>(
  path: string,
  opts: RequestInit = {}
): Promise<T> {
  const url = `${API}${path.startsWith("/") ? "" : "/"}${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
      ...(opts.headers || {}),
    },
  });

  const text = await res.text();
  const data = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;

  if (!res.ok) {
    const msg = typeof data === "string"
      ? data
      : (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}

export async function login(email: string, password: string) {
  return request<{ token: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(name: string, email: string, password: string) {
  return request<{ token: string }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function getPrefs(token: string) {
  return request<{ ok: boolean; preferences: any | null }>(
    "/api/preferences/me",
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

export async function getDashboard(token: string) {
    return request<{ ok: boolean; sections: any }>("/api/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
  
  
export async function savePrefs(
  token: string,
  body: { investorType: string; assets: string[]; contentTypes: string[] }
) {
  return request<{ ok: boolean; preferences: any }>(
    "/api/preferences",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }
  );
}
export async function vote(
    token: string,
    body: { type: "news" | "price" | "insight" | "meme"; itemId: string; value: 1 | -1 }
  ) {
    return request<{ ok: boolean }>("/api/votes", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  }
  
