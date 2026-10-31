import { createReadStream } from "node:fs";

import OpenAI from "openai";

import { env } from "../../config/env";
import { TranscriptionFailedError } from "./errors";

// Transcription runs on Groq's OpenAI-compatible API, not OpenAI directly.
const client = new OpenAI({ apiKey: env.TRANSCRIBE_API_KEY, baseURL: env.TRANSCRIBE_BASE_URL });

// transcribeAudio sends the downloaded audio file to the transcription
// endpoint (Groq) and returns the spoken text.
export async function transcribeAudio(audioPath: string): Promise<string> {
  try {
    const response = await client.audio.transcriptions.create({
      file: createReadStream(audioPath),
      model: env.TRANSCRIBE_MODEL,
      response_format: "text",
    });
    const text = typeof response === "string" ? response : (response as { text: string }).text;
    return text.trim();
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new TranscriptionFailedError(reason);
  }
}
