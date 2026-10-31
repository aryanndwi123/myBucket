import { FOLDER_DOT } from "@/lib/data";
import type { SaveItem } from "@/lib/types";
import { Button } from "@/components/ui/primitives";

interface Props {
  items: SaveItem[];
  /** Empty-state copy only makes sense when no type filter is hiding items. */
  showEmpty: boolean;
  onOpen: (id: string) => void;
  onDone: (id: string) => void;
  onSnooze: (id: string) => void;
}

/** Due reminders, capped at 3 a day. Each one is a single decision: Done or Tomorrow. */
export function TodayRow({ items, showEmpty, onOpen, onDone, onSnooze }: Props) {
  if (items.length === 0 && !showEmpty) return null;

  return (
    <section aria-labelledby="today-heading" className="mt-10">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 id="today-heading" className="font-serif text-4xl leading-none">
          Today
        </h2>
        <p className="text-sm text-ink-3">Max 3 a day · ignored 3 times and it archives itself</p>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 rounded-3xl border border-dashed border-line-strong px-6 py-8 text-ink-3">
          You’re all caught up. Nothing is due today.
        </p>
      ) : (
        <ul className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(260px,300px))] gap-4">
          {items.map((item) => (
            <li key={item.id} className="relative animate-rise rounded-3xl border border-line bg-card py-5 pr-5 pl-7">
              <span
                aria-hidden="true"
                className="absolute top-4 bottom-4 left-3.5 w-1 rounded-full"
                style={{ background: FOLDER_DOT[item.folder] }}
              />
              <p className="font-mono text-xs text-ember-text">
                {item.intent.toUpperCase()} · {item.remind}
              </p>
              <button
                type="button"
                onClick={() => onOpen(item.id)}
                className="mt-2 text-left text-[17px] leading-snug font-semibold hover:underline"
              >
                {item.title}
              </button>
              <p className="mt-2 text-sm leading-snug text-ink-3">{item.why}</p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" onClick={() => onDone(item.id)}>
                  Done
                </Button>
                <Button size="sm" variant="outline" onClick={() => onSnooze(item.id)}>
                  Tomorrow
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
