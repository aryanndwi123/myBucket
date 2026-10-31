import type { OmniMode, Platform, SaveItem, TypeFilter } from "./types";

export const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ");

const URL_RE = /https?:\/\/\S+|^[\w.-]+\.(com|in|be|co|org|net)\/\S*/i;

/** Pulls the first link out of shared text like "Check this out https://…". */
export function extractUrl(text: string): string | null {
  const match = text.trim().match(URL_RE);
  return match ? match[0] : null;
}

/**
 * Canonical key for dedupe: drops protocol, www, query (igsh, utm_*, s, t) and trailing slash.
 * The server should do the real version (resolve short links, then hash).
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

export function detectPlatform(key: string): Platform {
  const host = key.split("/")[0];
  if (host.includes("instagram")) return "instagram";
  if (/(^|\.)x\.com$|^t\.co$/.test(host)) return "x";
  if (host.includes("linkedin") || host.includes("lnkd")) return "linkedin";
  if (host.includes("youtu")) return "youtube";
  return "web";
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
    case "LinkedIn": return item.kind === "LinkedIn post";
    case "YouTube": return item.kind === "YouTube";
    case "To try": return item.intent === "Try";
    case "To learn": return item.intent === "Learn" || item.intent === "Watch";
    case "To apply": return item.intent === "Apply";
    default: return true;
  }
}

export function matchesQuery(item: SaveItem, q: string): boolean {
  if (!q) return true;
  const hay = [item.title, item.summary, item.tags.join(" "), item.folder, item.subcategory, item.author, item.transcript].join(" ").toLowerCase();
  return hay.includes(q.toLowerCase());
}

const STOP = new Set(["that", "the", "what", "was", "about", "with", "should", "this", "one", "reel", "saved", "for", "and", "find", "show"]);
const SYNONYMS: Record<string, string> = {
  job: "career apply hiring", jobs: "career apply hiring", apply: "career hiring",
  learn: "coding learn react", protein: "paneer high-protein", breakfast: "paneer",
  recipe: "recipes", workout: "fitness strength", cafe: "cafes travel", cafes: "travel", budget: "notion money",
};

/**
 * Client-side stand-in for POST /api/ask (vector search + LLM answer).
 * Returns up to 3 item ids ranked by keyword overlap.
 */
export function mockAsk(items: SaveItem[], question: string): string[] {
  const words = question.toLowerCase().split(/[^a-z0-9-]+/).filter((w) => w.length > 2 && !STOP.has(w));
  const terms = words.flatMap((w) => [w, ...(SYNONYMS[w]?.split(" ") ?? [])]);
  return items
    .filter((x) => x.status !== "processing" && !x.archived)
    .map((x) => {
      const hay = [x.title, x.summary, x.tags.join(" "), x.folder, x.intent, x.transcript, x.transcriptEn].join(" ").toLowerCase();
      return { id: x.id, score: terms.filter((t) => hay.includes(t)).length };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((r) => r.id);
}

export function kindLabel(item: SaveItem) {
  return item.length ? `${item.kind} · ${item.length}` : item.kind;
}

const UNIT_HOURS: Record<string, number> = { m: 1 / 60, h: 1, d: 24, w: 24 * 7 };

/**
 * Age in hours from the "7d ago" display label. A stand-in until the API returns `createdAt`;
 * then sort on that and delete this.
 */
export function ageHours(saved: string): number {
  const match = saved.match(/^(\d+)\s*([mhdw])/);
  return match ? Number(match[1]) * UNIT_HOURS[match[2]] : 0;
}

export const newestFirst = (a: SaveItem, b: SaveItem) => ageHours(a.saved) - ageHours(b.saved);
export const oldestFirst = (a: SaveItem, b: SaveItem) => ageHours(b.saved) - ageHours(a.saved);
