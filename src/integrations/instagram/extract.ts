import { promises as fs } from "node:fs";

import { downloadAudio, fetchMetadata } from "./ytdlp";
import { transcribeAudio } from "./transcribe";
import { TranscriptionFailedError } from "./errors";
import { validateInstagramUrl } from "./validate";

export interface InstagramReelExtract {
  caption: string;
  transcript: string;
  authorUsername: string;
  durationSeconds: number;
  thumbnailUrl: string;
}

// extractInstagramReel resolves a public reel's caption and spoken-word
// transcript. Caption comes from yt-dlp metadata; transcript requires an
// audio download + OpenAI transcription call, with the temp file always
// cleaned up afterward.
export async function extractInstagramReel(reelUrl: string): Promise<InstagramReelExtract> {
  validateInstagramUrl(reelUrl);

  const metadata = await fetchMetadata(reelUrl);

  const { audioPath, cleanup } = await downloadAudio(reelUrl);
  let transcript: string;
  try {
    transcript = await transcribeAudio(audioPath);
  } catch (err) {
    // The downloaded file's size tells us whether yt-dlp actually got real
    // media (Instagram sometimes serves cloud-host IPs a degraded/blocked
    // response that still "succeeds" but contains no usable audio).
    const size = await fs.stat(audioPath).then((s) => s.size).catch(() => -1);
    const reason =
      err instanceof TranscriptionFailedError
        ? err.message.replace(/^transcription failed: /, "")
        : err instanceof Error
          ? err.message
          : String(err);
    throw new TranscriptionFailedError(`${reason} (downloaded file was ${size} bytes)`);
  } finally {
    await cleanup();
  }

  return {
    caption: metadata.caption,
    transcript,
    authorUsername: metadata.authorUsername,
    durationSeconds: metadata.durationSeconds,
    thumbnailUrl: metadata.thumbnailUrl,
  };
}
