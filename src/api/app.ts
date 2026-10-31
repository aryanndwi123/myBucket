import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { mcpRouter } from "../mcp/router";
import { authRouter } from "./routes/auth";
import { foldersRouter } from "./routes/folders";
import { itemsRouter } from "./routes/items";
import { searchRouter } from "./routes/search";
import { tokensRouter } from "./routes/tokens";

export function createApp() {
  const app = express();

  app.use(cors({ credentials: true, origin: true }));
  app.use(cookieParser());
  // MCP's Streamable HTTP transport parses its own request body; skip the
  // global JSON parser for that route.
  app.use((req, res, next) => {
    if (req.path === "/mcp") return next();
    express.json()(req, res, next);
  });

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRouter);
  app.use("/api/items", itemsRouter);
  app.use("/api/folders", foldersRouter);
  app.use("/api/search", searchRouter);
  app.use("/api/tokens", tokensRouter);
  app.use("/mcp", express.json(), mcpRouter);

  return app;
}
