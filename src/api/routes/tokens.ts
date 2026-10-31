import { Router } from "express";
import { z } from "zod";

import { generateToken } from "../../auth/accessToken";
import { requireAuth } from "../../auth/middleware";
import { AccessTokenModel } from "../../db/models/accessToken";

export const tokensRouter = Router();
tokensRouter.use(requireAuth);

const createSchema = z.object({ label: z.string().optional() });

// Returns the raw token exactly once — only the hash is ever stored.
tokensRouter.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  const { raw, hash } = generateToken();
  await AccessTokenModel.create({
    userId: req.userId,
    tokenHash: hash,
    label: parsed.success ? parsed.data.label ?? "MCP connector" : "MCP connector",
  });
  res.status(201).json({ token: raw });
});

tokensRouter.get("/", async (req, res) => {
  const tokens = await AccessTokenModel.find({ userId: req.userId }).select("-tokenHash");
  res.json({ tokens });
});

tokensRouter.delete("/:id", async (req, res) => {
  await AccessTokenModel.deleteOne({ _id: req.params.id, userId: req.userId });
  res.status(204).send();
});
