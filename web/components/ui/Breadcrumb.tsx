import Link from "next/link";
import { ChevronRightIcon } from "@/components/ui/icons";

export interface Crumb {
  label: string;
  /** Omit on the current page (the last crumb). */
  href?: string;
}

export function Breadcrumb({ trail }: { trail: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-ink-3">
      <ol className="flex flex-wrap items-center gap-x-1">
        {trail.map((crumb, i) => (
          <li key={`${crumb.label}-${i}`} className="flex min-w-0 items-center gap-x-1">
            {i > 0 && <ChevronRightIcon className="size-3.5 shrink-0 text-ink-4" />}
            {crumb.href ? (
              <Link href={crumb.href} className="inline-flex min-h-11 items-center hover:text-ink hover:underline">
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page" className="max-w-[28ch] truncate text-ink sm:max-w-[48ch]">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
