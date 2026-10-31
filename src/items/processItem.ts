import type { Types } from "mongoose";

import { classifyItem } from "../classification/classify";
import { resolveFolders } from "../classification/resolveFolders";
import { env } from "../config/env";
import { FolderModel } from "../db/models/folder";
import { ItemModel } from "../db/models/item";
import { extractInstagramReel } from "../integrations/instagram";
import { extractTweet } from "../integrations/twitter";
import type { Platform } from "./normalizeUrl";

// processItem runs extraction + classification synchronously and writes the
// result onto the given item document, in place. Caller already created the
// item with status "processing" before calling this.
export async function processItem(
  itemId: Types.ObjectId,
  userId: Types.ObjectId,
  platform: Platform,
  sourceUrl: string,
): Promise<void> {
  try {
    const extracted = await extractContent(platform, sourceUrl);

    const classification = await classifyItem(
      [extracted.caption, extracted.transcript].filter(Boolean).join("\n\n"),
      await existingFolders(userId),
      env.FOLDER_CAP,
    );

    const folderIds = await resolveFolders(userId, classification);

    await ItemModel.updateOne(
      { _id: itemId },
      {
        $set: {
          status: "ready",
          error: null,
          author: extracted.author,
          caption: extracted.caption,
          transcript: extracted.transcript,
          thumbnailUrl: extracted.thumbnailUrl,
          durationSeconds: extracted.durationSeconds,
          title: classification.title,
          summary: classification.summary,
          tags: classification.tags,
          intent: classification.intent,
          actionItems: classification.actionItems.map((text) => ({ text, done: false })),
          confidence: classification.confidence,
          folderIds,
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await ItemModel.updateOne({ _id: itemId }, { $set: { status: "failed", error: message } });
  }
}

interface ExtractedContent {
  caption: string;
  transcript: string;
  author: string;
  thumbnailUrl: string;
  durationSeconds: number;
}

async function extractContent(platform: Platform, url: string): Promise<ExtractedContent> {
  if (platform === "instagram") {
    const reel = await extractInstagramReel(url);
    return {
      caption: reel.caption,
      transcript: reel.transcript,
      author: reel.authorUsername,
      thumbnailUrl: reel.thumbnailUrl,
      durationSeconds: reel.durationSeconds,
    };
  }
  const tweet = await extractTweet(url);
  return {
    caption: tweet.text,
    transcript: "",
    author: tweet.authorName,
    thumbnailUrl: tweet.thumbnailUrl,
    durationSeconds: 0,
  };
}

async function existingFolders(userId: Types.ObjectId) {
  const folders = await FolderModel.find({ userId, isInbox: false });
  return folders.map((f) => ({ name: f.name, description: f.description }));
}
