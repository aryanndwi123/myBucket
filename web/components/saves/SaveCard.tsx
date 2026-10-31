import Link from "next/link";
import { FOLDER_TINT } from "@/lib/data";
import { folderHref, saveHref, subHref } from "@/lib/folders";
import type { SaveItem } from "@/lib/types";
import { cn, kindLabel } from "@/lib/utils";
import { CheckIcon } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/primitives";

const badge = "rounded-md px-2 py-1 font-mono text-[11px] leading-none";
const pill = "inline-flex min-h-7 items-center rounded-full bg-white/80 px-2.5 text-xs font-medium text-ink transition-colors hover:bg-white";

/**
 * Grid card. The title link stretches over the whole card, so the card opens the save page;
 * the category pills sit above it (z-10) and go to the category / subcategory instead.
 * The cover is the category tint until real thumbnails are stored; render a thumbnail
 * inside the cover <div> when `source.thumbnailUrl` exists.
 */
export function SaveCard({ item }: { item: SaveItem }) {
  const processing = item.status === "processing";
  const review = item.status === "review";
  const category = item.folder && item.folder !== "Inbox" ? item.folder : null;

  return (
    <article className="group relative flex h-full animate-rise flex-col overflow-hidden rounded-[20px] border border-line bg-card transition-all hover:-translate-y-0.5 hover:shadow-md has-[h3_a:focus-visible]:ring-2 has-[h3_a:focus-visible]:ring-ink">
      <div
        className="flex h-24 shrink-0 flex-col justify-between p-3"
        style={{ background: processing || !item.folder ? "var(--color-sunken)" : FOLDER_TINT[item.folder] }}
      >
        <div className="flex items-start justify-between gap-2">
          <span className={cn(badge, "bg-white/85 text-ink")}>{kindLabel(item)}</span>
          {review && <span className={cn(badge, "bg-ember-tint font-sans font-medium text-ember-text")}>Needs a look</span>}
          {item.finished && !review && (
            <span className={cn(badge, "flex items-center gap-1 bg-white/85 font-sans font-medium text-ink")}>
              <CheckIcon className="size-3" /> Done
            </span>
          )}
        </div>

        {processing ? (
          <span className="flex items-center gap-2 text-sm text-ink-3">
            <Spinner /> <span className="animate-pulse-soft">{item.step}</span>
          </span>
        ) : (
          <nav aria-label="Filed under" className="relative z-10 flex flex-wrap items-center gap-1">
            {category ? (
              <>
                <Link href={folderHref(category)} className={pill}>
                  {category}
                </Link>
                {item.subcategory && (
                  <>
                    <span aria-hidden="true" className="text-xs text-ink/60">
                      ›
                    </span>
                    <Link href={subHref(category, item.subcategory)} className={pill}>
                      {item.subcategory}
                    </Link>
                  </>
                )}
              </>
            ) : (
              <Link href="/inbox" className={pill}>
                Inbox
              </Link>
            )}
          </nav>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {processing ? (
          <>
            <h3 className="truncate font-mono text-sm text-ink-3">
              <Link href={saveHref(item.id)} className="outline-none after:absolute after:inset-0">
                {item.title}
              </Link>
            </h3>
            <p className="mt-2 text-sm text-ink-4">Saved. You can leave — this keeps going.</p>
          </>
        ) : (
          <>
            <h3 className="line-clamp-3 text-[15px] leading-snug font-semibold">
              <Link href={saveHref(item.id)} className="outline-none after:absolute after:inset-0">
                {item.title}
              </Link>
            </h3>
            <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-ink-3">{item.summary}</p>
          </>
        )}
        <p className="mt-auto flex justify-between gap-3 pt-3 text-xs text-ink-4">
          <span className="truncate">{item.author || "Fetching…"}</span>
          <span className="shrink-0">{item.saved}</span>
        </p>
      </div>
    </article>
  );
}
