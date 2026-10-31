import type { BackendFolder, BackendItem } from "./api";
import type { Folder, Intent, ItemStatus, Platform, SaveItem } from "./types";

const PLATFORM_MAP: Record<BackendItem["platform"], Platform> = {
  instagram: "instagram",
  twitter: "x",
};

const KIND_MAP: Record<BackendItem["platform"], string> = {
  instagram: "Reel",
  twitter: "Post on X",
};

const INTENT_MAP: Record<string, Intent> = {
  learn: "Learn",
  try: "Try",
  buy: "Buy",
  visit: "Visit",
  apply: "Apply",
  watch: "Watch",
  inspire: "Inspire",
};

export function toFolder(f: BackendFolder): Folder {
  return { id: f.id, name: f.name, description: f.description, isInbox: f.isInbox };
}

/** "just now", "5m ago", "3h ago", "2d ago", "3w ago", "4mo ago". */
export function relativeTime(createdAt: number, now = Date.now()): string {
  const minutes = Math.floor((now - createdAt) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 60) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function savedOnLabel(createdAt: number): string {
  return new Date(createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function formatDuration(seconds: number): string | undefined {
  if (!seconds) return undefined;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function adaptItem(item: BackendItem, folders: Folder[]): SaveItem {
  const filed = item.folderIds.map((id) => folders.find((f) => f.id === id)).filter((f): f is Folder => Boolean(f));
  const real = filed.filter((f) => !f.isInbox);
  const primary = real[0] ?? filed[0];
  const inboxOnly = filed.length > 0 && real.length === 0;

  let status: ItemStatus = "processing";
  if (item.status === "ready") status = inboxOnly ? "review" : "ready";
  else if (item.status === "failed") status = "unavailable";

  const createdAt = new Date(item.createdAt).getTime();
  const fromAudio = Boolean(item.transcript);

  return {
    id: item._id,
    url: item.sourceUrl,
    platform: PLATFORM_MAP[item.platform],
    status,
    step: item.status === "processing" ? "Processing…" : undefined,
    error: item.status === "failed" ? (item.error ?? "We couldn’t read this link.") : undefined,
    title: item.title || item.sourceUrl,
    kind: KIND_MAP[item.platform],
    length: formatDuration(item.durationSeconds),
    author: item.author,
    folder: primary?.name ?? "",
    folders: filed.map((f) => f.name),
    tags: item.tags,
    intent: (item.intent && INTENT_MAP[item.intent]) || "",
    summary: item.summary,
    actions: item.actionItems.map((a) => ({ text: a.text, done: a.done })),
    thumbnailUrl: item.thumbnailUrl,
    saved: relativeTime(createdAt),
    savedOn: savedOnLabel(createdAt),
    createdAt,
    confidence: item.confidence != null ? `${Math.round(item.confidence * 100)}%` : "",
    text: item.transcript || item.caption,
    textSource: fromAudio ? "audio" : "post",
  };
}

/** A save the user just made, shown while the (synchronous) create request is still open. */
export function pendingItem(id: string, url: string, platform: Platform): SaveItem {
  const createdAt = Date.now();
  return {
    id,
    url,
    platform,
    status: "processing",
    step: "Reading the post and picking a folder…",
    pending: true,
    title: url,
    kind: platform === "x" ? "Post on X" : "Reel",
    author: "",
    folder: "",
    folders: [],
    tags: [],
    intent: "",
    summary: "",
    actions: [],
    thumbnailUrl: "",
    saved: "just now",
    savedOn: savedOnLabel(createdAt),
    createdAt,
    confidence: "",
    text: "",
    textSource: "post",
  };
}
