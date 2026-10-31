import { Router } from "express";

import { requireAuth } from "../../auth/middleware";
import { FolderModel } from "../../db/models/folder";
import { ItemModel } from "../../db/models/item";

export const foldersRouter = Router();
foldersRouter.use(requireAuth);

foldersRouter.get("/", async (req, res) => {
  const folders = await FolderModel.find({ userId: req.userId }).sort({ createdAt: 1 });
  const counts = await ItemModel.aggregate([
    { $match: { userId: req.userId, status: "ready" } },
    { $unwind: "$folderIds" },
    { $group: { _id: "$folderIds", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));

  res.json({
    folders: folders.map((f) => ({
      id: f._id,
      name: f.name,
      description: f.description,
      isInbox: f.isInbox,
      itemCount: countMap.get(f._id.toString()) ?? 0,
    })),
  });
});
