"use client";

import { useEffect, useRef, useState } from "react";
import { useNow } from "@/hooks/useNow";
import { useSaves } from "@/hooks/useSaves";
import { FOLDERS, TYPE_FILTERS, USER } from "@/lib/data";
import type { FolderName, TypeFilter, View } from "@/lib/types";
import { detectMode, extractUrl, matchesFilter, matchesQuery } from "@/lib/utils";
import { MenuIcon } from "@/components/ui/icons";
import { Chip, Eyebrow } from "@/components/ui/primitives";
import { AskAnswer } from "./AskAnswer";
import { DetailPanel } from "./DetailPanel";
import { Omnibox } from "./Omnibox";
import { SaveCard } from "./SaveCard";
import { Sidebar } from "./Sidebar";
import { Toast } from "./Toast";
import { TodayRow } from "./TodayRow";

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

function greeting(now: Date | null) {
  if (!now) return "Hello";
  const h = now.getHours();
  return h < 12 ? "Morning" : h < 17 ? "Afternoon" : "Evening";
}

function dateLine(now: Date | null) {
  if (!now) return " ";
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
  const month = now.toLocaleDateString("en-US", { month: "short" });
  return `${weekday} · ${now.getDate()} ${month}`;
}

export function Dashboard() {
  const { items, toast, ask, say, saveLink, markDone, snooze, archive, moveTo, toggleAction, askQuestion, clearAsk } = useSaves();
  const now = useNow();

  const [view, setView] = useState<View>("today");
  const [folder, setFolder] = useState<FolderName | null>(null);
  const [filter, setFilter] = useState<TypeFilter>("All types");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const mode = detectMode(query);
  const q = query.trim();

  // ---- derived data -------------------------------------------------------------------
  const live = items.filter((x) => !x.archived);
  const counts = {
    today: live.filter((x) => x.due && !x.finished).length,
    all: live.length,
    inbox: live.filter((x) => x.folder === "Inbox").length,
    folders: Object.fromEntries(FOLDERS.map((f) => [f, live.filter((x) => x.folder === f).length])),
  };
  const topFolders = [...FOLDERS].sort((a, b) => counts.folders[b] - counts.folders[a]).filter((f) => counts.folders[f] > 0).slice(0, 2);
  const recap = {
    month: now ? now.toLocaleDateString("en-US", { month: "long" }) : "This month",
    saved: live.length,
    used: live.filter((x) => x.finished).length,
    topFolders,
  };

  const scoped = live.filter((x) => (folder ? x.folder === folder : view === "inbox" ? x.folder === "Inbox" : true));
  const visible = scoped.filter((x) => matchesFilter(x, filter)).filter((x) => mode !== "search" || matchesQuery(x, q));
  const todayItems = live.filter((x) => x.due && !x.finished && matchesFilter(x, filter)).slice(0, 3);
  const showToday = view === "today" && !folder && !q;

  const selected = items.find((x) => x.id === selectedId && !x.archived) ?? null;

  const heading = mode === "search" ? `${visible.length} ${visible.length === 1 ? "result" : "results"} for “${q}”` : folder ?? (view === "inbox" ? "Inbox" : view === "all" ? "All saves" : "Recently saved");
  const folderTodos = folder ? visible.flatMap((x) => x.actions) : [];

  // ---- actions ------------------------------------------------------------------------
  const reveal = () => {
    setView("today");
    setFolder(null);
    setFilter("All types");
  };

  const handleSave = (text: string) => {
    const { duplicateOf } = saveLink(text);
    reveal();
    setQuery("");
    if (duplicateOf) setSelectedId(duplicateOf);
  };

  const handleSubmit = () => {
    if (!q) return inputRef.current?.focus();
    if (mode === "save") handleSave(q);
    else if (mode === "ask") askQuestion(q);
    // "search" filters live as you type, so there is nothing to submit.
  };

  const openFromAnswer = (id: string) => {
    reveal();
    setSelectedId(id);
  };

  // Drop a stale answer as soon as the box is no longer a question.
  useEffect(() => {
    if (mode !== "ask" && ask.mode !== "idle") clearAsk();
  }, [mode, ask.mode, clearAsk]);

  // "/" focuses the box, Esc closes things, and pasting a link anywhere saves it.
  const pasteHandler = useRef(handleSave);
  useEffect(() => {
    pasteHandler.current = handleSave;
  });
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === "Escape") {
        setSelectedId(null);
        setMenuOpen(false);
      }
    };
    const onPaste = (e: ClipboardEvent) => {
      if (isTyping(e.target)) return;
      const text = e.clipboardData?.getData("text") ?? "";
      if (!extractUrl(text)) return;
      e.preventDefault();
      pasteHandler.current(text);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("paste", onPaste);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("paste", onPaste);
    };
  }, []);

  // ---- render -------------------------------------------------------------------------
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar
        view={view}
        folder={folder}
        counts={counts}
        recap={recap}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onView={(v) => {
          setView(v);
          setFolder(null);
          setMenuOpen(false);
        }}
        onFolder={(f) => {
          setFolder(f);
          setMenuOpen(false);
        }}
        onShareRecap={() => say("Recap card", "Sharing is coming soon")}
      />

      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-paper/90 px-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="grid size-11 place-items-center rounded-full hover:bg-sunken"
          >
            <MenuIcon />
          </button>
          <span className="font-serif text-2xl">Stashd</span>
        </div>

        <main className="mx-auto w-full max-w-[1400px] px-4 pt-6 pb-24 sm:px-6 lg:px-10 lg:pt-10">
          <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div>
              <Eyebrow className="text-xs tracking-[0.12em]">{dateLine(now)}</Eyebrow>
              <h1 className="mt-2 font-serif text-5xl leading-[1.02] sm:text-[56px]">
                {greeting(now)}, {USER.name}.
              </h1>
            </div>
            <p className="hidden text-sm text-ink-4 md:block">
              Tip: press <kbd className="mx-0.5 rounded-md border border-line-strong bg-card px-1.5 py-0.5 font-mono text-xs">/</kbd> to search · paste
              anywhere to save
            </p>
          </header>

          <Omnibox value={query} mode={mode} inputRef={inputRef} onChange={setQuery} onSubmit={handleSubmit} />

          <div role="group" aria-label="Filter by type" className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
            {TYPE_FILTERS.map((t) => (
              <Chip key={t} selected={filter === t} onClick={() => setFilter(t)}>
                {t}
              </Chip>
            ))}
          </div>

          {mode === "ask" && <AskAnswer state={ask} items={items} onOpen={openFromAnswer} />}

          {showToday && (
            <TodayRow
              items={todayItems}
              showEmpty={filter === "All types"}
              onOpen={setSelectedId}
              onDone={markDone}
              onSnooze={snooze}
            />
          )}

          <div className="mt-10 flex items-start gap-7">
            <section aria-labelledby="grid-heading" className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <h2 id="grid-heading" className="font-serif text-4xl leading-none">
                    {heading}
                  </h2>
                  {folder && folderTodos.length > 0 && (
                    <p className="mt-2 text-sm text-ink-3">
                      {folderTodos.filter((a) => a.done).length} of {folderTodos.length} to-dos done
                    </p>
                  )}
                </div>
                <Eyebrow className="shrink-0 text-xs tracking-[0.12em]">
                  {visible.length} {visible.length === 1 ? "save" : "saves"}
                </Eyebrow>
              </div>

              {visible.length === 0 ? (
                <p className="mt-5 rounded-3xl border border-dashed border-line-strong px-6 py-10 text-ink-3">
                  {mode === "search"
                    ? `No saves match “${q}”. Try a shorter word, or end with ? to ask.`
                    : filter !== "All types"
                      ? `No ${filter} saves here yet.`
                      : `Nothing in ${heading} yet. Paste a link above to add one.`}
                </p>
              ) : (
                <ul className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
                  {visible.map((item) => (
                    <li key={item.id}>
                      <SaveCard item={item} selected={item.id === selectedId} onOpen={setSelectedId} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {selected && (
              <>
                <div className="fixed inset-0 z-30 animate-fade-in bg-ink/40 xl:hidden" onClick={() => setSelectedId(null)} aria-hidden="true" />
                <DetailPanel
                  item={selected}
                  onClose={() => setSelectedId(null)}
                  onToggleAction={(i) => toggleAction(selected.id, i)}
                  onMove={(f) => moveTo(selected.id, f)}
                  onDone={() => markDone(selected.id)}
                  onSnooze={() => snooze(selected.id)}
                  onArchive={() => archive(selected.id)}
                />
              </>
            )}
          </div>
        </main>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
