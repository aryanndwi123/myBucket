import { Schema, model, type InferSchemaType } from "mongoose";

const folderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    name: { type: String, required: true },
    description: { type: String, required: true, default: "" },
    // The lazily-created catch-all bucket; doesn't count toward FOLDER_CAP.
    isInbox: { type: Boolean, required: true, default: false },
  },
  { timestamps: true },
);

folderSchema.index({ userId: 1, name: 1 }, { unique: true });

export type Folder = InferSchemaType<typeof folderSchema> & { _id: Schema.Types.ObjectId };
export const FolderModel = model("Folder", folderSchema);
