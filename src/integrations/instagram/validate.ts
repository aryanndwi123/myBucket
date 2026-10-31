import { UnsupportedPlatformError } from "./errors";

const ALLOWED_HOSTS = ["instagram.com", "www.instagram.com"];

// Only /p/<id>, /reel/<id>, and /tv/<id> are single posts yt-dlp can extract.
// A bare profile path (e.g. /gravity_fitnz) looks valid but isn't — yt-dlp's
// user extractor can't dump a single post from it and fails cryptically.
const POST_PATH_RE = /^\/(p|reel|tv)\/[^/]+\/?$/;

// Pins extraction to Instagram's own domain so this endpoint can't become
// an open URL-fetch proxy for arbitrary links, and to a single-post path so
// profile/home URLs fail fast with a clear error instead of a yt-dlp crash.
export function validateInstagramUrl(rawUrl: string): void {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new UnsupportedPlatformError(rawUrl);
  }
  if (parsed.protocol !== "https:") {
    throw new UnsupportedPlatformError(rawUrl);
  }
  if (!ALLOWED_HOSTS.includes(parsed.hostname.toLowerCase())) {
    throw new UnsupportedPlatformError(rawUrl);
  }
  if (!POST_PATH_RE.test(parsed.pathname)) {
    throw new UnsupportedPlatformError(rawUrl);
  }
}
