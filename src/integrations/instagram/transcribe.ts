import { createReadStream } from "node:fs";

import OpenAI from "openai";

import { env } from "../../config/env";
import { TranscriptionFailedError } from "./errors";

const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

// transcribeAudio sends the downloaded audio file straight to OpenAI's
// transcription endpoint and returns the spoken text.
export async function transcribeAudio(audioPath: string): Promise<string> {
  try {
    const response = await client.audio.transcriptions.create({
      file: createReadStream(audioPath),
      model: env.OPENAI_TRANSCRIBE_MODEL,
      response_format: "text",
    });
    const text = typeof response === "string" ? response : (response as { text: string }).text;
    return text.trim();
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new TranscriptionFailedError(reason);
  }
}
