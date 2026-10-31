"use client";

import Link from "next/link";
import { FOLDER_BLURB, FOLDER_SUBS, FOLDER_TINT, SUGGESTIONS } from "@/lib/data";
import { digest } from "@/lib/digest";
import { inSub, saveHref } from "@/lib/folders";
import type { ContentFolder } from "@/lib/types";
import { newestFirst } from "@/lib/utils";
import { useSavesContext } from "@/components/app/SavesProvider";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ArrowRightIcon } from "@/components/ui/icons";
import { Eyebrow, LinkButton } from "@/components/ui/primitives";
import { SubCard } from "./SubCard";
import { TodoPanel } from "./TodoPanel";

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col-reverse rounded-2xl bg-white/65 px-5 py-3">
      <dt className="mt-1 text-sm text-ink-2">{label}</dt>
      <dd className="font-serif text-4xl leading-none tabular-nums">{value}</dd>
    </div>
  );
}

/** A category: its subcategories side by side, each with a summary, plus what to do next. */
export function FolderPage({ folder }: { folder: ContentFolder }) {
  const { items, toggleAction } = useSavesContext();

  const saves = items.filter((x) => !x.archived && x.status !== "processing" && x.folder === folder);
  const d = digest(saves);

  // Subcategories with saves first (taxonomy order within ties); Unsorted only when something is in it.
  const groups = [...FOLDER_SUBS[folder], ""]
    .map((sub) => ({ sub, saves: inSub(saves, folder, sub) }))
    .filter((g) => g.sub !== "" || g.saves.length > 0)
    .sort((a, b) => b.saves.length - a.saves.length);
  const inUse = groups.filter((g) => g.sub !== "" && g.saves.length > 0).length;
  const openTodos = d.todos.total - d.todos.done;
  const recent = [...saves].sort(newestFirst).slice(0, 3);

  return (
    <>
      <Breadcrumb trail={[{ label: "Saves", href: "/" }, { label: folder }]} />

      <header className="mt-1 rounded-[28px] p-6 sm:p-10" style={{ background: FOLDER_TINT[folder] }}>
        <Eyebrow className="text-xs tracking-[0.12em] text-ink-2">Category</Eyebrow>
        <h1 className="mt-2 font-serif text-6xl leading-none sm:text-7xl">{folder}</h1>
        <p className="mt-3 max-w-xl text-lg leading-snug text-ink-2">{FOLDER_BLURB[folder]}</p>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <dl className="flex flex-wrap gap-3">
            <Stat value={d.count} label={d.count === 1 ? "save" : "saves"} />
            <Stat value={inUse} label={`of ${FOLDER_SUBS[folder].length} topics in use`} />
            <Stat value={openTodos} label="open to-dos" />
            {d.dueToday > 0 && <Stat value={d.dueToday} label="due today" />}
          </dl>
          {folder === "Recipes" && (
            <LinkButton href="/recipes" variant="ink">
              Recipes summary <ArrowRightIcon className="size-4" />
            </LinkButton>
          )}
        </div>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <section aria-labelledby="subs-heading" className="min-w-0">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="subs-heading" className="font-serif text-4xl leading-none">
              Topics in {folder}
            </h2>
            <Eyebrow className="shrink-0 text-xs tracking-[0.12em]">{groups.length} topics</Eyebrow>
          </div>
          <div className="mt-5 grid grid-cols-1 items-start gap-5 md:grid-cols-2">
            {groups.map((g) => (
              <SubCard key={g.sub || "unsorted"} folder={folder} sub={g.sub} saves={g.saves} ideas={g.sub ? (SUGGESTIONS[folder][g.sub] ?? []) : []} />
            ))}
          </div>
        </section>

        <aside aria-label={`${folder} overview`} className="flex flex-col gap-5 xl:sticky xl:top-6">
          <TodoPanel title={`Up next in ${folder}`} saves={saves} onToggle={toggleAction} />

          {recent.length > 0 && (
            <section aria-labelledby="recent-heading" className="rounded-3xl border border-line bg-card p-5">
              <h2 id="recent-heading" className="font-serif text-2xl leading-none">
                Recently saved
              </h2>
              <ul className="mt-2">
                {recent.map((s) => (
                  <li key={s.id} className="border-b border-line last:border-b-0">
                    <Link href={saveHref(s.id)} className="block py-3 hover:underline">
                      <span className="block text-[15px] leading-snug font-medium">{s.title}</span>
                      <span className="mt-0.5 block text-xs text-ink-4">
                        {[s.subcategory, s.saved].filter(Boolean).join(" · ")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
