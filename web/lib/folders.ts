import type { Folder, FolderName } from "./types";

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
/** The Inbox folder has its own page; every other folder lives under /folders. */
export const folderHref = (name: FolderName) => (name === "Inbox" ? "/inbox" : `/folders/${slugify(name)}`);
export const topicHref = (folder: FolderName, topicSlug: string) => `${folderHref(folder)}/${topicSlug}`;

/** Folders are loaded at runtime, so a route's slug is resolved against the user's own list. */
export const folderFromSlug = (folders: Folder[], slug: string): Folder | null =>
  folders.find((f) => !f.isInbox && slugify(f.name) === slug) ?? null;
