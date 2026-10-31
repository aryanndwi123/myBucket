/**
 * Base URL of the API. Empty means same-origin: `next.config.ts` proxies /api and /mcp to the backend
 * (API_URL), which keeps the session cookie first-party. Set NEXT_PUBLIC_API_URL only to call the
 * backend directly from the browser (then the backend's cookie must be SameSite=None; Secure).
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/** Fired when a data request returns 401, so the app can drop back to the login screen. */
export const UNAUTHORIZED_EVENT = "stashd:unauthorized";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError(0, "Can’t reach the server. Check your connection and try again.");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (res.status === 401 && !path.startsWith("/api/auth/") && typeof window !== "undefined") {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    throw new ApiError(res.status, typeof body.error === "string" ? body.error : `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface BackendUser {
  id: string;
  username: string;
}

export interface BackendActionItem {
  text: string;
  done: boolean;
}

export interface BackendItem {
  _id: string;
  userId: string;
  platform: "instagram" | "twitter";
  sourceUrl: string;
  status: "processing" | "ready" | "failed";
  error: string | null;
  author: string;
  caption: string;
  transcript: string;
  thumbnailUrl: string;
  durationSeconds: number;
  title: string;
  summary: string;
  tags: string[];
  intent: string | null;
  actionItems: BackendActionItem[];
  confidence: number | null;
  folderIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BackendFolder {
  id: string;
  name: string;
  description: string;
  isInbox: boolean;
  itemCount: number;
}

export interface BackendToken {
  _id: string;
  label: string;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface ItemPatch {
  folderIds?: string[];
  title?: string;
  actionItems?: BackendActionItem[];
}

export const api = {
  register: (username: string, password: string) =>
    request<{ user: BackendUser }>("/api/auth/register", { method: "POST", body: JSON.stringify({ username, password }) }),
  login: (username: string, password: string) =>
    request<{ user: BackendUser }>("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),
  me: () => request<{ user: BackendUser }>("/api/auth/me"),

  listItems: () => request<{ items: BackendItem[] }>("/api/items"),
  getItem: (id: string) => request<{ item: BackendItem }>(`/api/items/${encodeURIComponent(id)}`),
  /** Stays open until extraction and classification finish (several seconds). */
  createItem: (url: string) => request<{ item: BackendItem; alreadySaved: boolean }>("/api/items", { method: "POST", body: JSON.stringify({ url }) }),
  patchItem: (id: string, body: ItemPatch) =>
    request<{ item: BackendItem }>(`/api/items/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteItem: (id: string) => request<void>(`/api/items/${encodeURIComponent(id)}`, { method: "DELETE" }),
  retryItem: (id: string) => request<{ item: BackendItem }>(`/api/items/${encodeURIComponent(id)}/retry`, { method: "POST" }),

  listFolders: () => request<{ folders: BackendFolder[] }>("/api/folders"),

  search: (q: string, limit = 20) => request<{ items: BackendItem[] }>(`/api/search?q=${encodeURIComponent(q)}&limit=${limit}`),

  listTokens: () => request<{ tokens: BackendToken[] }>("/api/tokens"),
  /** The raw token is returned once and never stored. */
  createToken: (label?: string) => request<{ token: string }>("/api/tokens", { method: "POST", body: JSON.stringify({ label }) }),
  deleteToken: (id: string) => request<void>(`/api/tokens/${encodeURIComponent(id)}`, { method: "DELETE" }),
};
