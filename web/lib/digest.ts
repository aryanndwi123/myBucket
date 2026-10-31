import type { SaveItem } from "./types";
import { newestFirst } from "./utils";

export interface Digest {
  count: number;
  /** A short roll-up of the saves, newest first. Empty when there are no saves. */
  overview: string;
  /** One line per save, for a "key takeaways" list. */
  points: { id: string; title: string; text: string }[];
  /** Most used tags first. */
  tags: string[];
  todos: { done: number; total: number };
  dueToday: number;
}

/** First sentence, without its closing full stop. */
export function firstSentence(text: string): string {
  const match = text.trim().match(/^.*?[.!?](?=\s|$)/);
  return (match ? match[0] : text.trim()).replace(/[.!?]+$/, "");
}

const MAX_OVERVIEW = 260;

/**
 * Builds a subcategory summary from the saves in it: the lead sentence of each save's own summary.
 * This is the stand-in for one small LLM call per subcategory (see the Backend page), which would
 * read the same inputs and write a real paragraph.
 */
export function digest(saves: SaveItem[]): Digest {
  const ordered = [...saves].filter((x) => x.status !== "processing").sort(newestFirst);

  const points = ordered.map((x) => ({ id: x.id, title: x.title, text: firstSentence(x.summary) })).filter((p) => p.text);

  let overview = "";
  for (const p of points) {
    const next = overview ? `${overview}. ${p.text}` : p.text;
    if (overview && next.length > MAX_OVERVIEW) break;
    overview = next;
  }
  if (overview) overview += ".";

  const tagCount = new Map<string, number>();
  for (const x of ordered) for (const t of x.tags) tagCount.set(t, (tagCount.get(t) ?? 0) + 1);
  const tags = [...tagCount.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t).slice(0, 5);

  const actions = ordered.flatMap((x) => x.actions);

  return {
    count: ordered.length,
    overview,
    points,
    tags,
    todos: { done: actions.filter((a) => a.done).length, total: actions.length },
    dueToday: ordered.filter((x) => x.due && !x.finished).length,
  };
}
