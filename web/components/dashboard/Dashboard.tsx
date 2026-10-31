"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useNow } from "@/hooks/useNow";
import { saveHref } from "@/lib/folders";
import type { SaveItem, TypeFilter, View } from "@/lib/types";
import { detectMode, matchesFilter, matchesQuery, newestFirst } from "@/lib/utils";
import { useSavesContext } from "@/components/app/SavesProvider";
import { useAuth } from "@/components/auth/AuthGate";
import { CategoryTiles } from "@/components/folders/CategoryTiles";
import { SaveCard } from "@/components/saves/SaveCard";
import { TypeFilterBar } from "@/components/saves/TypeFilterBar";
import { CardSkeletons, LoadError } from "@/components/ui/States";
import { Eyebrow } from "@/components/ui/primitives";
import { AskAnswer } from "./AskAnswer";
import { Omnibox } from "./Omnibox";

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

const VIEW_COPY: Record<Exclude<View, "home">, { title: string; blurb: string }> = {
  all: { title: "All saves", blurb: "Everything you’ve saved, newest first." },
  inbox: { title: "Inbox", blurb: "Saves Stashd wasn’t sure about. Open one and pick a folder for it." },
};

/** Debounce before asking the server, so typing doesn't send a request per keystroke. */
const SEARCH_DELAY_MS = 250;

/** The list pages: Home, All saves and Inbox. Folder, topic and save pages live under /folders and /saves. */
export function Dashboard({ view }: { view: View }) {
  const { items, folders, state, loadError, reload, ask, saveLink, search, askQuestion, clearAsk } = useSavesContext();
  const { user } = useAuth();
  const router = useRouter();
  const now = useNow();

  const [filter, setFilter] = useState<TypeFilter>("All types");
  const [query, setQuery] = useState("");
  const [remote, setRemote] = useState<{ q: string; items: SaveItem[] }>({ q: "", items: [] });
  const inputRef = useRef<HTMLInputElement>(null);

  const mode = detectMode(query);
  const q = query.trim();
  const searching = mode === "search";

  // Local matches update on every keystroke; the server adds saves beyond the loaded list.
  useEffect(() => {
    if (!searching) return;
    let current = true;
    const t = setTimeout(() => {
      search(q)
        .then((found) => current && setRemote({ q, items: found }))
        .catch(() => {});
    }, SEARCH_DELAY_MS);
    return () => {
      current = false;
      clearTimeout(t);
    };
  }, [searching, q, search]);

  // ---- derived data -------------------------------------------------------------------
  const inView = (x: SaveItem) => (view === "inbox" ? x.folders.includes("Inbox") : true);
  const local = items.filter(inView).filter((x) => !searching || matchesQuery(x, q));
  const extra = searching && remote.q === q ? remote.items.filter(inView).filter((x) => !local.some((l) => l.id === x.id)) : [];
  const visible = [...local, ...extra].filter((x) => matchesFilter(x, filter)).sort(newestFirst);

  const realFolders = folders.filter((f) => !f.isInbox);
  const folderCounts = Object.fromEntries(realFolders.map((f) => [f.name, items.filter((x) => x.folders.includes(f.name)).length]));

  const gridTitle = searching
    ? `${visible.length} ${visible.length === 1 ? "result" : "results"} for “${q}”`
    : view === "home"
      ? "Recently saved"
      : VIEW_COPY[view].title;

  // ---- actions ------------------------------------------------------------------------
  const handleSubmit = () => {
    if (!q) return inputRef.current?.focus();
    if (mode === "save") {
      const { duplicateOf } = saveLink(q);
      setQuery("");
      setFilter("All types");
      if (duplicateOf) router.push(saveHref(duplicateOf));
    } else if (mode === "ask") {
      askQuestion(q);
    }
    // "search" filters as you type, so there is nothing to submit.
  };

  // Drop a stale answer as soon as the box is no longer a question.
  useEffect(() => {
    if (mode !== "ask" && ask.mode !== "idle") clearAsk();
  }, [mode, ask.mode, clearAsk]);

  if (state === "error" && items.length === 0) return <LoadError message={loadError} onRetry={reload} />;

  const loading = state === "loading" && items.length === 0;
  const brandNew = state === "ready" && items.length === 0;

  // ---- render -------------------------------------------------------------------------
  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <Eyebrow className="text-xs tracking-[0.12em]">{view === "home" ? dateLine(now) : "Library"}</Eyebrow>
          <h1 className="mt-2 font-serif text-5xl leading-[1.02] sm:text-[56px]">
            {view === "home" ? `${greeting(now)}, ${user.username}.` : VIEW_COPY[view].title}
          </h1>
          {view !== "home" && <p className="mt-2 text-ink-3">{VIEW_COPY[view].blurb}</p>}
        </div>
        <p className="hidden text-sm text-ink-4 md:block">
          Tip: press <kbd className="mx-0.5 rounded-md border border-line-strong bg-card px-1.5 py-0.5 font-mono text-xs">/</kbd> to search · paste anywhere
          to save
        </p>
      </header>

      <Omnibox value={query} mode={mode} inputRef={inputRef} onChange={setQuery} onSubmit={handleSubmit} />

      {!brandNew && (
        <div className="mt-4">
          <TypeFilterBar value={filter} onChange={setFilter} />
        </div>
      )}

      {mode === "ask" && <AskAnswer state={ask} />}

      {view === "home" && !q && realFolders.length > 0 && <CategoryTiles folders={realFolders} counts={folderCounts} />}

      {brandNew ? (
        <section className="mt-10 rounded-3xl border border-dashed border-line-strong px-6 py-12 text-center">
          <h2 className="font-serif text-4xl leading-none">Save your first link</h2>
          <p className="mx-auto mt-3 max-w-md text-ink-3">
            Paste an Instagram reel or an X post above. Stashd reads it, writes a summary and to-dos, and files it into a folder for you.
          </p>
        </section>
      ) : (
        <section aria-labelledby="grid-heading" className="mt-10">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="grid-heading" className="font-serif text-4xl leading-none">
              {gridTitle}
            </h2>
            {!loading && (
              <Eyebrow className="shrink-0 text-xs tracking-[0.12em]">
                {visible.length} {visible.length === 1 ? "save" : "saves"}
              </Eyebrow>
            )}
          </div>

          {loading ? (
            <CardSkeletons />
          ) : visible.length === 0 ? (
            <p className="mt-5 rounded-3xl border border-dashed border-line-strong px-6 py-10 text-ink-3">
              {searching
                ? `No saves match “${q}”. Try a shorter word, or end with ? to ask.`
                : filter !== "All types"
                  ? `No ${filter} saves here yet.`
                  : view === "inbox"
                    ? "Nothing to review. Everything has a folder."
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
        </section>
      )}
    </>
  );
}
