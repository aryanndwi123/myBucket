import { tintFor } from "@/lib/data";
import type { SaveItem } from "@/lib/types";
import { cn, kindLabel } from "@/lib/utils";
import { CheckIcon } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/primitives";

interface Props {
  item: SaveItem;
  selected: boolean;
  onOpen: (id: string) => void;
}

const badge = "absolute top-3 rounded-md px-2 py-1 font-mono text-[11px] leading-none";

/**
 * Grid card. The cover is the folder's tint until real thumbnails are stored;
 * render a thumbnail inside the cover <span> when `source.thumbnailUrl` exists.
 */
export function SaveCard({ item, selected, onOpen }: Props) {
  const processing = item.status === "processing";
  const review = item.status === "review";

  return (
    <button
      type="button"
      onClick={() => onOpen(item.id)}
      aria-pressed={selected}
      className={cn(
        "flex h-full w-full animate-rise flex-col overflow-hidden rounded-[22px] border bg-card text-left transition-all hover:-translate-y-0.5 hover:shadow-md",
        selected ? "border-ink ring-2 ring-ink" : "border-line",
      )}
    >
      <span className="relative block h-32 shrink-0" style={{ background: processing ? "var(--color-sunken)" : tintFor(item.folder) }}>
        <span className={cn(badge, "left-3 bg-white/85 text-ink")}>{kindLabel(item)}</span>
        {review && <span className={cn(badge, "right-3 bg-ember-tint font-sans font-medium text-ember-text")}>Needs a look</span>}
        {item.finished && !review && (
          <span className={cn(badge, "right-3 flex items-center gap-1 bg-white/85 font-sans font-medium text-ink")}>
            <CheckIcon className="size-3" /> Done
          </span>
        )}
        {processing ? (
          <span className="absolute inset-x-4 bottom-4 flex items-center gap-2 text-sm text-ink-3">
            <Spinner /> <span className="animate-pulse-soft">{item.step}</span>
          </span>
        ) : (
          <span className="absolute bottom-3 left-4 font-serif text-[32px] leading-none text-ink/80 italic">{item.folder}</span>
        )}
      </span>

      <span className="flex flex-1 flex-col p-4">
        {processing ? (
          <>
            <span className="truncate font-mono text-sm text-ink-3">{item.title}</span>
            <span className="mt-2 text-sm text-ink-4">Saved. You can leave — this keeps going.</span>
          </>
        ) : (
          <>
            <span className="line-clamp-3 text-[15px] leading-snug font-semibold">{item.title}</span>
            <span className="mt-1.5 line-clamp-2 text-sm leading-snug text-ink-3">{item.summary}</span>
          </>
        )}
        <span className="mt-auto flex justify-between gap-3 pt-3 text-xs text-ink-4">
          <span className="truncate">{item.author || "Fetching…"}</span>
          <span className="shrink-0">{item.saved}</span>
        </span>
      </span>
    </button>
  );
}
