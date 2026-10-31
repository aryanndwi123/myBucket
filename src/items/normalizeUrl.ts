import { createHash } from "node:crypto";

// Tracking params that don't change what's being saved; stripped before hashing.
const TRACKING_PARAMS = ["igsh", "utm_source", "utm_medium", "utm_campaign", "s", "t"];

export type Platform = "instagram" | "twitter";

export function detectPlatform(rawUrl: string): Platform | null {
  let host: string;
  try {
    host = new URL(rawUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
  if (host === "instagram.com" || host === "www.instagram.com") return "instagram";
  if (["twitter.com", "www.twitter.com", "x.com", "www.x.com"].includes(host)) return "twitter";
  return null;
}

// normalizeUrl strips tracking params and trailing slashes so the same post
// shared with different query strings dedupes to one item.
export function normalizeUrl(rawUrl: string): string {
  const parsed = new URL(rawUrl);
  for (const param of TRACKING_PARAMS) {
    parsed.searchParams.delete(param);
  }
  parsed.hash = "";
  let normalized = parsed.toString();
  if (normalized.endsWith("/") && parsed.search === "") {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

export function hashUrl(normalizedUrl: string): string {
  return createHash("sha1").update(normalizedUrl).digest("hex");
}
