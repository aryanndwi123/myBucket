"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FOLDERS, FOLDER_SUBS, FOLDER_TINT } from "@/lib/data";
import { folderHref, inSub, subHref } from "@/lib/folders";
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
  if (item.folder === "Inbox") return `Not sure about this one (${item.confidence}). Pick where it belongs.`;
  return `AI picked, ${item.confidence} sure. Wrong? One click, and Stashd learns from it.`;
}

function ReminderCard({ item, onDone, onSnooze }: { item: SaveItem; onDone: () => void; onSnooze: () => void }) {
  const hasReminder = item.remind !== "" && item.remind !== "No reminder yet";

  return (
    <section aria-label="Reminder" className="rounded-3xl bg-ink p-5 text-on-ink">
      {item.finished ? (
        <p className="font-semibold">Marked done. Nice one.</p>
      ) : hasReminder ? (
        <>
          <Eyebrow className="text-ember-soft">Reminder</Eyebrow>
          <p className="mt-1.5 text-[19px] font-semibold">{item.remind}</p>
          <p className="mt-1 text-sm leading-snug text-on-ink-muted">{item.why}</p>
          <div className="mt-4 flex gap-2">
            <Button variant="light" size="sm" onClick={onDone}>
              Done
            </Button>
            <Button variant="dark-outline" size="sm" onClick={onSnooze}>
              Snooze a day
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="font-semibold">No reminder yet</p>
          <p className="mt-1 text-sm text-on-ink-muted">{item.why}</p>
        </>
      )}
    </section>
  );
}

function Transcript({ item }: { item: SaveItem }) {
  const hasTranslation = !!item.transcriptEn && item.transcriptEn !== item.transcript;
  const [showEnglish, setShowEnglish] = useState(false);

  return (
    <section aria-labelledby="transcript-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="transcript-heading" className="font-serif text-3xl leading-none">
          Transcript
        </h2>
        {hasTranslation && (
          <div role="group" aria-label="Transcript language" className="flex gap-2">
            <Chip selected={!showEnglish} onClick={() => setShowEnglish(false)}>
              Original
            </Chip>
            <Chip selected={showEnglish} onClick={() => setShowEnglish(true)}>
              English
            </Chip>
          </div>
        )}
      </div>
      <p className="mt-1 text-sm text-ink-3">{item.language}</p>
      <p className="mt-3 max-w-prose text-[16px] leading-relaxed">{showEnglish && hasTranslation ? item.transcriptEn : item.transcript}</p>
    </section>
  );
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

/** A single save, full page. Replaces the old side panel. */
export function SaveDetail({ id }: { id: string }) {
  const { items, toggleAction, moveTo, moveToSub, markDone, snooze, archive, restore } = useSavesContext();
  const router = useRouter();
  const item = items.find((x) => x.id === id);

  if (!item) {
    return (
      <StateMessage title="Save not found" body="It may have been removed, or the link is wrong. Saves added in this demo reset when you refresh the page.">
        <LinkButton href="/all">All saves</LinkButton>
      </StateMessage>
    );
  }

  const category = item.folder && item.folder !== "Inbox" ? item.folder : null;
  const parentHref = category ? (item.subcategory ? subHref(category, item.subcategory) : folderHref(category)) : item.folder === "Inbox" ? "/inbox" : "/";

  if (item.archived) {
    return (
      <StateMessage title="Archived" body={`“${item.title}” is out of your way. Restore it any time.`}>
        <Button onClick={() => restore(item.id)}>Restore</Button>
        <LinkButton href={parentHref} variant="outline">
          Back
        </LinkButton>
      </StateMessage>
    );
  }

  const processing = item.status === "processing";
  const review = item.status === "review";
  const subs = category ? FOLDER_SUBS[category] : [];
  const doneCount = item.actions.filter((a) => a.done).length;

  const trail: Crumb[] = [{ label: "Saves", href: "/" }];
  if (category) {
    trail.push({ label: category, href: folderHref(category) });
    if (item.subcategory) trail.push({ label: item.subcategory, href: subHref(category, item.subcategory) });
  } else if (item.folder === "Inbox") {
    trail.push({ label: "Inbox", href: "/inbox" });
  }
  trail.push({ label: processing ? "Saving…" : item.title });

  const related = category
    ? inSub(
        items.filter((x) => !x.archived && x.status !== "processing" && x.id !== item.id),
        category,
        item.subcategory,
      )
        .sort(newestFirst)
        .slice(0, 3)
    : [];

  const onArchive = () => {
    archive(item.id);
    router.push(parentHref);
  };

  return (
    <>
      <Breadcrumb trail={trail} />

      <header className="mt-1 rounded-[28px] p-6 sm:p-10" style={{ background: processing || !item.folder ? "var(--color-sunken)" : FOLDER_TINT[item.folder] }}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={badge}>{kindLabel(item)}</span>
          {item.intent && <span className={badge}>{item.intent}</span>}
          {review && <span className="rounded-md bg-ember-tint px-2 py-1 text-[11px] leading-none font-medium text-ember-text">Needs a look</span>}
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

      {!processing && (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="flex min-w-0 flex-col gap-10">
            <div className="lg:hidden">
              <ReminderCard item={item} onDone={() => markDone(item.id)} onSnooze={() => snooze(item.id)} />
            </div>

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

            <Transcript key={item.id} item={item} />
          </div>

          <aside aria-label="Actions" className="flex flex-col gap-4 lg:sticky lg:top-6">
            <div className="hidden lg:block">
              <ReminderCard item={item} onDone={() => markDone(item.id)} onSnooze={() => snooze(item.id)} />
            </div>

            <section aria-labelledby="filing-heading" className={card}>
              <h2 id="filing-heading" className="font-serif text-2xl leading-none">
                Filed in
              </h2>
              <p className="mt-2 text-sm leading-snug text-ink-3">{folderNote(item)}</p>

              <Eyebrow className="mt-4">Category</Eyebrow>
              <div role="group" aria-label="Category" className="mt-2 flex flex-wrap gap-2">
                {FOLDERS.map((name) => (
                  <Chip key={name} selected={item.folder === name} onClick={() => moveTo(item.id, name)}>
                    {name}
                  </Chip>
                ))}
              </div>

              {subs.length > 0 && (
                <>
                  <Eyebrow className="mt-4">Topic{item.subcategory ? "" : " · not set"}</Eyebrow>
                  <div role="group" aria-label="Topic" className="mt-2 flex flex-wrap gap-2">
                    {subs.map((name) => (
                      <Chip key={name} selected={item.subcategory === name} onClick={() => moveToSub(item.id, name)}>
                        {name}
                      </Chip>
                    ))}
                  </div>
                </>
              )}
            </section>

            <section aria-label="Source" className={`${card} flex flex-col gap-2`}>
              <a href={`https://${item.key}`} target="_blank" rel="noopener noreferrer" className={buttonClass("outline", "md", "w-full")}>
                Open original <ArrowUpRightIcon className="size-4" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
              <Button variant="ghost" onClick={onArchive} className="w-full">
                Archive
              </Button>
            </section>
          </aside>
        </div>
      )}

      {related.length > 0 && category && (
        <section aria-labelledby="related-heading" className="mt-14">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 id="related-heading" className="font-serif text-4xl leading-none">
              More in {item.subcategory || category}
            </h2>
            <Link href={parentHref} className="inline-flex min-h-11 items-center text-sm font-medium text-ink-3 hover:text-ink hover:underline">
              See all
            </Link>
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
