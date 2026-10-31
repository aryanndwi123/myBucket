import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  OPENAI_TRANSCRIBE_MODEL: z.string().default("whisper-1"),
  OPENAI_CLASSIFY_MODEL: z.string().default("gpt-4o-mini"),
  YTDLP_PATH: z.string().default("yt-dlp"),
  // yt-dlp/transcription can hang on a bad reel; this caps how long we wait.
  REEL_PROCESSING_TIMEOUT_MS: z.coerce.number().default(30_000),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
