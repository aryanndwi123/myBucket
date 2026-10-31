"use client";

import Link from "next/link";
import { useState } from "react";
import { FOLDER_SUBS, FOLDER_TINT, SUB_BLURB, SUGGESTIONS } from "@/lib/data";
import { digest } from "@/lib/digest";
import { folderHref, inSub, saveHref, subHref, UNSORTED } from "@/lib/folders";
import type { ContentFolder, TypeFilter } from "@/lib/types";
import { matchesFilter, newestFirst, oldestFirst } from "@/lib/utils";
import { useSavesContext } from "@/components/app/SavesProvider";
import { SaveCard } from "@/components/saves/SaveCard";
import { TypeFilterBar } from "@/components/saves/TypeFilterBar";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ChipLink, Eyebrow, Tag } from "@/components/ui/primitives";
import { Suggestions } from "./Suggestions";
import { TodoPanel } from "./TodoPanel";

type Sort = "newest" | "oldest";

interface Props {
  folder: ContentFolder;
  /** "" is the Unsorted bucket. */
  sub: string;
}

/** One subcategory: a summary of what's in it, key takeaways, every save, the to-dos and ideas for more. */
export function SubfolderPage({ folder, sub }: Props) {
  const { items, toggleAction } = useSavesContext();
  const [filter, setFilter] = useState<TypeFilter>("All types");
  const [sort, setSort] = useState<Sort>("newest");

  const label = sub || UNSORTED;
  const live = items.filter((x) => !x.archived && x.status !== "processing");
  const saves = inSub(live, folder, sub);
  const d = digest(saves);
  const visible = saves.filter((x) => matchesFilter(x, filter)).sort(sort === "newest" ? newestFirst : oldestFirst);

  const siblings = [...FOLDER_SUBS[folder], ""]
    .map((s) => ({ sub: s, count: inSub(live, folder, s).length }))
    .filter((s) => s.sub !== "" || s.count > 0);
  const total = live.filter((x) => x.folder === folder).length;
  const ideas = sub ? (SUGGESTIONS[folder][sub] ?? []) : [];

  return (
    <>
      <Breadcrumb trail={[{ label: "Saves", href: "/" }, { label: folder, href: folderHref(folder) }, { label }]} />

      <header className="mt-1 rounded-[28px] p-6 sm:p-8" style={{ background: FOLDER_TINT[folder] }}>
        <Eyebrow className="text-xs tracking-[0.12em] text-ink-2">
          <Link href={folderHref(folder)} className="hover:underline">
            {folder}
          </Link>
        </Eyebrow>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className="max-w-xl">
            <h1 className="font-serif text-5xl leading-none sm:text-6xl">{label}</h1>
            <p className="mt-3 text-lg leading-snug text-ink-2">
              {sub ? SUB_BLURB[folder][sub] : `Saves in ${folder} that aren’t filed under a topic yet. Open one and pick where it belongs.`}
            </p>
          </div>
          <dl className="flex gap-3">
            <div className="flex flex-col-reverse rounded-2xl bg-white/65 px-5 py-3">
              <dt className="mt-1 text-sm text-ink-2">{d.count === 1 ? "save" : "saves"}</dt>
              <dd className="font-serif text-4xl leading-none tabular-nums">{d.count}</dd>
            </div>
            <div className="flex flex-col-reverse rounded-2xl bg-white/65 px-5 py-3">
              <dt className="mt-1 text-sm text-ink-2">open to-dos</dt>
              <dd className="font-serif text-4xl leading-none tabular-nums">{d.todos.total - d.todos.done}</dd>
            </div>
          </dl>
        </div>
      </header>

      <nav aria-label={`${folder} topics`} className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
        <ChipLink href={folderHref(folder)}>
          All {folder} <span className="ml-1.5 tabular-nums opacity-70">{total}</span>
        </ChipLink>
        {siblings.map((s) => (
          <ChipLink key={s.sub || "unsorted"} href={subHref(folder, s.sub)} selected={s.sub === sub}>
            {s.sub || UNSORTED} <span className="ml-1.5 tabular-nums opacity-70">{s.count}</span>
          </ChipLink>
        ))}
      </nav>

      <section aria-labelledby="summary-heading" className="mt-8 rounded-3xl border border-line bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="summary-heading" className="font-serif text-3xl leading-none">
            Summary
          </h2>
          {d.count > 0 && <Eyebrow>Built from your {d.count === 1 ? "save" : `${d.count} saves`}</Eyebrow>}
        </div>

        {d.count === 0 ? (
          <p className="mt-3 max-w-2xl text-ink-3">
            Nothing saved in {label} yet. Paste a link and Stashd files it here when it fits.{ideas.length > 0 && " The ideas below are a good place to start."}
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div>
              <p className="text-lg leading-relaxed text-ink-2">{d.overview}</p>
              {d.tags.length > 0 && (
                <ul aria-label="Top tags" className="mt-4 flex flex-wrap gap-2">
                  {d.tags.map((t) => (
                    <li key={t}>
                      <Tag>{t}</Tag>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <Eyebrow>Key takeaways</Eyebrow>
              <ol className="mt-2">
                {d.points.slice(0, 4).map((p, i) => (
                  <li key={p.id} className="flex gap-3 border-b border-line py-3 first:pt-1 last:border-b-0">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-ink font-mono text-xs text-on-ink">{i + 1}</span>
                    <span className="min-w-0">
                      <span className="block text-[15px] leading-snug">{p.text}</span>
                      <Link href={saveHref(p.id)} className="mt-0.5 block truncate text-xs text-ink-4 hover:text-ink hover:underline">
                        {p.title}
                      </Link>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </section>

      <div className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <section aria-labelledby="saves-heading" className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <h2 id="saves-heading" className="font-serif text-4xl leading-none">
              Saves
            </h2>
            <label className="flex items-center gap-2 text-sm text-ink-3">
              Sort
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="h-11 rounded-xl border border-line-strong bg-card px-3 text-sm text-ink sm:h-9"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </label>
          </div>

          <div className="mt-4">
            <TypeFilterBar value={filter} onChange={setFilter} />
          </div>

          {visible.length === 0 ? (
            <p className="mt-5 rounded-3xl border border-dashed border-line-strong px-6 py-10 text-ink-3">
              {d.count === 0 ? `Nothing in ${label} yet.` : `No ${filter} saves in ${label}.`}
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

        <aside aria-label={`${label} to-dos`} className="xl:sticky xl:top-6">
          <TodoPanel title={`To-dos in ${label}`} saves={saves} onToggle={toggleAction} />
        </aside>
      </div>

      {ideas.length > 0 && (
        <Suggestions
          title={`More for ${label}`}
          basis={
            d.count > 0
              ? `Based on your ${d.count} ${d.count === 1 ? "save" : "saves"} in ${label}.`
              : `You haven’t saved anything in ${label} yet. Here’s where to start.`
          }
          items={ideas}
        />
      )}
    </>
  );
}
