export class UnsupportedPlatformError extends Error {
  constructor(url: string) {
    super(`unsupported or non-Twitter URL: ${url}`);
  }
}

export class ExtractionFailedError extends Error {
  constructor(reason: string) {
    super(`twitter extraction failed: ${reason}`);
  }
}
