# Stashd — web dashboard

The web app UI from the Stashd design canvas: sidebar with folders, one box to save / search / ask, a Today row, a grid of saves and a detail panel. It runs entirely on mock data, so the UI can be built and demoed before the API exists.

## Run it

```bash
cd web
npm install
npm run dev        # http://localhost:3000
npm run typecheck
```

Stack: Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · `next/font` (Instrument Serif, Geist, Geist Mono). No other dependencies.

## Try it

- Paste `https://www.instagram.com/reel/DA2kLm/` in the box and press Enter. It saves instantly, then the card goes "Fetching caption → Transcribing audio → Picking a folder" and fills in.
- Paste `https://www.instagram.com/reel/C9xYz/?igsh=abc`. It's a duplicate, so you get "Already saved on 29 Oct" and the existing save opens.
- Type `paneer` to search (live word match). Type `jobs I should apply to?` to ask (see note below).
- `/` focuses the box. `Esc` clears the box or closes the panel. Pasting a link anywhere outside an input saves it.
- Open a card: tick to-dos, Done / Snooze the reminder, move it to another folder. The 3rd snooze archives the save.
- Narrow the window: the sidebar becomes a drawer and the detail panel becomes a sheet.

## Structure

```
app/
  layout.tsx          fonts + metadata
  page.tsx            renders <Dashboard />
  globals.css         Tailwind v4 + design tokens (@theme) + motion
  icon.svg            favicon
components/
  dashboard/
    Dashboard.tsx     layout, view state (view, folder, filter, query, selection), keyboard + paste handlers
    Sidebar.tsx       views, folders with counts, monthly recap; mobile drawer
    Omnibox.tsx       one box: link → save, words → search, "?" → ask
    AskAnswer.tsx     answer card citing numbered saves
    TodayRow.tsx      due reminders (max 3) with Done / Tomorrow
    SaveCard.tsx      grid card: processing / ready / needs-review / done states
    DetailPanel.tsx   reminder, to-dos, folder correction, transcript; mobile sheet
    Toast.tsx         bottom toast (aria-live)
  ui/
    primitives.tsx    Button, Chip, Tag, Eyebrow, Checkbox, Spinner
    icons.tsx         inline stroke icons
hooks/
  useSaves.ts         all save state + mutations (mocked; one function per API call)
  useNow.ts           current date after mount (avoids SSR/timezone hydration mismatch)
lib/
  types.ts            SaveItem etc. (mirrors the PRD `items` document)
  data.ts             folders, colours, seed items, mock pipeline results
  utils.ts            URL extract/normalise/dedupe, platform + mode detection, search, mock ask
```

## Design tokens (`app/globals.css`)

| Token | Value | Use |
|---|---|---|
| `paper` | `#F6F1E8` | page background |
| `card` | `#FFFDF9` | cards, inputs |
| `sunken` | `#EEE6D8` | tags, hover, processing cover |
| `line` / `line-strong` | `#E3D8C6` / `#D6C8B2` | borders |
| `ink` | `#1F1A15` | text, dark buttons |
| `ink-3` / `ink-4` | `#574C42` / `#6E6359` | secondary / meta text |
| `ember` | `#C94F1C` | the primary action only (4.8:1 with white) |
| `ember-text` | `#A8421A` | orange text on paper |
| `ember-tint` | `#FBE2D0` | soft highlight, focus ring |

Folder tints (`lib/data.ts`) are content colours; buttons are always ink or ember. Type: Instrument Serif for headings (italic for the human beat), Geist for UI and body, Geist Mono for dates, counts and labels. Touch targets are 44 px on mobile.

## Wiring the real API

The backend lives in `../src` and has no HTTP layer yet. When it does, everything that talks to it is in `hooks/useSaves.ts`:

| Hook function | PRD route |
|---|---|
| `saveLink(text)` | `POST /api/items { url }` |
| `markDone` / `snooze` / `archive` | `POST /api/items/:id/reminder` |
| `moveTo(id, folder)` | `PATCH /api/items/:id` (also logs a correction) |
| `toggleAction(id, i)` | `PATCH /api/items/:id` |
| `askQuestion(q)` | `POST /api/ask` |
| initial `SEED_ITEMS` | `GET /api/items`, `GET /api/today`, `GET /api/folders` |

Notes for the swap:

- **No SSE.** PRD addendum 2 drops the worker: `POST /api/items` stays open until extraction and classification finish, then returns the finished item. The mock's "Fetching caption → Transcribing → Picking a folder" card is that in-flight request. Keep the card, but drive it from the pending request instead of `setTimeout`s.
- **Search is word match** (addendum 3). `matchesQuery` in `lib/utils.ts` is the client-side stand-in for `GET /api/items?q=`.
- **Ask is deferred** in the PRD, so `askQuestion` is a keyword stand-in and the answer card says so. Remove the "ask" branch of `detectMode` if you'd rather not ship it yet.
- A good next step is TanStack Query: replace `useState(SEED_ITEMS)` with `useQuery`, turn each mutation into `useMutation` with an optimistic update.
- Thumbnails: cards use the folder tint as the cover. When thumbnails are stored (Cloudinary/S3), render them with `next/image` inside the cover `<span>` in `SaveCard.tsx` and add the host to `images.remotePatterns` in `next.config.ts`.
- All creators, people and companies in the mock data are fictional.
