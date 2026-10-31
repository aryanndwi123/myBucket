import { slugify } from "./folders";
import { newestFirst } from "./utils";
import type { SaveItem } from "./types";

export interface Topic {
  slug: string;
  name: string;
  /** The tag the topic is built on; empty for the leftovers bucket. */
  tag: string;
  saves: SaveItem[];
}

export const OTHER_SLUG = "other";
export const OTHER_NAME = "Everything else";

/** A tag needs this many saves in the folder before it becomes a topic. */
const MIN_SAVES = 2;
const MAX_TOPICS = 6;

const normalise = (tag: string) => tag.trim().replace(/^#/, "").toLowerCase();
/** "high-protein" → "High protein". */
const label = (tag: string) => {
  const spaced = tag.replace(/[-_]+/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

/**
 * Splits one folder's saves into topics.
 *
 * The backend has folders but no subcategories, so topics come from the classifier's own tags: a tag
 * shared by at least two saves becomes a topic, and every save goes to its most common topic tag, so
 * counts add up. Saves with no shared tag fall into "Everything else". When the PRD's
 * `GET /api/folders/:id/overview` exists (AI-named subcategories), replace this one function.
 */
export function topicsOf(saves: SaveItem[]): { topics: Topic[]; other: Topic } {
  const usable = saves.filter((x) => x.status !== "processing");

  const counts = new Map<string, number>();
  for (const x of usable) for (const t of new Set(x.tags.map(normalise).filter(Boolean))) counts.set(t, (counts.get(t) ?? 0) + 1);

  const ranked = [...counts.entries()]
    .filter(([, n]) => n >= MIN_SAVES)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, MAX_TOPICS)
    .map(([tag]) => tag);

  const buckets = new Map<string, SaveItem[]>(ranked.map((t) => [t, []]));
  const rest: SaveItem[] = [];
  for (const x of usable) {
    const own = new Set(x.tags.map(normalise));
    const home = ranked.find((t) => own.has(t));
    (home ? buckets.get(home)! : rest).push(x);
  }

  return {
    topics: ranked.map((t) => ({ slug: slugify(t), name: label(t), tag: t, saves: buckets.get(t)!.sort(newestFirst) })),
    other: { slug: OTHER_SLUG, name: OTHER_NAME, tag: "", saves: rest.sort(newestFirst) },
  };
}

/** Finds a topic by its URL slug; "other" is the leftovers bucket. */
export function topicBySlug(saves: SaveItem[], slug: string): Topic | null {
  const { topics, other } = topicsOf(saves);
  if (slug === OTHER_SLUG) return other;
  return topics.find((t) => t.slug === slug) ?? null;
}
