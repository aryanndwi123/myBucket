import Link from "next/link";
import { FOLDERS, FOLDER_SUBS, FOLDER_TINT } from "@/lib/data";
import { folderHref } from "@/lib/folders";
import { ArrowUpRightIcon } from "@/components/ui/icons";

/** Entry points into each category page. `counts` is saves per category. */
export function CategoryTiles({ counts }: { counts: Record<string, number> }) {
  return (
    <section aria-labelledby="categories-heading" className="mt-10">
      <h2 id="categories-heading" className="font-serif text-4xl leading-none">
        Browse by category
      </h2>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {FOLDERS.map((name) => {
          const n = counts[name] ?? 0;
          return (
            <li key={name}>
              <Link
                href={folderHref(name)}
                className="group flex h-full min-h-28 flex-col justify-between rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ background: FOLDER_TINT[name] }}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="font-serif text-[28px] leading-none">{name}</span>
                  <ArrowUpRightIcon className="size-4 shrink-0 text-ink/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
                <span className="mt-4 text-sm text-ink-2">
                  {n} {n === 1 ? "save" : "saves"} · {FOLDER_SUBS[name].length} topics
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
