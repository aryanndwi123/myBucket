const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error ?? `request failed: ${res.status}`);
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

export const api = {
  register: (username: string, password: string) =>
    request<{ user: BackendUser }>("/api/auth/register", { method: "POST", body: JSON.stringify({ username, password }) }),
  login: (username: string, password: string) =>
    request<{ user: BackendUser }>("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),
  me: () => request<{ user: BackendUser }>("/api/auth/me"),

  listItems: () => request<{ items: BackendItem[] }>("/api/items"),
  createItem: (url: string) =>
    request<{ item: BackendItem; alreadySaved: boolean }>("/api/items", { method: "POST", body: JSON.stringify({ url }) }),
  patchItem: (id: string, body: { folderIds?: string[]; title?: string; actionItems?: BackendActionItem[] }) =>
    request<{ item: BackendItem }>(`/api/items/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteItem: (id: string) => request<void>(`/api/items/${id}`, { method: "DELETE" }),

  listFolders: () => request<{ folders: BackendFolder[] }>("/api/folders"),

  search: (q: string) => request<{ items: BackendItem[] }>(`/api/search?q=${encodeURIComponent(q)}`),
};
