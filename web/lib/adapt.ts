import type { BackendFolder, BackendItem } from "./api";
import type { ActionItem, Intent, ItemStatus, Platform, SaveItem } from "./types";

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

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days <= 0) return "just now";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? "1w ago" : `${weeks}w ago`;
}

function savedOnLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function formatDuration(seconds: number): string | undefined {
  if (!seconds) return undefined;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function toActionItems(items: { text: string; done: boolean }[]): ActionItem[] {
  return items.map((a) => ({ text: a.text, done: a.done }));
}

/**
 * Backend doesn't implement reminders/to-do scheduling (PRD addendum 2/3 scope cut), so
 * remind/why/due are display-only placeholders here, not persisted or computed server-side.
 */
export function adaptItem(item: BackendItem, folders: BackendFolder[]): SaveItem {
  const folderNames = item.folderIds
    .map((id) => folders.find((f) => f.id === id)?.name)
    .filter((n): n is string => Boolean(n));
  const folder = folderNames[0] ?? "";
  const isInbox = folders.find((f) => f.name === folder)?.isInbox ?? false;

  let status: ItemStatus = "processing";
  if (item.status === "ready") status = isInbox ? "review" : "ready";
  else if (item.status === "failed") status = "unavailable";

  return {
    id: item._id,
    key: item.sourceUrl,
    platform: PLATFORM_MAP[item.platform],
    status,
    step: item.status === "processing" ? "Processing…" : undefined,
    title: item.title || item.sourceUrl,
    kind: KIND_MAP[item.platform],
    length: formatDuration(item.durationSeconds),
    author: item.author,
    folder,
    tags: item.tags,
    intent: (item.intent && INTENT_MAP[item.intent]) || "",
    summary: item.summary,
    actions: toActionItems(item.actionItems),
    remind: "No reminder yet",
    why: "Reminders aren't wired up yet",
    due: false,
    saved: relativeTime(item.createdAt),
    savedOn: savedOnLabel(item.createdAt),
    language: "",
    confidence: item.confidence != null ? `${Math.round(item.confidence * 100)}%` : "",
    transcript: item.transcript || item.caption,
    transcriptEn: item.transcript ? "" : "No transcript (text post).",
  };
}
