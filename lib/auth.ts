const TOKEN_KEY = "quiz_token";
const REFRESH_TOKEN_KEY = "quiz_refresh_token";
const USER_KEY = "quiz_user";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setStoredSession(accessToken: string, refreshToken: string, user?: { id: string; email?: string; name?: string; username?: string } | null) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function clearStoredSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function refreshTokens(): Promise<string | null> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    console.warn("Token refresh failed:", data.error);
    clearStoredSession();
    return null;
  }

  const data = await res.json();
  if (data.access_token) {
    setStoredSession(
      data.access_token,
      data.refresh_token ?? refreshToken,
      data.user ?? null
    );
    return data.access_token;
  }
  return null;
}

export type FetchWithAuthOptions = RequestInit & { skipAuth?: boolean };

/**
 * fetch wrapper that adds Bearer token and auto-refreshes on 401.
 * On 401: tries to refresh token, retries request once, then throws.
 */
export async function fetchWithAuth(
  url: string | URL,
  options: FetchWithAuthOptions = {}
): Promise<Response> {
  const { skipAuth, ...fetchOptions } = options;
  const init: RequestInit = { ...fetchOptions };

  let token = getStoredToken();
  if (!skipAuth && token) {
    init.headers = new Headers(init.headers);
    (init.headers as Headers).set("Authorization", `Bearer ${token}`);
  }

  let res = await fetch(url, init);

  if (res.status === 401 && !skipAuth && token) {
    const newToken = await refreshTokens();
    if (newToken) {
      init.headers = new Headers(init.headers);
      (init.headers as Headers).set("Authorization", `Bearer ${newToken}`);
      res = await fetch(url, init);
    }
  }

  return res;
}
