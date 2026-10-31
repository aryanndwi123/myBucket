import Link from "next/link";
import type { AskState } from "@/hooks/useSaves";
import { dotFor } from "@/lib/data";
import type { SaveItem } from "@/lib/types";
import { Eyebrow, Spinner } from "@/components/ui/primitives";

interface Props {
  state: AskState;
  items: SaveItem[];
}

/** Answer card for "ask" mode. The answer is built from keyword matches until POST /api/ask exists. */
export function AskAnswer({ state, items }: Props) {
  if (state.mode === "idle") return null;

  const cited = state.mode === "done" ? state.ids.map((id) => items.find((x) => x.id === id)).filter((x): x is SaveItem => !!x) : [];

  return (
    <section aria-label="Answer" className="mt-8 animate-rise rounded-3xl border border-line bg-card p-6">
      <Eyebrow>Ask my saves</Eyebrow>
      <p className="mt-2 font-serif text-2xl italic sm:text-3xl">{state.question}</p>

      {state.mode === "busy" ? (
        <p className="mt-4 flex items-center gap-3 text-ink-3">
          <Spinner /> Looking through your saves…
        </p>
      ) : cited.length === 0 ? (
        <p className="mt-4 text-ink-2">I couldn’t find a save that matches that. Try different words, or search by folder.</p>
      ) : (
        <>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-2">
            {cited.length === 1 ? "I found one save that fits." : `I found ${cited.length} saves that fit. The closest is number 1.`}
          </p>
          <ol className="mt-4 flex flex-col gap-2">
            {cited.map((item, i) => (
              <li key={item.id}>
                <Link
                  href={saveHref(item.id)}
                  className="flex min-h-14 w-full items-center gap-4 rounded-2xl border border-line bg-paper px-4 py-2 text-left transition-colors hover:border-line-strong hover:bg-sunken"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink font-mono text-xs text-on-ink">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{item.title}</span>
                    <span className="block text-xs text-ink-4">
                      {item.folder} · saved {item.saved}
                    </span>
                  </span>
<<<<<<< HEAD
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: FOLDER_DOT[item.folder] }} />
                </Link>
=======
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: dotFor(item.folder) }} />
                </button>
>>>>>>> c2d9ecc6e9e30d2816a5139f627a83387a5537c0
              </li>
            ))}
          </ol>
        </>
      )}
      <p className="mt-4 font-mono text-[11px] text-ink-4">Preview · matched on keywords, not an AI answer yet</p>
    </section>
  );
}
