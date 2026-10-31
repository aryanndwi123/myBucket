import type { Types } from "mongoose";

import { ItemModel } from "../db/models/item";

export interface SearchOptions {
  folderId?: string;
  platform?: "instagram" | "twitter";
  limit?: number;
}

// searchItems does a plain text-index match over title/caption/transcript/tags.
// No embeddings, no vector search — intentionally simple for now.
export async function searchItems(userId: Types.ObjectId, query: string, options: SearchOptions = {}) {
  const filter: Record<string, unknown> = { userId, status: "ready" };
  if (query.trim()) {
    filter.$text = { $search: query };
  }
  if (options.folderId) filter.folderIds = options.folderId;
  if (options.platform) filter.platform = options.platform;

  const cursor = ItemModel.find(filter);
  if (query.trim()) {
    cursor.sort({ score: { $meta: "textScore" } });
  } else {
    cursor.sort({ createdAt: -1 });
  }
  return cursor.limit(options.limit ?? 10).lean();
}
