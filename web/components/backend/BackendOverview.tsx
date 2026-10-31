import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Eyebrow } from "@/components/ui/primitives";

type Status = "built" | "ui" | "designed";

const STATUS: Record<Status, { label: string; className: string }> = {
  built: { label: "Built", className: "bg-ink text-on-ink" },
  ui: { label: "UI only", className: "bg-ember-tint text-ember-deep" },
  designed: { label: "Designed", className: "border border-line-strong bg-card text-ink-3" },
};

function StatusChip({ status }: { status: Status }) {
  return (
    <span className={cn("inline-block shrink-0 rounded-md px-2 py-1 font-mono text-[11px] leading-none", STATUS[status].className)}>
      {STATUS[status].label}
    </span>
  );
}

const sectionHeading = "font-serif text-4xl leading-none";

function Section({ id, title, intro, children }: { id: string; title: string; intro?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-16">
      <h2 id={id} className={sectionHeading}>
        {title}
      </h2>
      {intro && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-3">{intro}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

const Code = ({ children }: { children: string }) => (
  <pre className="overflow-x-auto rounded-3xl bg-ink p-5 font-mono text-[13px] leading-relaxed text-on-ink">
    <code>{children}</code>
  </pre>
);

const PIPELINE: { title: string; status: Status; body: string; where?: string }[] = [
  {
    title: "Normalise and dedupe",
    status: "ui",
    body: "Strip tracking params (igsh, utm_*, s, t) and compare a canonical key, so the same reel never saves twice. The app does this in the browser today. The server will hash the key and enforce a unique {userId, urlHash} index.",
    where: "web/lib/utils.ts",
  },
  {
    title: "Check the host",
    status: "built",
    body: "Only instagram.com over https is accepted, so the endpoint can't be used as an open URL-fetch proxy.",
    where: "src/integrations/instagram/validate.ts",
  },
  {
    title: "Extract caption and audio",
    status: "built",
    body: "yt-dlp reads the caption, author, duration and thumbnail, then pulls an audio-only track (40 MB cap, 30 s timeout). Works for Instagram reels. X, LinkedIn and YouTube are designed: oEmbed plus FxTwitter, Open Graph tags and captions.",
    where: "src/integrations/instagram/ytdlp.ts",
  },
  {
    title: "Transcribe the speech",
    status: "built",
    body: "The audio goes to Groq's whisper-large-v3-turbo through an OpenAI-compatible client, so Hindi and Hinglish work. The temp file is always deleted afterwards.",
    where: "src/integrations/instagram/transcribe.ts",
  },
  {
    title: "Categorise with an LLM",
    status: "ui",
    body: "The app files each save into a fixed category and subcategory and shows the card filling in. The result is a canned sample. The real step is one structured-output call, described below.",
    where: "web/lib/data.ts",
  },
  {
    title: "Save and index",
    status: "designed",
    body: "Write the item to MongoDB and make title, caption and transcript searchable with a text index. Search is plain word matching for now, run in the browser.",
  },
];

const ARCHITECTURE: { layer: string; boxes: { name: string; status: Status }[] }[] = [
  {
    layer: "App",
    boxes: [
      { name: "Dashboard, folders, search", status: "ui" },
      { name: "Recipes summary page", status: "ui" },
      { name: "Share-sheet target (PWA)", status: "designed" },
    ],
  },
  {
    layer: "API · one service",
    boxes: [
      { name: "POST /api/items runs the whole pipeline", status: "designed" },
      { name: "GET /api/items?q= word-match search", status: "designed" },
      { name: "POST /mcp for Claude and other assistants", status: "designed" },
    ],
  },
  {
    layer: "Services",
    boxes: [
      { name: "yt-dlp, caption and audio", status: "built" },
      { name: "Groq Whisper, transcript", status: "built" },
      { name: "OpenAI, categorise and suggest", status: "designed" },
      { name: "oEmbed and FxTwitter, X posts", status: "designed" },
    ],
  },
  {
    layer: "Data",
    boxes: [{ name: "MongoDB: users, folders, items, corrections", status: "designed" }],
  },
];

const FEATURES: { name: string; status: Status; note: string }[] = [
  { name: "Instagram reel extraction", status: "built", note: "Caption, author, duration, thumbnail and audio via yt-dlp." },
  { name: "Speech transcription", status: "built", note: "Groq whisper-large-v3-turbo, Hindi and Hinglish included." },
  { name: "Host allow-list", status: "built", note: "Instagram only, https only." },
  { name: "Dashboard, cards and detail panel", status: "ui", note: "Runs on sample data held in memory." },
  { name: "Fixed categories and subcategories", status: "ui", note: "Six categories plus Inbox, each with its own subcategories. Move a save in one tap." },
  { name: "Suggested content per subcategory", status: "ui", note: "Shown under each folder. The suggestions are hard-coded; the LLM call is designed." },
  { name: "Search", status: "ui", note: "Word match over title, summary, tags, subcategory and transcript, in the browser." },
  { name: "Reminders and to-dos", status: "ui", note: "Done, snooze and auto-archive work in the page. No push yet." },
  { name: "Duplicate detection", status: "ui", note: "Same link twice opens the existing save." },
  { name: "X, LinkedIn and YouTube extraction", status: "designed", note: "oEmbed and FxTwitter, Open Graph tags, YouTube captions." },
  { name: "LLM categorisation", status: "designed", note: "Structured Outputs with enums for category and subcategory." },
  { name: "REST API and MongoDB", status: "designed", note: "Express, Zod and Mongoose in one web service." },
  { name: "MCP server", status: "designed", note: "A thin layer over the search endpoint." },
  { name: "Web Push reminders", status: "designed", note: "Intent-based timing, three a day, bundled into a digest." },
  { name: "Ask my saves", status: "designed", note: "Deferred. Needs embeddings and vector search." },
];

const NEXT_STEPS = [
  ["Express API on MongoDB", "POST /api/items runs normalise, extract, transcribe, categorise and save in one request, then returns the finished item."],
  ["X and Twitter extractor", "oEmbed for the text, FxTwitter for media, yt-dlp for video tweets."],
  ["LLM classifier", "One structured-output call returns category, subcategory, tags, intent, to-dos and a reminder hint. Low confidence goes to Inbox."],
  ["Wire the app to the API", "Each function in useSaves already maps to one route, so this is swapping function bodies for fetch calls."],
  ["Search endpoint and MCP server", "search_saves calls the word-match search. The other MCP tools wrap the item routes."],
  ["Reminders and Web Push", "Timing from intent and the user's timezone, with Done, Snooze and Archive on the notification."],
  ["Installable PWA with a share target", "Share a reel straight from Instagram to Stashd on Android."],
];

const ROUTES: [string, string, string][] = [
  ["POST", "/api/items", "Save a link and return the finished item"],
  ["GET", "/api/items?folder=&q=", "List and word-match search"],
  ["GET", "/api/items/:id", "One item with transcript and to-dos"],
  ["PATCH", "/api/items/:id", "Move category, tick a to-do, edit the title"],
  ["POST", "/api/items/:id/reminder", "Snooze, done or archive"],
  ["GET", "/api/folders", "Categories with counts"],
  ["POST", "/mcp", "MCP endpoint over Streamable HTTP"],
];

const MCP_TOOLS = ["search_saves", "get_save", "list_folders", "save_link", "set_reminder", "complete_action"];

export function BackendOverview() {
  const counts = (Object.keys(STATUS) as Status[]).map((s) => ({ status: s, n: FEATURES.filter((f) => f.status === s).length }));

  return (
    <>
      <header className="max-w-3xl">
        <Eyebrow className="text-xs tracking-[0.12em]">Backend</Eyebrow>
        <h1 className="mt-2 font-serif text-5xl leading-[1.02] sm:text-[56px]">Everything behind the save button</h1>
        <p className="mt-4 text-lg leading-snug text-ink-2">
          We had very little time, so we built one piece of the backend end to end: pulling the caption and transcript out of an Instagram reel. The rest is
          designed and laid out below, in the order we would build it.
        </p>
        <ul className="mt-6 flex flex-wrap gap-3" aria-label="Feature status totals">
          {counts.map(({ status, n }) => (
            <li key={status} className="flex items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3">
              <span className="font-serif text-3xl leading-none tabular-nums">{n}</span>
              <StatusChip status={status} />
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-ink-3">
          <strong className="font-semibold text-ink">Built</strong> is code in the repo. <strong className="font-semibold text-ink">UI only</strong> works in the app
          on sample data. <strong className="font-semibold text-ink">Designed</strong> is specified but not written.
        </p>
      </header>

      <Section id="pipeline-heading" title="One link, six steps" intro="Every saved link goes through the same steps. Only the extraction step differs by platform.">
        <ol className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PIPELINE.map((step, i) => (
            <li key={step.title} className="flex flex-col rounded-[22px] border border-line bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-xs text-ink-4">STEP {i + 1}</span>
                <StatusChip status={step.status} />
              </div>
              <h3 className="mt-3 font-serif text-2xl leading-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-3">{step.body}</p>
              {step.where && <p className="mt-auto pt-4 font-mono text-xs break-all text-ink-4">{step.where}</p>}
            </li>
          ))}
        </ol>
      </Section>

      <Section
        id="arch-heading"
        title="How the pieces fit"
        intro="One web service and no background worker. The request stays open while extraction and categorisation run, then returns the finished item."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {ARCHITECTURE.map((col) => (
            <div key={col.layer} className="rounded-3xl bg-sunken p-4">
              <Eyebrow>{col.layer}</Eyebrow>
              <ul className="mt-3 flex flex-col gap-2">
                {col.boxes.map((b) => (
                  <li key={b.name} className="flex items-start justify-between gap-3 rounded-2xl border border-line bg-card p-3">
                    <span className="text-sm leading-snug">{b.name}</span>
                    <StatusChip status={b.status} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="llm-heading"
        title="Fixed categories, LLM-picked subcategories"
        intro="Categories are fixed for now, and so are the subcategories inside each one. The model can only choose from them, because they are enums in its JSON schema. A second small call suggests related content for a subcategory."
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="min-w-0">
            <h3 className="mb-3 font-serif text-2xl">1. Categorise the save</h3>
            <Code>{`{
  "title": "5-minute high-protein paneer bhurji",
  "category": "Recipes",       // one of 6 fixed
  "subcategory": "Breakfast",  // fixed per category
  "tags": ["high-protein", "veg"],
  "intent": "try",
  "actionItems": ["Buy paneer", "Cook this weekend"],
  "remindAt": "next_weekend",
  "confidence": 0.86           // under 0.6: Inbox
}`}</Code>
          </div>
          <div className="min-w-0">
            <h3 className="mb-3 font-serif text-2xl">2. Suggest related content</h3>
            <Code>{`// input
{
  "category": "Recipes",
  "subcategory": "Breakfast",
  "saved": ["5-minute high-protein paneer bhurji"]
}

// output, shown under the folder grid
[
  { "title": "...", "why": "...", "by": "...", "kind": "Reel" },
  { "title": "...", "why": "...", "by": "...", "kind": "Reel" },
  { "title": "...", "why": "...", "by": "...", "kind": "Post on X" }
]`}</Code>
            <p className="mt-3 text-sm text-ink-3">Cached per user and subcategory. In the app today these three come from a hard-coded list.</p>
          </div>
        </div>
      </Section>

      <Section id="status-heading" title="Feature by feature">
        <ul className="overflow-hidden rounded-3xl border border-line bg-card">
          {FEATURES.map((f) => (
            <li key={f.name} className="grid gap-x-6 gap-y-1 border-b border-line px-5 py-3.5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_92px_minmax(0,1.4fr)] sm:items-center">
              <span className="font-medium">{f.name}</span>
              <span>
                <StatusChip status={f.status} />
              </span>
              <span className="text-sm text-ink-3">{f.note}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="next-heading" title="What we would build next" intro="If we had more time, this is the order. Each step leaves a working demo.">
        <ol className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {NEXT_STEPS.map(([title, body], i) => (
            <li key={title} className="flex gap-4 rounded-[22px] border border-line bg-card p-5">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink font-mono text-xs text-on-ink">{i + 1}</span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-3">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="api-heading" title="API and MCP" intro="The MCP server is a thin layer over the same routes, so an assistant can find a reel you saved and tick off its to-dos.">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <ul className="overflow-hidden rounded-3xl border border-line bg-card">
            {ROUTES.map(([method, path, does]) => (
              <li key={path + method} className="grid gap-x-4 gap-y-0.5 border-b border-line px-5 py-3 last:border-b-0 sm:grid-cols-[64px_minmax(0,1fr)] ">
                <span className="font-mono text-xs text-ember-text">{method}</span>
                <span>
                  <span className="font-mono text-sm break-all">{path}</span>
                  <span className="block text-sm text-ink-3">{does}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="rounded-3xl bg-sunken p-5">
            <Eyebrow>MCP tools</Eyebrow>
            <ul className="mt-3 flex flex-wrap gap-2">
              {MCP_TOOLS.map((t) => (
                <li key={t} className="rounded-lg border border-line bg-card px-3 py-1.5 font-mono text-xs">
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-ink-3">Each user creates a personal access token in Settings and pastes it into the assistant&rsquo;s connector.</p>
          </div>
        </div>
      </Section>
    </>
  );
}
