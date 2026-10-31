"use client";

import Link from "next/link";
import { useState } from "react";
import { tintFor } from "@/lib/data";
import { folderHref, saveHref } from "@/lib/folders";
import type { SaveItem } from "@/lib/types";
import { cn, kindLabel } from "@/lib/utils";
import { CheckIcon } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/primitives";

const badge = "rounded-md px-2 py-1 font-mono text-[11px] leading-none";
const pill = "inline-flex min-h-7 items-center rounded-full bg-white/85 px-2.5 text-xs font-medium text-ink transition-colors hover:bg-white";

/**
 * Grid card. The title link stretches over the whole card, so the card opens the save page;
 * the folder pills sit above it (z-10) and go to the folder instead.
 */
export function SaveCard({ item }: { item: SaveItem }) {
  const [thumbFailed, setThumbFailed] = useState(false);
  const processing = item.status === "processing";
  const review = item.status === "review";
  const failed = item.status === "unavailable";
  const showThumb = !!item.thumbnailUrl && !thumbFailed && !processing;
  const allDone = item.actions.length > 0 && item.actions.every((a) => a.done);
  const realFolders = item.folders.filter((f) => f !== "Inbox");

  return (
    <article className="group relative flex h-full animate-rise flex-col overflow-hidden rounded-[20px] border border-line bg-card transition-all hover:-translate-y-0.5 hover:shadow-md has-[h3_a:focus-visible]:ring-2 has-[h3_a:focus-visible]:ring-ink">
      <div
        className="relative flex h-28 shrink-0 flex-col justify-between p-3"
        style={{ background: processing || !item.folder ? "var(--color-sunken)" : tintFor(item.folder) }}
      >
        {showThumb && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnailUrl}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setThumbFailed(true)}
            className="absolute inset-0 size-full object-cover opacity-90"
          />
        )}
        <div className="relative flex items-start justify-between gap-2">
          <span className={cn(badge, "bg-white/90 text-ink")}>{kindLabel(item)}</span>
          {review && <span className={cn(badge, "bg-ember-tint font-sans font-medium text-ember-text")}>Needs a look</span>}
          {failed && <span className={cn(badge, "bg-ember-tint font-sans font-medium text-ember-text")}>Couldn’t read</span>}
          {allDone && !review && !failed && (
            <span className={cn(badge, "flex items-center gap-1 bg-white/90 font-sans font-medium text-ink")}>
              <CheckIcon className="size-3" /> Done
            </span>
          )}
        </div>

        {processing ? (
          <span className="relative flex items-center gap-2 text-sm text-ink-3">
            <Spinner /> <span className="animate-pulse-soft">{item.step}</span>
          </span>
        ) : (
          <nav aria-label="Filed in" className="relative z-10 flex flex-wrap items-center gap-1">
            {realFolders.slice(0, 2).map((f) => (
              <Link key={f} href={folderHref(f)} className={pill}>
                {f}
              </Link>
            ))}
            {realFolders.length > 2 && <span className={cn(pill, "hover:bg-white/85")}>+{realFolders.length - 2}</span>}
            {realFolders.length === 0 && item.folders.includes("Inbox") && (
              <Link href="/inbox" className={pill}>
                Inbox
              </Link>
            )}
          </nav>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className={cn("text-[15px] leading-snug font-semibold", processing || failed ? "line-clamp-2 break-all" : "line-clamp-3")}>
          <Link href={saveHref(item.id)} className="outline-none after:absolute after:inset-0">
            {item.title}
          </Link>
        </h3>
        {processing ? (
          <p className="mt-2 text-sm text-ink-4">Saved. You can leave; this keeps going.</p>
        ) : failed ? (
          <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-ink-3">{item.error}</p>
        ) : (
          <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-ink-3">{item.summary}</p>
        )}
        <p className="mt-auto flex justify-between gap-3 pt-3 text-xs text-ink-4">
          <span className="truncate">{item.author || "Fetching…"}</span>
          <span className="shrink-0">{item.saved}</span>
        </p>
      </div>
    </article>
  );
}
