import { ExtractionFailedError } from "./errors";
import { validateTwitterUrl } from "./validate";

export interface TweetExtract {
  text: string;
  authorName: string;
  thumbnailUrl: string;
}

const PARAGRAPH_RE = /<p[^>]*>([\s\S]*?)<\/p>/;
const TAG_RE = /<[^>]+>/g;

// extractTweet tries the official oEmbed endpoint first (free, stable but
// truncates long tweets and strips thread text); FxTwitter is the fallback
// for full text/media when oEmbed comes back empty.
export async function extractTweet(tweetUrl: string): Promise<TweetExtract> {
  validateTwitterUrl(tweetUrl);

  const viaOembed = await tryOembed(tweetUrl);
  if (viaOembed && viaOembed.text) return viaOembed;

  const viaFx = await tryFxTwitter(tweetUrl);
  if (viaFx) return viaFx;

  if (viaOembed) return viaOembed;

  throw new ExtractionFailedError("both oEmbed and FxTwitter failed to return text");
}

async function tryOembed(tweetUrl: string): Promise<TweetExtract | null> {
  try {
    const endpoint = `https://publish.twitter.com/oembed?url=${encodeURIComponent(tweetUrl)}`;
    const res = await fetch(endpoint);
    if (!res.ok) return null;
    const data = (await res.json()) as { html?: string; author_name?: string };
    const text = extractText(data.html ?? "");
    return { text, authorName: data.author_name ?? "", thumbnailUrl: "" };
  } catch {
    return null;
  }
}

async function tryFxTwitter(tweetUrl: string): Promise<TweetExtract | null> {
  try {
    const path = new URL(tweetUrl).pathname; // /<user>/status/<id>
    const endpoint = `https://api.fxtwitter.com${path}`;
    const res = await fetch(endpoint, { headers: { "User-Agent": "myBucket/1.0" } });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      tweet?: { text?: string; author?: { name?: string }; media?: { photos?: { url: string }[] } };
    };
    const tweet = data.tweet;
    if (!tweet?.text) return null;
    return {
      text: tweet.text,
      authorName: tweet.author?.name ?? "",
      thumbnailUrl: tweet.media?.photos?.[0]?.url ?? "",
    };
  } catch {
    return null;
  }
}

function extractText(html: string): string {
  const match = PARAGRAPH_RE.exec(html);
  if (!match) return "";
  const inner = match[1].replace(TAG_RE, "");
  return decodeHtmlEntities(inner).trim();
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
