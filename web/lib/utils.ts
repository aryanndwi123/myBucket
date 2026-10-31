import type { OmniMode, Platform, SaveItem, TypeFilter } from "./types";

export const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ");

const URL_RE = /https?:\/\/\S+|^[\w.-]+\.(com|in|be|co|org|net)\/\S*/i;

/** Pulls the first link out of shared text like "Check this out https://…". */
export function extractUrl(text: string): string | null {
  const match = text.trim().match(URL_RE);
  return match ? match[0] : null;
}

/**
 * Canonical key for a quick client-side duplicate check: drops protocol, www, query and trailing slash.
 * The server does the authoritative dedupe (it returns `alreadySaved`).
 */
export function canonicalKey(url: string): string {
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/^twitter\.com/, "x.com")
    .replace(/[?#].*$/, "")
    .replace(/\/$/, "");
}

/** The platform a link belongs to, or null when the backend can't extract it. */
export function detectPlatform(url: string): Platform | null {
  const host = canonicalKey(url).split("/")[0];
  if (host.includes("instagram")) return "instagram";
  if (/(^|\.)x\.com$/.test(host)) return "x";
  return null;
}

/** One box does everything: a link saves, words search, a question asks. */
export function detectMode(input: string): OmniMode {
  const q = input.trim();
  if (!q) return "idle";
  if (extractUrl(q)) return "save";
  if (/\?$/.test(q) || /^(what|which|where|when|how|that|find|show)\b/i.test(q)) return "ask";
  return "search";
}

export function matchesFilter(item: SaveItem, filter: TypeFilter): boolean {
  switch (filter) {
    case "Reels": return item.kind === "Reel";
    case "X": return item.kind === "Post on X";
    case "To try": return item.intent === "Try";
    case "To learn": return item.intent === "Learn" || item.intent === "Watch";
    case "To apply": return item.intent === "Apply";
    default: return true;
  }
}

/** Substring match over what's already loaded, so results update on every keystroke. */
export function matchesQuery(item: SaveItem, q: string): boolean {
  if (!q) return true;
  const hay = [item.title, item.summary, item.tags.join(" "), item.folders.join(" "), item.author, item.text].join(" ").toLowerCase();
  return hay.includes(q.toLowerCase());
}

export function kindLabel(item: SaveItem) {
  return item.length ? `${item.kind} · ${item.length}` : item.kind;
}

export const newestFirst = (a: SaveItem, b: SaveItem) => b.createdAt - a.createdAt;
export const oldestFirst = (a: SaveItem, b: SaveItem) => a.createdAt - b.createdAt;
