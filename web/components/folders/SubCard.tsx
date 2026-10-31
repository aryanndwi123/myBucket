import Link from "next/link";
import { tintFor } from "@/lib/data";
import { topicHref } from "@/lib/folders";
import type { Folder } from "@/lib/types";
import type { Topic } from "@/lib/topics";
import { ArrowUpRightIcon } from "@/components/ui/icons";

/** Entry point into one topic within a folder. */
export function SubCard({ folder, topic }: { folder: Folder; topic: Topic }) {
  return (
    <Link
      href={topicHref(folder.name, topic.slug)}
      className="group flex h-full min-h-28 flex-col justify-between rounded-2xl border border-line bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
      style={{ borderTop: `3px solid ${tintFor(folder.name)}` }}
    >
      <span className="flex items-start justify-between gap-2">
        <span className="text-lg font-semibold leading-snug">{topic.name}</span>
        <ArrowUpRightIcon className="size-4 shrink-0 text-ink/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
      <span className="mt-4 text-sm text-ink-3">
        {topic.saves.length} {topic.saves.length === 1 ? "save" : "saves"}
      </span>
    </Link>
  );
}
