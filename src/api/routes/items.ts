import { Router } from "express";
import { z } from "zod";

import { requireAuth } from "../../auth/middleware";
import { ItemModel } from "../../db/models/item";
import { processItem } from "../../items/processItem";
import { detectPlatform, hashUrl, normalizeUrl } from "../../items/normalizeUrl";

export const itemsRouter = Router();
itemsRouter.use(requireAuth);

const createSchema = z.object({ url: z.string().url() });

itemsRouter.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const platform = detectPlatform(parsed.data.url);
  if (!platform) {
    res.status(400).json({ error: "unsupported platform; only Instagram and Twitter/X URLs are supported" });
    return;
  }

  const normalized = normalizeUrl(parsed.data.url);
  const urlHash = hashUrl(normalized);

  const existing = await ItemModel.findOne({ userId: req.userId, urlHash });
  if (existing) {
    res.status(200).json({ item: existing, alreadySaved: true });
    return;
  }

  const item = await ItemModel.create({
    userId: req.userId,
    platform,
    sourceUrl: normalized,
    urlHash,
    status: "processing",
  });

  // Synchronous: the request stays open until extraction + classification finish.
  await processItem(item._id, req.userId!, platform, normalized);
  const finished = await ItemModel.findById(item._id);

  res.status(201).json({ item: finished, alreadySaved: false });
});

itemsRouter.get("/", async (req, res) => {
  const { folder, status } = req.query;
  const filter: Record<string, unknown> = { userId: req.userId };
  if (typeof folder === "string") filter.folderIds = folder;
  if (typeof status === "string") filter.status = status;

  const items = await ItemModel.find(filter).sort({ createdAt: -1 }).limit(100);
  res.json({ items });
});

itemsRouter.get("/:id", async (req, res) => {
  const item = await ItemModel.findOne({ _id: req.params.id, userId: req.userId });
  if (!item) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.json({ item });
});

const patchSchema = z.object({
  folderIds: z.array(z.string()).optional(),
  title: z.string().optional(),
  actionItems: z.array(z.object({ text: z.string(), done: z.boolean() })).optional(),
});

itemsRouter.patch("/:id", async (req, res) => {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const item = await ItemModel.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { $set: parsed.data },
    { new: true },
  );
  if (!item) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.json({ item });
});

itemsRouter.delete("/:id", async (req, res) => {
  await ItemModel.deleteOne({ _id: req.params.id, userId: req.userId });
  res.status(204).send();
});

itemsRouter.post("/:id/retry", async (req, res) => {
  const item = await ItemModel.findOne({ _id: req.params.id, userId: req.userId });
  if (!item) {
    res.status(404).json({ error: "not found" });
    return;
  }
  item.status = "processing";
  item.error = null;
  await item.save();
  await processItem(item._id, req.userId!, item.platform as "instagram" | "twitter", item.sourceUrl);
  const finished = await ItemModel.findById(item._id);
  res.json({ item: finished });
});
