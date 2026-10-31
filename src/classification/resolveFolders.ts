import type { Types } from "mongoose";

import { env } from "../config/env";
import { FolderModel } from "../db/models/folder";
import type { Classification } from "./classify";

// resolveFolders turns a classification result into concrete Folder _ids,
// creating a new folder if proposed and under the cap, or falling back to
// the lazily-created Inbox folder if nothing matched and the user is at cap.
export async function resolveFolders(
  userId: Types.ObjectId,
  classification: Classification,
): Promise<Types.ObjectId[]> {
  const allFolders = await FolderModel.find({ userId });
  const nonInboxCount = allFolders.filter((f) => !f.isInbox).length;

  const matched = allFolders.filter((f) =>
    classification.matchedFolders.some((name) => name.toLowerCase() === f.name.toLowerCase()),
  );
  if (matched.length > 0) {
    return matched.map((f) => f._id as Types.ObjectId);
  }

  if (classification.newFolder && nonInboxCount < env.FOLDER_CAP) {
    const created = await FolderModel.create({
      userId,
      name: classification.newFolder.name,
      description: classification.newFolder.description,
      isInbox: false,
    });
    return [created._id as Types.ObjectId];
  }

  const inbox = await getOrCreateInbox(userId);
  return [inbox._id as Types.ObjectId];
}

async function getOrCreateInbox(userId: Types.ObjectId) {
  const existing = await FolderModel.findOne({ userId, isInbox: true });
  if (existing) return existing;
  return FolderModel.create({
    userId,
    name: "Inbox",
    description: "Catch-all for items that didn't clearly match any folder.",
    isInbox: true,
  });
}
