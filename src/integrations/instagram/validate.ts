import { UnsupportedPlatformError } from "./errors";

const ALLOWED_HOSTS = ["instagram.com", "www.instagram.com"];

// Pins extraction to Instagram's own domain so this endpoint can't become
// an open URL-fetch proxy for arbitrary links.
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
}
