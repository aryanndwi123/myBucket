# myBucket — Design Spec

Date: 2026-10-31

> **Superseded by `prd.md`.** The team's PRD (added 31 Oct 2026) is now the source of truth
> for stack, auth, and processing architecture (Google sign-in, async Agenda.js worker,
> React PWA). This doc's folder-cap logic and Prism-reuse notes were merged into `prd.md`'s
> addendum section. Kept here for historical context only.

## Idea

A unified bucket for saved social content (Instagram Reels, Twitter/X posts). Instead of
predefined categories, each saved item is run through an OpenAI "master prompt" that assigns
it to an existing category (folder) or creates a new one, based purely on the content the
user has actually saved. Categories emerge from usage, not from a fixed taxonomy.

## Stack

- Backend: Node.js + TypeScript (Express), modular monolith (mirrors Prism's module
  boundaries, without Prism's hexagonal layering — not needed at this scale)
- Database: MongoDB (Mongoose)
- Frontend: Next.js (separate app from the backend — same split as Prism's
  `prism-api` / `prism-web`)
- Auth: self-rolled username/password (bcrypt hash in MongoDB), JWT in an httpOnly cookie.
  No third-party auth providers.
- External services: OpenAI (categorization + Whisper transcription), yt-dlp binary
  (Instagram audio download), Twitter oEmbed (caption extraction)

## Reused logic from Prism (`prism-api`, module `modules/social`)

- **Caption extraction** (`application/service.go: ExtractPostText`) — oEmbed fetch per
  platform, strip HTML `<p>` body down to plain text. Ported pattern for Twitter captions.
- **yt-dlp download adapter** (`adapters/output/ytdlp/downloader.go`) — shells out to the
  `yt-dlp` binary, `-f ba/b` for audio-only, writes to a temp dir, globs the output file,
  caller gets path + cleanup func. `--max-filesize`, `--fixup never` (no ffmpeg dependency).
- **Whisper transcription adapter** (`adapters/output/whisper/transcriber.go`) — wraps an
  `/audio/transcriptions`-compatible endpoint. myBucket points this directly at OpenAI's own
  Whisper endpoint (Prism deliberately avoids OpenAI here for cost reasons; myBucket's
  categorization is already OpenAI-based, so no reason to add a second provider).
- **Host allow-listing** (`validateHost`/`allowedHosts`) — pins extraction to known platform
  domains so ingestion isn't an open URL-fetch proxy.

## Data model (MongoDB)

**User**
- `username: string` (unique)
- `passwordHash: string` (bcrypt)
- `createdAt: Date`

**Category**
- `userId: ObjectId`
- `name: string`
- `description: string` — the text the master prompt matches new items against
- `isMisc: boolean` — true for the catch-all 9th bucket
- `createdAt: Date`

A user has at most 8 non-misc categories, plus exactly one misc category created lazily the
first time it's needed.

**Item**
- `userId: ObjectId`
- `platform: "instagram" | "twitter"`
- `sourceUrl: string`
- `extractedText: string` — caption (Twitter) or transcript (Instagram)
- `categoryIds: ObjectId[]` — a single item can belong to more than one category
- `status: "processing" | "ready" | "failed"`
- `error?: string`
- `createdAt: Date`

## Ingestion & categorization flow

`POST /api/items` (authenticated):

1. Validate the submitted URL's host against the platform allow-list
   (`instagram.com` / `twitter.com`, `x.com`).
2. Create an `Item` with `status: "processing"`.
3. Extract content, synchronously, in the same request:
   - **Twitter**: oEmbed fetch → strip HTML → plain-text caption.
   - **Instagram**: yt-dlp downloads audio-only → OpenAI Whisper transcribes → temp file
     deleted.
4. Categorize: call the master prompt (see below) with the extracted text and the user's
   existing categories.
5. Resolve the prompt's result to concrete `Category` documents — create new ones if
   proposed (and under the cap), route to the misc bucket otherwise — then set
   `Item.categoryIds` and `status: "ready"`.
6. Respond with the full item.

If extraction, transcription, or categorization fails at any step, set
`status: "failed"` with an `error` message and still return 200 with the item (not a 500) —
the frontend shows a failed-to-process state rather than a generic error.

This is fully synchronous: the HTTP request for `POST /api/items` stays open until
processing finishes. Accepted trade-off for a personal/small-team tool; revisit with a job
queue (e.g. BullMQ) if usage or latency makes this impractical.

## Master categorization prompt

Single OpenAI call (JSON-mode / structured output) per item, given:
- The extracted text
- The user's existing categories as `[{name, description}]` (up to 8)

The prompt scores the item against each existing category and:
- Returns the name(s) of any category clearing a match threshold (supports an item landing
  in multiple categories)
- If none clear the threshold and the user has fewer than 8 categories, proposes a new
  category as `{name, description}`
- If none clear the threshold and the user is already at 8, returns `misc`

Exact threshold and prompt wording are tuned empirically during implementation against real
saved content, not fixed in this spec.

## API surface (Express/TS)

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`,
  `GET /api/auth/me`
- `POST /api/items` — ingest a URL (flow above)
- `GET /api/items` — list current user's items, filterable by category
- `DELETE /api/items/:id`
- `GET /api/categories` — list current user's categories with item counts

Auth: JWT in an httpOnly cookie, set on login/register, cleared on logout. No refresh-token
flow — a single reasonably long-lived token is enough for basic username/password auth.

## Frontend (Next.js)

- `/login`, `/register` — basic auth forms
- `/` (dashboard) — paste-a-link input, categories rendered as folders; selecting a category
  shows its items
- Session state checked against `GET /api/auth/me` on load; redirect to `/login` on 401

## Testing

- Unit tests: master-prompt categorization logic (OpenAI mocked), URL host validators
- Integration test: full `POST /api/items` flow with yt-dlp/Whisper/OpenAI mocked

## Out of scope for v1

- LinkedIn support (no public oEmbed/API path for arbitrary post scraping; would need manual
  text paste as a fallback — deferred)
- Automatic pulling from platform "saved/liked" lists (manual paste only for now)
- Async job queue / background workers
