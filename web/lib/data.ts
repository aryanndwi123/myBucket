import type { TypeFilter } from "./types";

/** Folders are created dynamically by the AI classifier (PRD: no fixed taxonomy) —
 * these are only fallback colours for folder names we don't have a curated tint for. */
export const FOLDER_TINT: Record<string, string> = {
  Recipes: "#F5C9A6",
  Coding: "#F1DF9E",
  Career: "#D8D1F0",
  Fitness: "#C9DDBB",
  Travel: "#BBD8DC",
  Tools: "#EBCFC6",
  Inbox: "#E6DED0",
};

/** Stronger accent per folder, used for small dots and rails. */
export const FOLDER_DOT: Record<string, string> = {
  Recipes: "#D9773F",
  Coding: "#B8952A",
  Career: "#7A68C2",
  Fitness: "#5E8C4A",
  Travel: "#3E8791",
  Tools: "#B0614E",
  Inbox: "#8A7E72",
};

const TINT_PALETTE = ["#F5C9A6", "#F1DF9E", "#D8D1F0", "#C9DDBB", "#BBD8DC", "#EBCFC6", "#E3C9D6", "#CFE0E8"];
const DOT_PALETTE = ["#D9773F", "#B8952A", "#7A68C2", "#5E8C4A", "#3E8791", "#B0614E", "#A8527A", "#4A7FA3"];

function hashIndex(name: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h % mod;
}

/** Tint for any folder name, including ones the AI just created — curated map first, hashed palette otherwise. */
export function tintFor(name: string): string {
  return FOLDER_TINT[name] ?? TINT_PALETTE[hashIndex(name, TINT_PALETTE.length)];
}

export function dotFor(name: string): string {
  return FOLDER_DOT[name] ?? DOT_PALETTE[hashIndex(name, DOT_PALETTE.length)];
}

export const TYPE_FILTERS: TypeFilter[] = ["All types", "Reels", "X", "To try", "To learn", "To apply"];
