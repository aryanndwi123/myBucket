"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { SUB_BLURB, type Suggestion } from "@/lib/data";
import { digest } from "@/lib/digest";
import { saveHref, subHref, UNSORTED } from "@/lib/folders";
import type { ContentFolder, SaveItem } from "@/lib/types";
import { cn, newestFirst } from "@/lib/utils";
import { ArrowRightIcon, ChevronDownIcon, SparkIcon } from "@/components/ui/icons";
import { Button, Eyebrow, LinkButton, ProgressBar, Tag } from "@/components/ui/primitives";

interface Props {
  folder: ContentFolder;
  /** "" is the Unsorted bucket. */
  sub: string;
  saves: SaveItem[];
  ideas: Suggestion[];
}

/**
 * One subcategory on the category page: what it covers, a summary built from its saves,
 * progress on its to-dos, the latest saves, and the two things you can do next
 * (open it, or look at ideas for it).
 */
export function SubCard({ folder, sub, saves, ideas }: Props) {
  const [showIdeas, setShowIdeas] = useState(false);
  const uid = useId();
  const d = digest(saves);
  const label = sub || UNSORTED;
  const blurb = sub ? SUB_BLURB[folder][sub] : "Saves in this category that aren’t filed under a subcategory yet.";
  const latest = [...saves].filter((x) => x.status !== "processing").sort(newestFirst).slice(0, 2);
  const empty = d.count === 0;

  return (
    <article aria-labelledby={`${uid}-title`} className={cn("flex flex-col rounded-3xl border bg-card p-6", empty ? "border-dashed border-line-strong bg-card/60" : "border-line")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id={`${uid}-title`} className="font-serif text-[32px] leading-none">
            <Link href={subHref(folder, sub)} className="hover:underline">
              {label}
            </Link>
          </h3>
          <p className="mt-2 text-sm text-ink-3">{blurb}</p>
        </div>
        <span className="shrink-0 rounded-full bg-sunken px-3 py-1 text-xs font-medium text-ink-2 tabular-nums">
          {d.count} {d.count === 1 ? "save" : "saves"}
        </span>
      </div>

      {empty ? (
        <p className="mt-5 text-sm text-ink-3">Nothing saved here yet. Paste a link and Stashd files it here when it fits.</p>
      ) : (
        <>
          <div className="mt-5">
            <Eyebrow>Summary</Eyebrow>
            <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">{d.overview}</p>
          </div>

          {d.tags.length > 0 && (
            <ul aria-label="Top tags" className="mt-4 flex flex-wrap gap-2">
              {d.tags.map((t) => (
                <li key={t}>
                  <Tag>{t}</Tag>
                </li>
              ))}
            </ul>
          )}

          {d.todos.total > 0 && (
            <div className="mt-5">
              <div className="flex items-baseline justify-between text-sm text-ink-3">
                <span>To-dos</span>
                <span className="tabular-nums">
                  {d.todos.done} of {d.todos.total} done
                </span>
              </div>
              <ProgressBar value={d.todos.done} max={d.todos.total} label={`${label} to-dos`} className="mt-2" />
            </div>
          )}

          <div className="mt-5">
            <Eyebrow>Latest</Eyebrow>
            <ul className="mt-1">
              {latest.map((s) => (
                <li key={s.id} className="border-b border-line last:border-b-0">
                  <Link href={saveHref(s.id)} className="flex min-h-11 items-center justify-between gap-3 py-2 text-[15px] hover:underline">
                    <span className="truncate">{s.title}</span>
                    <span className="shrink-0 text-xs text-ink-4">{s.saved}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
        <LinkButton href={subHref(folder, sub)} size="sm">
          {empty ? "Open" : `Open all ${d.count}`} <ArrowRightIcon className="size-4" />
        </LinkButton>
        {ideas.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => setShowIdeas((v) => !v)} aria-expanded={showIdeas} aria-controls={`${uid}-ideas`}>
            <SparkIcon className="size-4" /> Ideas · {ideas.length}
            <ChevronDownIcon className={cn("size-4 transition-transform", showIdeas && "rotate-180")} />
          </Button>
        )}
      </div>

      {showIdeas && (
        <div id={`${uid}-ideas`} className="mt-4 animate-rise rounded-2xl bg-paper p-4">
          <Eyebrow className="flex items-center gap-1.5">
            <SparkIcon className="size-3.5" /> Suggested by AI · sample
          </Eyebrow>
          <ul className="mt-2">
            {ideas.map((s) => (
              <li key={s.title} className="border-b border-line py-3 last:border-b-0 last:pb-0">
                <p className="text-[15px] leading-snug font-semibold">{s.title}</p>
                <p className="mt-1 text-sm leading-snug text-ink-3">{s.why}</p>
                <p className="mt-1 text-xs text-ink-4">
                  {s.by} · {s.kind}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
