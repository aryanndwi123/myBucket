"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useNow } from "@/hooks/useNow";
import { FOLDERS, FOLDER_SUBS, SUGGESTION_INDEX, USER } from "@/lib/data";
import { saveHref, subHref } from "@/lib/folders";
import type { TypeFilter, View } from "@/lib/types";
import { detectMode, matchesFilter, matchesQuery, newestFirst } from "@/lib/utils";
import { useSavesContext } from "@/components/app/SavesProvider";
import { CategoryTiles } from "@/components/folders/CategoryTiles";
import { Suggestions } from "@/components/folders/Suggestions";
import { SaveCard } from "@/components/saves/SaveCard";
import { TypeFilterBar } from "@/components/saves/TypeFilterBar";
import { ChipLink, Eyebrow } from "@/components/ui/primitives";
import { AskAnswer } from "./AskAnswer";
import { Omnibox } from "./Omnibox";
import { TodayRow } from "./TodayRow";

function greeting(now: Date | null) {
  if (!now) return "Hello";
  const h = now.getHours();
  return h < 12 ? "Morning" : h < 17 ? "Afternoon" : "Evening";
}

function dateLine(now: Date | null) {
  if (!now) return " ";
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
  const month = now.toLocaleDateString("en-US", { month: "short" });
  return `${weekday} · ${now.getDate()} ${month}`;
}

const VIEW_COPY: Record<Exclude<View, "today">, { title: string; blurb: string }> = {
  all: { title: "All saves", blurb: "Everything you’ve saved, newest first." },
  inbox: { title: "Inbox", blurb: "Saves Stashd wasn’t sure about. Open one and pick where it belongs." },
};

/** The list pages: Today (home), All saves and Inbox. Category, subcategory and save pages live under /folders and /saves. */
export function Dashboard({ view }: { view: View }) {
  const { items, ask, saveLink, markDone, snooze, askQuestion, clearAsk } = useSavesContext();
  const router = useRouter();
  const now = useNow();

  const [filter, setFilter] = useState<TypeFilter>("All types");
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const mode = detectMode(query);
  const q = query.trim();
  const searching = mode === "search";

  // ---- derived data -------------------------------------------------------------------
  const live = items.filter((x) => !x.archived);
  const folderCounts = Object.fromEntries(FOLDERS.map((f) => [f, live.filter((x) => x.folder === f).length]));

  const scoped = live.filter((x) => (view === "inbox" ? x.folder === "Inbox" : true));
  const visible = scoped
    .filter((x) => matchesFilter(x, filter))
    .filter((x) => !searching || matchesQuery(x, q))
    .sort(newestFirst);
  const todayItems = live.filter((x) => x.due && !x.finished && matchesFilter(x, filter)).slice(0, 3);

  const showToday = view === "today" && !q;

  const needle = q.toLowerCase();
  const subMatches = searching
    ? FOLDERS.flatMap((f) => FOLDER_SUBS[f].filter((s) => s.toLowerCase().includes(needle)).map((s) => ({ folder: f, sub: s }))).slice(0, 6)
    : [];
  const ideaMatches = searching
    ? SUGGESTION_INDEX.filter((s) => `${s.title} ${s.why} ${s.sub}`.toLowerCase().includes(needle))
        .slice(0, 3)
        .map((s) => ({ ...s, label: `${s.folder} · ${s.sub}` }))
    : [];

  const gridTitle = searching
    ? `${visible.length} ${visible.length === 1 ? "result" : "results"} for “${q}”`
    : view === "today"
      ? "Recently saved"
      : VIEW_COPY[view].title;

  // ---- actions ------------------------------------------------------------------------
  const handleSave = (text: string) => {
    const { duplicateOf } = saveLink(text);
    setQuery("");
    setFilter("All types");
    if (duplicateOf) router.push(saveHref(duplicateOf));
  };

  const handleSubmit = () => {
    if (!q) return inputRef.current?.focus();
    if (mode === "save") handleSave(q);
    else if (mode === "ask") askQuestion(q);
    // "search" filters live as you type, so there is nothing to submit.
  };

  // Drop a stale answer as soon as the box is no longer a question.
  useEffect(() => {
    if (mode !== "ask" && ask.mode !== "idle") clearAsk();
  }, [mode, ask.mode, clearAsk]);

  // ---- render -------------------------------------------------------------------------
  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <Eyebrow className="text-xs tracking-[0.12em]">{view === "today" ? dateLine(now) : "Library"}</Eyebrow>
          <h1 className="mt-2 font-serif text-5xl leading-[1.02] sm:text-[56px]">
            {view === "today" ? `${greeting(now)}, ${USER.name}.` : VIEW_COPY[view].title}
          </h1>
          {view !== "today" && <p className="mt-2 text-ink-3">{VIEW_COPY[view].blurb}</p>}
        </div>
        <p className="hidden text-sm text-ink-4 md:block">
          Tip: press <kbd className="mx-0.5 rounded-md border border-line-strong bg-card px-1.5 py-0.5 font-mono text-xs">/</kbd> to search · paste anywhere
          to save
        </p>
      </header>

      <Omnibox value={query} mode={mode} inputRef={inputRef} onChange={setQuery} onSubmit={handleSubmit} />

      <div className="mt-4">
        <TypeFilterBar value={filter} onChange={setFilter} />
      </div>

      {mode === "ask" && <AskAnswer state={ask} items={items} />}

      {showToday && <TodayRow items={todayItems} showEmpty={filter === "All types"} onDone={markDone} onSnooze={snooze} />}
      {showToday && <CategoryTiles counts={folderCounts} />}

      <section aria-labelledby="grid-heading" className="mt-10">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="grid-heading" className="font-serif text-4xl leading-none">
            {gridTitle}
          </h2>
          <Eyebrow className="shrink-0 text-xs tracking-[0.12em]">
            {visible.length} {visible.length === 1 ? "save" : "saves"}
          </Eyebrow>
        </div>

        {subMatches.length > 0 && (
          <div role="group" aria-label="Matching categories" className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-ink-3">Browse</span>
            {subMatches.map((m) => (
              <ChipLink key={`${m.folder}-${m.sub}`} href={subHref(m.folder, m.sub)}>
                {m.folder} › {m.sub}
              </ChipLink>
            ))}
          </div>
        )}

        {visible.length === 0 ? (
          <p className="mt-5 rounded-3xl border border-dashed border-line-strong px-6 py-10 text-ink-3">
            {searching
              ? `No saves match “${q}”. Try a shorter word, or end with ? to ask.`
              : filter !== "All types"
                ? `No ${filter} saves here yet.`
                : view === "inbox"
                  ? "Nothing to review. Everything has a home."
                  : "Nothing here yet. Paste a link above to add one."}
          </p>
        ) : (
          <ul className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
            {visible.map((item) => (
              <li key={item.id}>
                <SaveCard item={item} />
              </li>
            ))}
          </ul>
        )}

        {ideaMatches.length > 0 && (
          <Suggestions title={`Ideas matching “${q}”`} basis="Related content the AI suggests for your subcategories." items={ideaMatches} />
        )}
      </section>
    </>
  );
}
