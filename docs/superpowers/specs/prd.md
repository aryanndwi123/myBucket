Stashd — PRD
31 Oct 2026 · @danish
Overview
Stashd (working name) turns links people save from Instagram, X/Twitter, LinkedIn and YouTube into organised, searchable, actionable items, and reminds them at the right time to use them.
Problem. People save reels, tweets and posts in WhatsApp self-chats, Instagram Saved and LinkedIn bookmarks, then never open them again. Saved content has no title, no search, no folders and no nudge.
Solution. Share or paste a link once. In the background Stashd extracts the caption and transcript, uses OpenAI to title, tag and categorise it, and turns it into a to-do with a smart reminder.
Pitch: "We don't save links. We make sure you use them."
Goals, non-goals and success metrics
Goals
1. Saving takes one action (share or paste). The user never waits for AI.
2. Every saved link becomes readable: a title, a summary, a category and tags.
3. Saved items come back as reminders and to-dos at a sensible time.
4. Users can find any save by asking in plain language.
Non-goals (hackathon scope)
• Native iOS/Android apps. We ship a React PWA.
• Downloading or re-hosting videos. We keep text and thumbnails only.
• Scraping private accounts or anything behind a login.
• Training our own model. We use the OpenAI API.
Success metrics
Metric
Target
Time from share to "Saved" confirmation
< 1 s
Time to categorised item (reel under 90 s)
< 20 s
Category accepted without correction
≥ 80%
Saves revisited or marked done within 7 days
≥ 30%
OpenAI cost per saved reel
< $0.01 (estimate, to verify)
Target users
Persona
Saves
What they need
Student / learner
Coding tips, study hacks, career reels
Spaced revision, "Ask my saves" search
Working professional
LinkedIn posts, job openings, tool threads on X
Deadline reminders for jobs, to-dos from posts
Lifestyle saver
Recipes, workouts, travel spots, products
Weekend and routine reminders, folders per trip or goal
Creator
Trend reels, audio ideas, hooks
Tag by format and topic, swipe file
How people use it
Saving is fire-and-forget: the link is stored instantly and all AI work happens after the user has moved on.
Flow A: save (one action)
1. The user saves the link in one of three ways:
    ◦ Share sheet (Android): Share → Stashd. The PWA is registered as a share target.
    ◦ Paste: open the app and the clipboard link is offered as "Save this link?" in one tap.
    ◦ Bot (stretch): forward the link to the Stashd Telegram bot. This also covers iOS.
2. The app shows "Saved ✓, categorising…" in under 1 second and the user can leave.
3. A few seconds later the card updates with a thumbnail, title, category and tags. Change folder is one tap.
Flow B: browse and find
1. Home shows Today's picks (due reminders), then folders with thumbnails.
2. Search runs over titles, captions and transcripts.
3. "Ask my saves" (stretch) answers questions like "that reel about the Notion budget template".
Flow C: reminders and to-dos
1. Each save gets an intent (learn, try, buy, visit, apply, watch) and a suggested reminder time.
2. Action items become checkboxes on the card.
3. At reminder time the user gets a push or digest with Done, Snooze or Archive.
4. If a reminder is ignored 3 times, the item is archived automatically.
Feature requirements
P0 is the demo-able core, P1 is what wins, P2 is polish if time allows.
Priority
Feature
Requirement
P0
Link capture
Paste box, clipboard prompt and PWA share target. Saved in < 1 s with status processing
P0
Instagram reel processing
Caption, thumbnail and audio transcript (OpenAI transcription)
P0
X/Twitter processing
Tweet text, author, media thumbnail; thread text where available
P0
AI categorisation
OpenAI JSON output: title, summary, category, tags, intent, action items, reminder suggestion
P0
Folders view
Cards with thumbnail or embed, title and tags. One-tap move to another folder
P0
Dedupe
Normalised URL; "Already saved on 12 Oct" instead of a duplicate
P1
Smart reminders
Intent-based timing (recipes at the weekend, jobs within 48 h, learning on 1/7/30-day revision)
P1
Saves to to-dos
Action items as checkboxes; progress per folder
P1
Search and "Ask my saves"
Text search, then semantic search over transcripts with embeddings
P1
Learns from corrections
Last 5 user corrections are sent as examples in the classification prompt
P2
Telegram bot
Forward a link and get the category back with buttons
P2
LinkedIn and YouTube
Open Graph metadata; YouTube captions where available
P2
Monthly recap
"62 saved, 9 finished, mostly fitness" shareable card
P2
Shared collections
Public read-only link to a folder
Deep-dive choice
Proposal: go deep on search + MCP (most impressive for the effort), and ship a light version of the smart folder view alongside it.
Option
Demo impact
Extra effort on top of P0
Ship
Search + MCP server
High: "ask Claude to find my reel" works live
~3–4 h (MCP is a thin layer over the search API)
Full
Smart folder view
High: visible in the UI from the first screen
Light version ~2–3 h; location and preferences add ~3 h
Light: summary, subcategories, day-of-week and popularity picks. Location and preferences are stretch
Smart folder view
Opening a folder shows a summary and the 3–4 items worth acting on right now, so the user never scrolls through 50 reels.
Folder page, top to bottom
1. Summary header: "Recipes · 42 saves · 12 tried" plus a one-line AI summary ("Mostly high-protein veg breakfasts and quick dinners").
2. Do this now: 3–4 picks chosen by the context rules below, each with a one-line reason ("It's Sunday, let's cook this").
3. Subcategory chips: for example Breakfast · Desserts · High-protein · Street food.
4. Rolled-up to-dos: action items from every item in the folder ("Buy paneer, oats, peanut butter").
5. Full list, sorted by pick score.
Subcategories. The classifier returns a subcategory per item. Once a folder has 8+ items, a background job sends all titles to OpenAI, gets back at most 6 subcategory names and reassigns items. The folder summary is cached on the folder document and regenerated after every 5 new saves.
Context rules
Signal
Where it comes from
Example
Day and time
Server clock in the user's timezone
Sunday morning: "Let's cook this today" at the top of Recipes
Popularity
View, like and comment counts captured at save time (yt-dlp metadata, tweet stats)
"2.1M views" badge; popular saves rank higher in their folder
Location
Browser geolocation (with permission) + places the AI extracts from saves, geocoded
In Manali: "3 saved places near you" from Travel and Food. In Delhi: saved cafés nearby
Preferences
Profile set at onboarding (diet, fitness goal, home city), refined from saves
Veg + muscle gain: high-protein veg recipes first in Fitness and Recipes, with "fits your protein goal"
Neglect
Save date, times opened, reminders ignored
An unopened save from 2 months ago resurfaces once
Pick score = context match + popularity (log of views, normalised per folder) + not yet done − times ignored. It's rule-based, so no extra AI call. A single small OpenAI call writes the "why now" line for the top picks only.
Location details. For visit items the AI extracts place name and city. We geocode them with OpenStreetMap Nominatim (free, 1 request per second) or Google Geocoding and store a GeoJSON point with a 2dsphere index. A MongoDB $near query finds saves within 25 km. Without location permission we fall back to the home city.
Honest limits. Counts are a snapshot at save time, so the badge says "popular", not "trending now". Instagram often hides likes, so every stat is optional. Preferences only re-rank the user's own saves; they don't invent new content.
Search and MCP server
Users can find any of 500+ saves in two places: the in-app search box, and any AI assistant (Claude Desktop, ChatGPT, Cursor) through a Stashd MCP server.
Search engine (shared by both)
1. A small OpenAI call turns the question into filters + a clean query: "cooking reel I shared last month" → { folder: "Recipes", platform: "instagram", from: "2026-09-30", query: "cooking" }.
2. Two searches run in parallel on MongoDB Atlas: Atlas Search (full text over title, caption, transcript, tags) and Atlas Vector Search (query embedding vs item embeddings).
3. Results are merged with reciprocal rank fusion and the top 10 returned with title, summary, URL, folder and save date.
MCP server
Built in TypeScript with the official @modelcontextprotocol/sdk, served by the same API at /mcp over Streamable HTTP. Each user generates a personal access token in Settings and pastes it into their assistant's connector config.
Tool
Input
Returns
search_saves
query, folder?, platform?, limit?
Matching items: title, summary, URL, folder, saved date
get_save
id
Full item with transcript and action items
list_folders
none
Folders with counts and AI summaries
save_link
url
New item (processing starts)
set_reminder
id, when
Confirmation with the reminder time
complete_action
id, actionIndex
Updated item
Demo line: in Claude Desktop, "I saved a paneer reel last month, find it and add the ingredients to my to-dos" → Claude calls search_saves, then get_save, then complete_action/to-do updates, and the change appears live in the web app.
Effort. About 1 hour for the MCP layer once /api/search exists, about 2–3 hours for hybrid search itself. The in-app "Ask my saves" chat reuses the same search function.
System architecture
Four parts we build (React PWA, TypeScript API, TypeScript worker, MongoDB Atlas) plus external services; OpenAI handles transcription, categorisation and embeddings.
The API only saves and queues, so the user sees "Saved" in under a second. The worker takes the job from MongoDB, calls the external services, writes the result back and tells the app over SSE.
Layer
Choice
Frontend
React + Vite + TypeScript, vite-plugin-pwa (manifest with share_target, service worker), TanStack Query, Tailwind
API
Node 20, Express, TypeScript, Zod, Mongoose
Worker
Same repo, separate process: Agenda.js, yt-dlp-exec, ffmpeg-static, openai SDK
Database
MongoDB Atlas with Atlas Vector Search
Storage
Cloudinary (or S3) for thumbnails
Notifications
web-push (VAPID) for PWA push; Telegram Bot API (P2)
Auth
Google sign-in (Firebase Auth or Clerk)
Hosting
Frontend on Vercel or Netlify; API + worker as a Docker container on Railway or Render (needs yt-dlp and ffmpeg)
Processing pipeline
Every link goes through the same 6 steps in a TypeScript worker. Only step 3 differs by platform.
1. Normalise: resolve short links, strip tracking params (igsh, utm_*, s, t), build a canonical URL and hash it for dedupe.
2. Detect platform from the hostname: instagram.com, x.com / twitter.com, linkedin.com, youtube.com / youtu.be, anything else.
3. Extract content (table below).
4. Store thumbnail in our own storage (Cloudinary or S3). Instagram CDN URLs are signed and expire.
5. Classify with OpenAI using the caption + transcript + the user's folder names + their last 5 corrections.
6. Embed title + summary + transcript (text-embedding-3-small) for semantic search. Set status ready.
Platform
How we extract (Node/TypeScript)
Text we classify
Instagram reel
yt-dlp binary via yt-dlp-exec: metadata JSON + audio-only download; ffmpeg-static to compress to mono MP3
Caption + transcript
Instagram post / carousel
yt-dlp metadata; images sent to an OpenAI vision model if there is no caption
Caption + image description
X / Twitter
Tweet ID from URL → publish.twitter.com/oembed (official, free) and the FxTwitter API for full text and media; video tweets go through yt-dlp like reels
Tweet text + transcript if video
LinkedIn (P2)
Open Graph tags (og:title, og:description, og:image)
OG text; ask the user to paste text if empty
YouTube (P2)
Captions first; audio transcription only if none
Title + description + captions
Any other URL
Open Graph tags + readable page text
Page text (first ~4,000 characters)
Transcription. OpenAI audio transcription (whisper-1 or the newer gpt-4o-mini-transcribe) through the official openai Node SDK. It handles Hindi and Hinglish; we store the original text and generate titles in English. Cap audio at 10 minutes for the hackathon.
Classification. One call to a small OpenAI model (for example gpt-4o-mini) with Structured Outputs (response_format: json_schema) so the response always parses. The prompt includes the user's existing folders; the model picks one or proposes a new one.
{
  "title": "5-minute high-protein paneer bhurji",
  "summary": "Quick veg breakfast with 30 g protein...",
  "category": "Recipes",
  "subcategory": "Breakfast",
  "isNewCategory": false,
  "tags": ["cooking", "high-protein", "veg"],
  "intent": "try",
  "actionItems": ["Buy paneer", "Cook this weekend"],
  "places": [],
  "remindAt": "next_weekend",
  "confidence": 0.86
}
intent is one of: learn, try, buy, visit, apply, watch, inspire. remindAt is a relative hint the server turns into a date in the user's timezone. If confidence < 0.6 the item lands in Inbox for the user to confirm.
Database: MongoDB (NoSQL)
Decision: use MongoDB Atlas. Our core record is a saved item whose shape changes by platform and by what the AI returns, and that fits a document database better than tables.
Factor
MongoDB
SQL (Postgres)
Platform-specific metadata (reel vs tweet vs LinkedIn)
Store as-is in one document
Many nullable columns or a JSONB column
AI output changes during the hackathon
No migrations
Migration per change
Vector search for "Ask my saves"
Atlas Vector Search in the same database
pgvector extension
Job queue and reminders
Agenda.js runs on MongoDB, no Redis needed
Needs a separate queue or pg-boss
Relations (user → folders → items)
Simple, handled with references
Native joins
TypeScript tooling
Mongoose with typed schemas
Prisma / Drizzle
SQL would also work: our relations are simple and Postgres with JSONB and pgvector covers everything. MongoDB wins here on speed of change and one fewer service (no Redis). The trade-off is that we must enforce constraints ourselves, for example a unique index on { userId, urlHash }.
Collections
Collection
Purpose
Key fields and indexes
users
Account and preferences
email, timezone, digestTime, telegramChatId
folders
User's categories
userId, name, emoji, isAuto; unique {userId, name}
items
One saved link
see example; unique {userId, urlHash}, index {userId, status, remindAt}, vector index on embedding
corrections
Category changes made by the user
userId, itemId, from, to, createdAt (feeds the prompt)
agendaJobs
Processing and reminder jobs
managed by Agenda.js
Example items document
{
  "_id": "6720...",
  "userId": "671f...",
  "url": "https://www.instagram.com/reel/C9xYz/",
  "urlHash": "sha1:ab12...",
  "platform": "instagram",
  "status": "ready",
  "source": {
    "author": "@chefabc", "caption": "...", "durationSec": 48,
    "thumbnailUrl": "https://res.cloudinary.com/...",
    "stats": { "views": 2100000, "likes": 84000, "comments": 1200, "capturedAt": "2026-10-31T10:12:00Z" }
  },
  "transcript": { "text": "...", "language": "hi" },
  "ai": { "title": "...", "summary": "...", "subcategory": "Breakfast", "tags": ["cooking"], "intent": "try", "confidence": 0.86 },
  "places": [{ "name": "Cafe 1947", "city": "Manali", "geo": { "type": "Point", "coordinates": [77.18, 32.24] } }],
  "folderId": "671f...",
  "actionItems": [{ "text": "Buy paneer", "done": false }],
  "reminder": { "remindAt": "2026-11-07T04:00:00Z", "snoozeCount": 0, "ignoredCount": 0 },
  "openedCount": 0,
  "embedding": [0.012, -0.08, "..."],
  "error": null,
  "createdAt": "2026-10-31T10:12:00Z"
}
New indexes for the smart folder view: 2dsphere on places.geo, and { folderId, ai.subcategory }. Users get a profile object (diet, fitnessGoal, homeCity) and folders get a cached summary. MongoDB's built-in geospatial queries are one more reason it fits this product.
We store text, metadata and our own thumbnail copy only, never the video file.
API design
REST over Express (or Fastify) in TypeScript, validated with Zod. All routes need auth except the share-target entry, which redirects to login when there is no session.
Method
Route
Does
POST
/api/items
Body { url }. Normalise, dedupe, insert with processing, queue job. Returns the item in < 1 s
GET
/share?url=&text=
PWA share-target landing. Extracts the URL from url or text, calls the save logic, shows the toast
GET
/api/items?folder=&status=&q=
List and text search
GET
/api/items/:id
Item detail (front end polls this, or listens on SSE, until ready)
PATCH
/api/items/:id
Move folder (logs a correction), tick action items, edit title
POST
/api/items/:id/reminder
Snooze, done or archive
POST
/api/items/:id/retry
Re-run a failed job
GET
/api/folders
Folders with counts and thumbnails
POST
/api/ask
Body { question }. Vector search top 5 items, then OpenAI answers citing them
GET
/api/today
Due reminders and today's picks
POST
/api/push/subscribe
Save Web Push subscription
POST
/api/telegram/webhook
(P2) Bot receives forwarded links
Live updates. The client opens one Server-Sent Events stream (/api/events) and the worker publishes item.updated when processing finishes, so the card fills in without a refresh. Polling every 2 s is the fallback.
Added for the deep dives: GET /api/search?q= (hybrid search, used by the app, Ask and MCP), GET /api/folders/:id/overview (summary, subcategories, Do-this-now picks; accepts lat/lng), GET /api/nearby?lat=&lng= (saved places within 25 km), PUT /api/me/profile (diet, fitness goal, home city), POST /api/tokens (personal access token for MCP) and POST /mcp (MCP endpoint).
Edge cases and failure handling
The rule: a saved link is never lost. Any failure leaves the URL saved with a clear status and a retry.
Case
Handling
Instagram blocks the server IP or rate-limits
Pass a cookies file to yt-dlp, retry with backoff (3 tries), fall back to oEmbed/caption only. Pre-process all demo links
Reel with music only, no speech
Empty or junk transcript → classify on caption + vision description of the thumbnail
No caption and no speech
Vision on thumbnail; low confidence → Inbox
Hindi / Hinglish / other languages
Transcribe in source language, AI output in English, keep original
Private, deleted or age-restricted post
Status unavailable; keep URL; user can add a note
Same link saved twice (different igsh or ?s= params)
Canonical URL hash → "Already saved on 12 Oct, remind again?"
Short links (t.co, bit.ly, lnkd.in)
Follow redirects before normalising
Thumbnail URL expires
Copy to our storage at processing time
Twitter: X API is paid
oEmbed + FxTwitter; if both fail, save the URL and ask the user to paste the text
Protected or deleted tweet
Status unavailable
LinkedIn login wall
OG tags only; prompt to paste text
Long video (> 10 min)
Use captions if any; otherwise first 10 min only
Share text contains more than the URL ("Check this out https://...")
Extract the first URL with a regex
Non-link text shared
Save as a note item, still classified
OpenAI timeout or invalid output
Structured Outputs + 2 retries; then category Inbox, status needs_review
Wrong category
One-tap move, logged in corrections, used as examples next time
Too many reminders
Max 3 a day, bundled into one digest; auto-archive after 3 ignores
Timezones
Store UTC, compute "weekend" and "morning" in the user's timezone
iOS has no PWA share target
Paste-with-clipboard prompt, Telegram bot, or an iOS Shortcut
Cost spikes
Per-user daily cap (e.g. 50 saves), audio compressed to mono MP3 before upload
Copyright
Store only text, metadata and a thumbnail; link out to the original
Hackathon plan, demo and risks
Build P0 end to end first, then add P1 features one at a time so there is always a working demo.
Build order
[ ] Repo setup: React (Vite) PWA + Express TS API + MongoDB Atlas + Agenda worker
[ ] POST /api/items with normalise, dedupe and instant save
[ ] Worker: Instagram reel → yt-dlp → transcription (reuse the existing reel downloader code)
[ ] Worker: X/Twitter via oEmbed + FxTwitter
[ ] OpenAI classification with Structured Outputs + folders
[ ] UI: paste box, toast, folder grid, item cards with live update (SSE)
[ ] PWA manifest with share_target; test on an Android phone
[ ] Smart reminders + Web Push + action-item checkboxes
[ ] Embeddings + "Ask my saves"
[ ] Stretch: Telegram bot, monthly recap
3-minute demo
1. Problem in one line: show a WhatsApp self-chat full of forgotten reels.
2. On a phone, share an Instagram reel to Stashd. "Saved" appears instantly.
3. Share a tweet. Both cards fill in live with title, folder and tags.
4. Open the recipe card: summary, transcript, to-do checkboxes, reminder set for Saturday.
5. Ask "what was that paneer recipe?" and get the card back.
6. Trigger a reminder push live. Close with the pitch line.
Risks
Risk
Mitigation
Instagram blocks scraping on demo day
Pre-process demo links; cached results; cookies file; caption-only fallback
Hosting can't run yt-dlp / ffmpeg
Deploy the worker as a Docker container (Railway or Render), not serverless
PWA share target needs HTTPS and an installed app
Install the PWA on the demo phone the day before
FxTwitter is unofficial and may change
oEmbed as backup; paste-text fallback
Running out of OpenAI credit
Small models, audio compression, daily cap
Open question: which hosting will the team use for the worker (Railway, Render or a VPS)?

Addendum — folder cap and Prism code reuse (from the superpowers design spec, 31 Oct 2026)

Folder cap. Each user gets at most 8 non-auto folders plus exactly one catch-all folder,
created lazily the first time it's needed (the low-confidence Inbox above can serve this
role rather than adding a second catch-all). The classification prompt sends the user's
existing folder names (and, per the PRD above, their last 5 corrections) and:
- returns the name of any folder that clears the match threshold — an item is allowed to
  match more than one folder, so `folderId` becomes `folderIds: ObjectId[]` on the items
  document rather than a single reference
- proposes a new folder (`isNewCategory: true` as already specified) only while the user is
  under the 8-folder cap
- once a user is at the cap and nothing clears the threshold, routes to Inbox instead of
  creating a 9th real folder

Prism code reuse. `prism-api`'s `modules/social` already implements working, battle-tested
versions of three pieces this PRD's processing pipeline needs — porting these from Go to the
TypeScript worker is faster than writing fresh:
- **Caption/oEmbed extraction** (`application/service.go: ExtractPostText`) — fetch oEmbed
  HTML per platform, strip the `<p>` body down to plain text. Matches the "Tweet text" /
  caption column in the extraction table above.
- **yt-dlp download adapter** (`adapters/output/ytdlp/downloader.go`) — shells out to the
  `yt-dlp` binary (`-f ba/b` for audio-only), writes to a temp dir, globs the produced file,
  returns a path + cleanup func; `--max-filesize` and `--fixup never` avoid needing ffmpeg
  for the download step itself (this PRD still wants `ffmpeg-static` for the mono-MP3
  compression step, which is a separate concern from the download).
- **Whisper transcription adapter** (`adapters/output/whisper/transcriber.go`) — wraps an
  `/audio/transcriptions`-compatible endpoint. Point this at OpenAI directly (`whisper-1` or
  `gpt-4o-mini-transcribe` per the PRD) rather than Prism's non-OpenAI-only provider
  constraint, since this project's classification step is already OpenAI-based.
  **Update 31 Oct 2026**: superseded by the Groq switch below — transcription now runs on
  Groq (`whisper-large-v3-turbo`) via the same OpenAI-compatible adapter pattern, matching
  `prism-api`'s actual production config (`TRANSCRIBE_API_KEY`/`TRANSCRIBE_BASE_URL` point at
  Groq there, not OpenAI) rather than OpenAI's own Whisper endpoint.
- **Host allow-listing** (`validateHost`/`allowedHosts`) — pins extraction to each
  platform's known domains, preventing the ingestion endpoint from becoming an open
  URL-fetch proxy for arbitrary links.

Addendum 2 — no separate background worker (31 Oct 2026)

The PRD's "API only saves and queues, Agenda.js worker processes it, SSE pushes updates"
design is dropped. There is no second deployable process. `POST /api/items` runs extraction
(yt-dlp/transcription or oEmbed) and OpenAI classification synchronously, in the same
request, the same way the Instagram extractor already built in `src/integrations/instagram`
works — the request simply stays open until processing finishes and returns the finished
item. Consequences:
- `agendaJobs` collection, Agenda.js, and `/api/events` (SSE) are all removed from scope.
- Only one Render service is needed (a single web service), not a web + background-worker
  pair.
- `status: "processing"` still exists for failure/retry bookkeeping, but in practice an item
  reaches `"ready"` or `"failed"` before the HTTP response is sent — the frontend doesn't
  need to poll or listen for a later update under normal operation.
- Accepted trade-off: a slow Instagram transcription keeps the request open for several
  seconds. Fine for this project's expected usage; revisit only if that becomes a real
  problem.

Addendum 3 — search stays simple, MCP server still built (31 Oct 2026)

Atlas Vector Search / embeddings and hybrid RRF search are dropped for now. Search is plain
word/substring matching over each item's title, caption, and transcript (e.g. a MongoDB text
index or a simple case-insensitive regex match) — "Ask my saves" and semantic search are
deferred. The MCP server is still in scope and still exposes `search_saves` per the table
above; it just calls the simple word-match search instead of hybrid vector search.
