import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Types } from "mongoose";
import { z } from "zod";

import { FolderModel } from "../db/models/folder";
import { ItemModel } from "../db/models/item";
import { processItem } from "../items/processItem";
import { detectPlatform, hashUrl, normalizeUrl } from "../items/normalizeUrl";
import { searchItems } from "../items/search";

// createMcpServer builds a fresh McpServer scoped to one user, one request —
// stateless, matching the transport mode used in src/mcp/router.ts.
export function createMcpServer(userId: Types.ObjectId): McpServer {
  const server = new McpServer({ name: "mybucket", version: "0.1.0" });

  server.registerTool(
    "search_saves",
    {
      description: "Search the user's saved Instagram reels and tweets by text match.",
      inputSchema: {
        query: z.string(),
        folder: z.string().optional(),
        platform: z.enum(["instagram", "twitter"]).optional(),
        limit: z.number().int().positive().max(50).optional(),
      },
    },
    async ({ query, folder, platform, limit }) => {
      const items = await searchItems(userId, query, { folderId: folder, platform, limit });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              items.map((i) => ({
                id: i._id,
                title: i.title,
                summary: i.summary,
                url: i.sourceUrl,
                folderIds: i.folderIds,
                savedAt: i.createdAt,
              })),
            ),
          },
        ],
      };
    },
  );

  server.registerTool(
    "get_save",
    {
      description: "Fetch the full saved item, including transcript and action items.",
      inputSchema: { id: z.string() },
    },
    async ({ id }) => {
      const item = await ItemModel.findOne({ _id: id, userId });
      if (!item) {
        return { content: [{ type: "text", text: "not found" }], isError: true };
      }
      return { content: [{ type: "text", text: JSON.stringify(item) }] };
    },
  );

  server.registerTool(
    "list_folders",
    { description: "List the user's folders with item counts." },
    async () => {
      const folders = await FolderModel.find({ userId });
      return { content: [{ type: "text", text: JSON.stringify(folders) }] };
    },
  );

  server.registerTool(
    "save_link",
    {
      description: "Save a new Instagram reel or tweet URL. Processing runs before returning.",
      inputSchema: { url: z.string().url() },
    },
    async ({ url }) => {
      const platform = detectPlatform(url);
      if (!platform) {
        return {
          content: [{ type: "text", text: "unsupported platform; only Instagram and Twitter/X are supported" }],
          isError: true,
        };
      }
      const normalized = normalizeUrl(url);
      const urlHash = hashUrl(normalized);

      const existing = await ItemModel.findOne({ userId, urlHash });
      if (existing) {
        return { content: [{ type: "text", text: JSON.stringify({ item: existing, alreadySaved: true }) }] };
      }

      const item = await ItemModel.create({ userId, platform, sourceUrl: normalized, urlHash, status: "processing" });
      await processItem(item._id, userId, platform, normalized);
      const finished = await ItemModel.findById(item._id);
      return { content: [{ type: "text", text: JSON.stringify({ item: finished, alreadySaved: false }) }] };
    },
  );

  server.registerTool(
    "complete_action",
    {
      description: "Mark one of a saved item's action items as done.",
      inputSchema: { id: z.string(), actionIndex: z.number().int().min(0) },
    },
    async ({ id, actionIndex }) => {
      const item = await ItemModel.findOne({ _id: id, userId });
      if (!item || !item.actionItems[actionIndex]) {
        return { content: [{ type: "text", text: "not found" }], isError: true };
      }
      item.actionItems[actionIndex].done = true;
      await item.save();
      return { content: [{ type: "text", text: JSON.stringify(item) }] };
    },
  );

  return server;
}
