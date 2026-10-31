import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import { env } from "../../config/env";
import { ExtractionFailedError } from "./errors";

const execFileAsync = promisify(execFile);

// Normal reels' audio tracks land well under this; caps runaway downloads.
const MAX_AUDIO_FILE_SIZE = "40M";

export interface ReelMetadata {
  caption: string;
  authorUsername: string;
  durationSeconds: number;
  thumbnailUrl: string;
}

interface YtDlpInfo {
  description?: string;
  uploader_id?: string;
  uploader?: string;
  duration?: number;
  thumbnail?: string;
}

// fetchMetadata resolves a reel's caption and basic metadata via
// `--skip-download --dump-json` — no media bytes move for this call.
export async function fetchMetadata(reelUrl: string): Promise<ReelMetadata> {
  let stdout: string;
  try {
    const result = await execFileAsync(
      env.YTDLP_PATH,
      [
        "--no-playlist",
        "--no-warnings",
        "--skip-download",
        "--dump-json",
        "--socket-timeout",
        "20",
        "--",
        reelUrl,
      ],
      { timeout: env.REEL_PROCESSING_TIMEOUT_MS },
    );
    stdout = result.stdout;
  } catch (err) {
    throw new ExtractionFailedError(classifyYtDlpError(err));
  }

  let info: YtDlpInfo;
  try {
    info = JSON.parse(stdout);
  } catch {
    throw new ExtractionFailedError("unparseable yt-dlp metadata");
  }

  return {
    caption: info.description ?? "",
    authorUsername: info.uploader_id ?? info.uploader ?? "",
    durationSeconds: info.duration ?? 0,
    thumbnailUrl: info.thumbnail ?? "",
  };
}

// downloadAudio pulls the reel's best audio-only track to a temp file and
// returns its path plus a cleanup function the caller must run.
export async function downloadAudio(
  reelUrl: string,
): Promise<{ audioPath: string; cleanup: () => Promise<void> }> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "mybucket-reel-"));
  const cleanup = async () => {
    await fs.rm(dir, { recursive: true, force: true });
  };

  const outPattern = path.join(dir, "audio.%(ext)s");
  try {
    await execFileAsync(
      env.YTDLP_PATH,
      [
        "--no-playlist",
        "--no-warnings",
        "--no-progress",
        "--quiet",
        "--socket-timeout",
        "20",
        "--max-filesize",
        MAX_AUDIO_FILE_SIZE,
        "-f",
        "ba/b",
        // No mp3 remux here: ffmpeg compression (if needed) is a separate step.
        "--fixup",
        "never",
        "-o",
        outPattern,
        "--",
        reelUrl,
      ],
      { timeout: env.REEL_PROCESSING_TIMEOUT_MS },
    );
  } catch (err) {
    await cleanup();
    throw new ExtractionFailedError(classifyYtDlpError(err));
  }

  const files = await fs.readdir(dir);
  if (files.length === 0) {
    await cleanup();
    throw new ExtractionFailedError("yt-dlp produced no audio file");
  }
  const audioPath = path.join(dir, files[0]);
  const stat = await fs.stat(audioPath);
  if (stat.size === 0) {
    await cleanup();
    throw new ExtractionFailedError("yt-dlp produced an empty audio file");
  }

  return { audioPath, cleanup };
}

// classifyYtDlpError names the common failure modes so logs stay readable.
function classifyYtDlpError(err: unknown): string {
  if (err && typeof err === "object" && "code" in err && (err as { code?: unknown }).code === "ENOENT") {
    return `yt-dlp binary not found at YTDLP_PATH (${env.YTDLP_PATH})`;
  }
  const stderr =
    err && typeof err === "object" && "stderr" in err
      ? String((err as { stderr?: unknown }).stderr ?? "")
      : "";
  const s = stderr.toLowerCase();
  if (s.includes("rate-limit") || s.includes("429")) return "instagram rate-limited this host";
  if (s.includes("login required") || s.includes("cookies")) return "instagram demanded a login";
  if (s.includes("private") || s.includes("not available") || s.includes("n't available")) {
    return "reel is private, deleted, region-locked, or audience-restricted";
  }
  if (s.includes("unable to extract") || s.includes("unsupported url")) {
    return "extractor broke; yt-dlp likely needs a bump";
  }
  return s ? "unclassified yt-dlp failure" : "no stderr";
}
