import { Schema, model, type InferSchemaType } from "mongoose";

const actionItemSchema = new Schema(
  {
    text: { type: String, required: true },
    done: { type: Boolean, required: true, default: false },
  },
  { _id: false },
);

const itemSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    platform: { type: String, required: true, enum: ["instagram", "twitter"] },
    sourceUrl: { type: String, required: true },
    // sha1 of the normalised URL; dedupe key per user.
    urlHash: { type: String, required: true },

    status: {
      type: String,
      required: true,
      enum: ["processing", "ready", "failed"],
      default: "processing",
    },
    error: { type: String, default: null },

    author: { type: String, default: "" },
    caption: { type: String, default: "" },
    transcript: { type: String, default: "" },
    thumbnailUrl: { type: String, default: "" },
    durationSeconds: { type: Number, default: 0 },

    title: { type: String, default: "" },
    summary: { type: String, default: "" },
    tags: { type: [String], default: [] },
    intent: {
      type: String,
      enum: ["learn", "try", "buy", "visit", "apply", "watch", "inspire", null],
      default: null,
    },
    actionItems: { type: [actionItemSchema], default: [] },
    confidence: { type: Number, default: null },

    // An item may land in more than one folder.
    folderIds: { type: [Schema.Types.ObjectId], ref: "Folder", default: [] },
  },
  { timestamps: true },
);

itemSchema.index({ userId: 1, urlHash: 1 }, { unique: true });
itemSchema.index({ userId: 1, title: "text", caption: "text", transcript: "text", tags: "text" });

export type Item = InferSchemaType<typeof itemSchema> & { _id: Schema.Types.ObjectId };
export const ItemModel = model("Item", itemSchema);
