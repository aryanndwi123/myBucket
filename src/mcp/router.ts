import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { Request, Response } from "express";
import { Router } from "express";
import { Types } from "mongoose";

import { resolveUserIdFromToken } from "../auth/accessToken";
import { createMcpServer } from "./server";

export const mcpRouter = Router();

async function handleMcp(req: Request, res: Response): Promise<void> {
  const authHeader = req.headers.authorization ?? "";
  const raw = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
  const userId = raw ? await resolveUserIdFromToken(raw) : null;

  if (!userId) {
    res.status(401).json({
      jsonrpc: "2.0",
      error: { code: -32001, message: "unauthorized: missing or invalid personal access token" },
      id: null,
    });
    return;
  }

  // Stateless mode: a fresh server + transport per request, no session to manage.
  const server = createMcpServer(new Types.ObjectId(userId));
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

  res.on("close", () => {
    transport.close();
    server.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
}

mcpRouter.post("/", handleMcp);
mcpRouter.get("/", handleMcp);
mcpRouter.delete("/", handleMcp);
