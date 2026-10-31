import { FOLDERS, FOLDER_SUBS } from "./data";
import type { ContentFolder, FolderName, SaveItem } from "./types";

/** Label for saves that are in a category but not yet filed under one of its subcategories. */
export const UNSORTED = "Unsorted";
const UNSORTED_SLUG = "unsorted";

/** "Cafés" → "cafes", "System design" → "system-design". */
export const slugify = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// ---- hrefs ---------------------------------------------------------------------------------
export const saveHref = (id: string) => `/saves/${id}`;
export const folderHref = (folder: FolderName) => (folder === "Inbox" ? "/inbox" : `/folders/${slugify(folder)}`);
/** `sub` of "" is the Unsorted bucket. */
export const subHref = (folder: ContentFolder, sub: string) => `/folders/${slugify(folder)}/${sub ? slugify(sub) : UNSORTED_SLUG}`;

// ---- route params → taxonomy ------------------------------------------------------------------
export const folderFromSlug = (slug: string): ContentFolder | null => FOLDERS.find((f) => slugify(f) === slug) ?? null;

/** Returns the subcategory name, "" for the Unsorted bucket, or null when the slug matches nothing. */
export function subFromSlug(folder: ContentFolder, slug: string): string | null {
  if (slug === UNSORTED_SLUG) return "";
  return FOLDER_SUBS[folder].find((s) => slugify(s) === slug) ?? null;
}

// ---- grouping ------------------------------------------------------------------------------
/** Live saves in a category that belong to `sub` ("" = none of the known subcategories). */
export function inSub(saves: SaveItem[], folder: ContentFolder, sub: string): SaveItem[] {
  const known = FOLDER_SUBS[folder];
  return saves.filter((x) => x.folder === folder && (sub ? x.subcategory === sub : !known.includes(x.subcategory)));
}
