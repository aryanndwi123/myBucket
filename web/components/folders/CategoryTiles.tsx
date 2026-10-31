import Link from "next/link";
import { tintFor } from "@/lib/data";
import { folderHref } from "@/lib/folders";
import type { Folder } from "@/lib/types";
import { ArrowUpRightIcon } from "@/components/ui/icons";

/** Entry points into each folder page. `counts` is saves per folder name. */
export function CategoryTiles({ folders, counts }: { folders: Folder[]; counts: Record<string, number> }) {
  return (
    <section aria-labelledby="categories-heading" className="mt-10">
      <h2 id="categories-heading" className="font-serif text-4xl leading-none">
        Browse by folder
      </h2>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {folders.map((f) => {
          const n = counts[f.name] ?? 0;
          return (
            <li key={f.id}>
              <Link
                href={folderHref(f.name)}
                className="group flex h-full min-h-28 flex-col justify-between rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ background: tintFor(f.name) }}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="font-serif text-[28px] leading-none">{f.name}</span>
                  <ArrowUpRightIcon className="size-4 shrink-0 text-ink/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
                <span className="mt-4 text-sm text-ink-2">
                  {n} {n === 1 ? "save" : "saves"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
