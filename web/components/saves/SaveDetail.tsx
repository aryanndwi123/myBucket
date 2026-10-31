"use client";

import { useRouter } from "next/navigation";
import { tintFor } from "@/lib/data";
import { folderHref } from "@/lib/folders";
import type { SaveItem } from "@/lib/types";
import { kindLabel, newestFirst } from "@/lib/utils";
import { useSavesContext } from "@/components/app/SavesProvider";
import { Breadcrumb, type Crumb } from "@/components/ui/Breadcrumb";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { Button, buttonClass, Checkbox, Chip, Eyebrow, LinkButton, ProgressBar, Spinner, Tag } from "@/components/ui/primitives";
import { SaveCard } from "./SaveCard";

const badge = "rounded-md bg-white/85 px-2 py-1 font-mono text-[11px] leading-none text-ink";
const card = "rounded-3xl border border-line bg-card p-5";

/** Say how sure the AI was, so moving a save feels like teaching, not fixing. */
function folderNote(item: SaveItem) {
  if (item.confidence === "you picked") return "You picked this one. Stashd will remember.";
  if (item.folder === "Inbox" || !item.folder) return `Not sure about this one${item.confidence ? ` (${item.confidence})` : ""}. Pick where it belongs.`;
  return `AI picked, ${item.confidence} sure. Wrong? One click, and Stashd learns from it.`;
}

function StateMessage({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <h1 className="font-serif text-5xl leading-none">{title}</h1>
      <p className="mt-4 text-ink-3">{body}</p>
      <div className="mt-6 flex justify-center gap-3">{children}</div>
    </div>
  );
}

/** A single save, full page. */
export function SaveDetail({ id }: { id: string }) {
  const { items, folders, toggleAction, toggleFolder, retry, remove } = useSavesContext();
  const router = useRouter();
  const item = items.find((x) => x.id === id);

  if (!item) {
    return (
      <StateMessage title="Save not found" body="It may have been removed, or the link is wrong.">
        <LinkButton href="/all">All saves</LinkButton>
      </StateMessage>
    );
  }

  const processing = item.status === "processing";
  const review = item.status === "review";
  const failed = item.status === "unavailable";
  const doneCount = item.actions.filter((a) => a.done).length;
  const realFolders = folders.filter((f) => !f.isInbox);
  const primaryHref = item.folder ? folderHref(item.folder) : "/";

  const trail: Crumb[] = [{ label: "Saves", href: "/" }];
  if (item.folder && item.folder !== "Inbox") trail.push({ label: item.folder, href: folderHref(item.folder) });
  else if (item.folders.includes("Inbox")) trail.push({ label: "Inbox", href: "/inbox" });
  trail.push({ label: processing ? "Saving…" : item.title });

  const related = item.folder
    ? items
        .filter((x) => x.id !== item.id && x.status !== "processing" && x.folders.includes(item.folder))
        .sort(newestFirst)
        .slice(0, 3)
    : [];

  const onDelete = async () => {
    const ok = await remove(item.id);
    if (ok) router.push(primaryHref);
  };

  return (
    <>
      <Breadcrumb trail={trail} />

      <header className="mt-1 rounded-[28px] p-6 sm:p-10" style={{ background: processing || !item.folder ? "var(--color-sunken)" : tintFor(item.folder) }}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={badge}>{kindLabel(item)}</span>
          {item.intent && <span className={badge}>{item.intent}</span>}
          {review && <span className="rounded-md bg-ember-tint px-2 py-1 text-[11px] leading-none font-medium text-ember-text">Needs a look</span>}
          {failed && <span className="rounded-md bg-ember-tint px-2 py-1 text-[11px] leading-none font-medium text-ember-text">Couldn’t read</span>}
        </div>

        {processing ? (
          <>
            <h1 className="mt-4 max-w-3xl font-mono text-xl leading-snug break-all text-ink-2">{item.title}</h1>
            <p className="mt-5 flex items-center gap-3 text-lg font-medium">
              <Spinner /> <span className="animate-pulse-soft">{item.step}</span>
            </p>
            <p className="mt-2 text-ink-2">It’s saved. You can leave this page; it fills in when it’s done.</p>
          </>
        ) : (
          <>
            <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-[1.05] sm:text-5xl lg:text-[56px]">{item.title}</h1>
            <p className="mt-4 text-ink-2">{[item.author, `saved ${item.saved} · ${item.savedOn}`].filter(Boolean).join(" · ")}</p>
          </>
        )}
      </header>

      {failed && (
        <section className="mt-8 rounded-3xl border border-ember-tint bg-ember-tint/40 p-5">
          <p className="font-medium text-ember-text">{item.error ?? "We couldn’t read this link."}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => retry(item.id)}>
            Try again
          </Button>
        </section>
      )}

      {!processing && !failed && (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="flex min-w-0 flex-col gap-10">
            <section aria-labelledby="summary-heading">
              <h2 id="summary-heading" className="font-serif text-3xl leading-none">
                Summary
              </h2>
              <p className="mt-3 max-w-prose text-lg leading-relaxed text-ink-2">{item.summary}</p>
              {item.tags.length > 0 && (
                <ul aria-label="Tags" className="mt-4 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <li key={tag}>
                      <Tag>{tag}</Tag>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {item.actions.length > 0 && (
              <section aria-labelledby="todos-heading">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 id="todos-heading" className="font-serif text-3xl leading-none">
                    To-dos
                  </h2>
                  <span className="text-sm text-ink-3 tabular-nums">
                    {doneCount} of {item.actions.length} done
                  </span>
                </div>
                <ProgressBar value={doneCount} max={item.actions.length} label="To-dos progress" className="mt-3 max-w-prose" />
                <div role="group" aria-labelledby="todos-heading" className="mt-2 max-w-prose">
                  {item.actions.map((action, i) => (
                    <Checkbox key={i} checked={action.done} onChange={() => toggleAction(item.id, i)}>
                      {action.text}
                    </Checkbox>
                  ))}
                </div>
              </section>
            )}

            {item.text && (
              <section aria-labelledby="text-heading">
                <h2 id="text-heading" className="font-serif text-3xl leading-none">
                  {item.textSource === "audio" ? "Transcript" : "Post text"}
                </h2>
                <p className="mt-3 max-w-prose text-[16px] leading-relaxed">{item.text}</p>
              </section>
            )}
          </div>

          <aside aria-label="Actions" className="flex flex-col gap-4 lg:sticky lg:top-6">
            <section aria-labelledby="filing-heading" className={card}>
              <h2 id="filing-heading" className="font-serif text-2xl leading-none">
                Filed in
              </h2>
              <p className="mt-2 text-sm leading-snug text-ink-3">{folderNote(item)}</p>

              <Eyebrow className="mt-4">Folders</Eyebrow>
              <div role="group" aria-label="Folders" className="mt-2 flex flex-wrap gap-2">
                {realFolders.map((f) => (
                  <Chip key={f.id} selected={item.folders.includes(f.name)} onClick={() => toggleFolder(item.id, f.name)}>
                    {f.name}
                  </Chip>
                ))}
              </div>
            </section>

            <section aria-label="Source" className={`${card} flex flex-col gap-2`}>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className={buttonClass("outline", "md", "w-full")}>
                Open original <ArrowUpRightIcon className="size-4" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
              <Button variant="ghost" onClick={onDelete} className="w-full">
                Delete
              </Button>
            </section>
          </aside>
        </div>
      )}

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-14">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 id="related-heading" className="font-serif text-4xl leading-none">
              More in {item.folder}
            </h2>
          </div>
          <ul className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
            {related.map((s) => (
              <li key={s.id}>
                <SaveCard item={s} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
