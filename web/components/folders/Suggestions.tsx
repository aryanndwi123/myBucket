import type { Suggestion } from "@/lib/data";
import { SparkIcon } from "@/components/ui/icons";
import { Eyebrow } from "@/components/ui/primitives";

export type LabelledSuggestion = Suggestion & { label?: string };

interface Props {
  title: string;
  /** One line on why these are shown, e.g. "Based on your 2 saves in Breakfast". */
  basis: string;
  items: LabelledSuggestion[];
}

/**
 * Related content the LLM suggests for a subcategory.
 * Dashed cards keep these visibly apart from the user's own saves.
 */
export function Suggestions({ title, basis, items }: Props) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="suggest-heading" className="mt-12">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="suggest-heading" className="font-serif text-3xl leading-none">
          {title}
        </h2>
        <Eyebrow className="flex items-center gap-1.5">
          <SparkIcon className="size-3.5" /> Suggested by AI · sample
        </Eyebrow>
      </div>
      <p className="mt-2 text-sm text-ink-3">{basis}</p>
      <ul className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
        {items.map((s) => (
          <li key={s.title} className="flex animate-rise flex-col rounded-[22px] border border-dashed border-line-strong bg-card/60 p-4">
            {s.label && <p className="mb-2 font-mono text-[11px] tracking-[0.12em] text-ember-text uppercase">{s.label}</p>}
            <p className="text-[15px] leading-snug font-semibold">{s.title}</p>
            <p className="mt-1.5 text-sm leading-snug text-ink-3">{s.why}</p>
            <p className="mt-auto pt-3 text-xs text-ink-4">
              {s.by} · {s.kind}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
