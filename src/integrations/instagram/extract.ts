import { downloadAudio, fetchMetadata } from "./ytdlp";
import { transcribeAudio } from "./transcribe";
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
