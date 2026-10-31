import { Schema, model, type InferSchemaType } from "mongoose";

const accessTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    // sha256 of the actual token; the raw token is shown once at creation and never stored.
    tokenHash: { type: String, required: true, unique: true },
    label: { type: String, default: "MCP connector" },
    lastUsedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export type AccessToken = InferSchemaType<typeof accessTokenSchema> & {
  _id: Schema.Types.ObjectId;
};
export const AccessTokenModel = model("AccessToken", accessTokenSchema);
