import { TYPE_FILTERS } from "@/lib/data";
import type { TypeFilter } from "@/lib/types";
import { Chip } from "@/components/ui/primitives";

interface Props {
  value: TypeFilter;
  onChange: (value: TypeFilter) => void;
}

/** Horizontal scroller on phones, wrapping row from `sm` up. */
export function TypeFilterBar({ value, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label="Filter by type"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {TYPE_FILTERS.map((t) => (
        <Chip key={t} selected={value === t} onClick={() => onChange(t)}>
          {t}
        </Chip>
      ))}
    </div>
  );
}
