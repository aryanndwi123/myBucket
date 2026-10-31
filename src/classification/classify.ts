import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

import { env } from "../config/env";

const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const ClassificationSchema = z.object({
  title: z.string(),
  summary: z.string(),
  // Existing folder name(s) this item matches, or [] if none clear the threshold.
  matchedFolders: z.array(z.string()),
  // Proposed new folder if nothing matched and the user is under the cap; null otherwise.
  newFolder: z.object({ name: z.string(), description: z.string() }).nullable(),
  tags: z.array(z.string()),
  intent: z.enum(["learn", "try", "buy", "visit", "apply", "watch", "inspire"]),
  actionItems: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

export type Classification = z.infer<typeof ClassificationSchema>;

export interface ExistingFolder {
  name: string;
  description: string;
}

const SYSTEM_PROMPT = `You are the classifier for myBucket, an app that organizes saved \
social media posts (Instagram reels, tweets) into folders that emerge from the user's own \
content rather than a fixed taxonomy.

Given the extracted text of a saved post and the user's existing folders (name + \
description), decide:
- Which existing folder(s), if any, this post clearly belongs in. A post can match more \
  than one folder if it genuinely fits both. Only include a folder if the match is strong \
  and obvious, not a loose association.
- If no existing folder is a strong match, propose a new folder with a short name and a \
  one-sentence description that would make future similar posts match it. Only propose a \
  new folder if the user has fewer than the given folder cap.
- If no existing folder matches and the user is already at the folder cap, return an empty \
  matchedFolders array and null for newFolder — the caller will route this to a catch-all.

Also produce: a short descriptive title, a one-sentence summary, up to 5 tags, the single \
best-fit intent, any concrete action items implied by the content (e.g. "buy paneer"), and \
your confidence (0-1) in this classification overall.`;

export async function classifyItem(
  text: string,
  existingFolders: ExistingFolder[],
  folderCap: number,
): Promise<Classification> {
  const userPrompt = JSON.stringify({
    text,
    existingFolders,
    folderCap,
    currentFolderCount: existingFolders.length,
  });

  const completion = await client.beta.chat.completions.parse({
    model: env.OPENAI_CLASSIFY_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    response_format: zodResponseFormat(ClassificationSchema, "classification"),
  });

  const parsed = completion.choices[0]?.message?.parsed;
  if (!parsed) {
    throw new Error("classification: model returned no parsed output");
  }
  return parsed;
}
