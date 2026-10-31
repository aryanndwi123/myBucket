export class UnsupportedPlatformError extends Error {
  constructor(url: string) {
    super(`unsupported or non-Instagram URL: ${url}`);
  }
}

export class ExtractionFailedError extends Error {
  constructor(reason: string) {
    super(`instagram extraction failed: ${reason}`);
  }
}

export class TranscriptionFailedError extends Error {
  constructor(reason: string) {
    super(`transcription failed: ${reason}`);
  }
}
