"use client";

import { folderHref } from "@/lib/folders";
import type { Folder } from "@/lib/types";
import type { Topic } from "@/lib/topics";
import { useSavesContext } from "@/components/app/SavesProvider";
import { SaveCard } from "@/components/saves/SaveCard";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { TodoPanel } from "./TodoPanel";

/** One topic within a folder: its own to-dos, then its saves. */
export function SubfolderPage({ folder, topic }: { folder: Folder; topic: Topic }) {
  const { toggleAction } = useSavesContext();

  return (
    <>
      <Breadcrumb trail={[{ label: "Home", href: "/" }, { label: folder.name, href: folderHref(folder.name) }, { label: topic.name }]} />

      <header className="mt-1">
        <h1 className="font-serif text-4xl leading-none sm:text-5xl">{topic.name}</h1>
        <p className="mt-2 text-ink-3">
          {topic.saves.length} {topic.saves.length === 1 ? "save" : "saves"} in {folder.name}.
        </p>
      </header>

      <div className="mt-8">
        <TodoPanel title={`${topic.name} to-dos`} saves={topic.saves} onToggle={toggleAction} />
      </div>

      <section aria-labelledby="topic-saves-heading" className="mt-10">
        <h2 id="topic-saves-heading" className="font-serif text-3xl leading-none">
          Saves
        </h2>
        {topic.saves.length === 0 ? (
          <p className="mt-5 rounded-3xl border border-dashed border-line-strong px-6 py-10 text-ink-3">Nothing here yet.</p>
        ) : (
          <ul className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
            {topic.saves.map((item) => (
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
