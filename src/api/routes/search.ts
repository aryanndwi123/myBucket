import { Router } from "express";

import { requireAuth } from "../../auth/middleware";
import { searchItems } from "../../items/search";

export const searchRouter = Router();
searchRouter.use(requireAuth);

searchRouter.get("/", async (req, res) => {
  const query = typeof req.query.q === "string" ? req.query.q : "";
  const items = await searchItems(req.userId!, query, {
    folderId: typeof req.query.folder === "string" ? req.query.folder : undefined,
    platform: req.query.platform === "instagram" || req.query.platform === "twitter" ? req.query.platform : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
  });
  res.json({ items });
});
