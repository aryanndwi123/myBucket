import { UnsupportedPlatformError } from "./errors";

const ALLOWED_HOSTS = ["twitter.com", "www.twitter.com", "x.com", "www.x.com"];

export function validateTwitterUrl(rawUrl: string): void {
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
