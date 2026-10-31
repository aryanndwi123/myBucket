"use client";

import { tintFor } from "@/lib/data";
import type { Folder } from "@/lib/types";
import { newestFirst } from "@/lib/utils";
import { topicsOf } from "@/lib/topics";
import { useSavesContext } from "@/components/app/SavesProvider";
import { SaveCard } from "@/components/saves/SaveCard";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { CardSkeletons } from "@/components/ui/States";
import { Eyebrow } from "@/components/ui/primitives";
import { SubCard } from "./SubCard";
import { TodoPanel } from "./TodoPanel";

/** One folder's own page: its to-dos, its topics, then every save filed here. */
export function FolderPage({ folder }: { folder: Folder }) {
  const { items, state, toggleAction } = useSavesContext();

  const saves = items.filter((x) => x.folders.includes(folder.name)).sort(newestFirst);
  const { topics } = topicsOf(saves);
  const loading = state === "loading" && saves.length === 0;

  return (
    <>
      <Breadcrumb trail={[{ label: "Home", href: "/" }, { label: folder.name }]} />

      <header className="mt-1 rounded-[28px] p-6 sm:p-10" style={{ background: tintFor(folder.name) }}>
        <h1 className="font-serif text-4xl leading-none sm:text-5xl">{folder.name}</h1>
        <p className="mt-3 max-w-prose text-ink-2">{folder.description || `${saves.length} ${saves.length === 1 ? "save" : "saves"} filed here.`}</p>
      </header>

      <div className="mt-8">
        <TodoPanel title={`${folder.name} to-dos`} saves={saves} onToggle={toggleAction} />
      </div>

      {topics.length > 0 && (
        <section aria-labelledby="topics-heading" className="mt-10">
          <h2 id="topics-heading" className="font-serif text-3xl leading-none">
            Topics
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {topics.map((t) => (
              <li key={t.slug}>
                <SubCard folder={folder} topic={t} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="all-heading" className="mt-10">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="all-heading" className="font-serif text-3xl leading-none">
            All saves
          </h2>
          {!loading && (
            <Eyebrow className="shrink-0 text-xs tracking-[0.12em]">
              {saves.length} {saves.length === 1 ? "save" : "saves"}
            </Eyebrow>
          )}
        </div>

        {loading ? (
          <CardSkeletons />
        ) : saves.length === 0 ? (
          <p className="mt-5 rounded-3xl border border-dashed border-line-strong px-6 py-10 text-ink-3">Nothing filed here yet.</p>
        ) : (
          <ul className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
            {saves.map((item) => (
              <li key={item.id}>
                <SaveCard item={item} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
