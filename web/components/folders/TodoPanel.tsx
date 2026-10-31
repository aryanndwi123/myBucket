"use client";

import Link from "next/link";
import { useState } from "react";
import { saveHref } from "@/lib/folders";
import type { SaveItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CheckIcon } from "@/components/ui/icons";
import { ProgressBar } from "@/components/ui/primitives";

interface Props {
  title?: string;
  saves: SaveItem[];
  onToggle: (saveId: string, index: number) => void;
  /** How many to show before "Show all". */
  limit?: number;
}

/** To-dos across several saves, open ones first. Each row links back to the save it came from. */
export function TodoPanel({ title = "To-dos", saves, onToggle, limit = 6 }: Props) {
  const [expanded, setExpanded] = useState(false);

  const rows = saves.flatMap((save) => save.actions.map((action, index) => ({ save, action, index })));
  const ordered = [...rows.filter((r) => !r.action.done), ...rows.filter((r) => r.action.done)];
  const done = rows.length - rows.filter((r) => !r.action.done).length;
  const shown = expanded ? ordered : ordered.slice(0, limit);

  return (
    <section aria-label={title} className="rounded-3xl border border-line bg-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-serif text-2xl leading-none">{title}</h2>
        {rows.length > 0 && (
          <span className="text-sm text-ink-3 tabular-nums">
            {done} of {rows.length} done
          </span>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-ink-3">No to-dos yet. Stashd adds them when it reads a save.</p>
      ) : (
        <>
          <ProgressBar value={done} max={rows.length} label={`${title} progress`} className="mt-3" />
          <ul className="mt-2">
            {shown.map(({ save, action, index }) => (
              <li key={`${save.id}-${index}`} className="flex items-start gap-3 border-b border-line py-3 last:border-b-0">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={action.done}
                  aria-label={action.text}
                  onClick={() => onToggle(save.id, index)}
                  className={cn(
                    "relative mt-0.5 grid size-[22px] shrink-0 place-items-center rounded-md border-2 border-ink transition-colors before:absolute before:-inset-3 before:content-['']",
                    action.done ? "bg-ink text-on-ink" : "bg-card",
                  )}
                >
                  {action.done && <CheckIcon className="size-3.5" />}
                </button>
                <div className="min-w-0">
                  <p className={cn("text-[15px] leading-snug", action.done && "text-ink-4 line-through")}>{action.text}</p>
                  <Link href={saveHref(save.id)} className="mt-0.5 block truncate text-xs text-ink-4 hover:text-ink hover:underline">
                    {save.title}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
          {ordered.length > limit && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-ink-3 hover:text-ink"
            >
              {expanded ? "Show fewer" : `Show all ${ordered.length}`}
            </button>
          )}
        </>
      )}
    </section>
  );
}
