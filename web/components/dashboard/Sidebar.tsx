import { dotFor, tintFor } from "@/lib/data";
import type { FolderName, View } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CloseIcon } from "@/components/ui/icons";
import { Button, Eyebrow } from "@/components/ui/primitives";

export interface SidebarCounts {
  today: number;
  all: number;
  inbox: number;
  folders: Record<string, number>;
}

export interface Recap {
  month: string;
  saved: number;
  used: number;
  topFolders: string[];
}

interface Props {
  view: View;
  folder: FolderName | null;
  folders: string[];
  counts: SidebarCounts;
  recap: Recap;
  /** Mobile drawer state; ignored from `lg` up where the sidebar is always visible. */
  open: boolean;
  onClose: () => void;
  onView: (view: View) => void;
  onFolder: (folder: FolderName) => void;
  onShareRecap: () => void;
}

const NAV: { view: View; label: string; dot: string; count: (c: SidebarCounts) => number }[] = [
  { view: "today", label: "Today", dot: "var(--color-ember)", count: (c) => c.today },
  { view: "all", label: "All saves", dot: "var(--color-ink)", count: (c) => c.all },
  { view: "inbox", label: "Inbox", dot: dotFor("Inbox"), count: (c) => c.inbox },
];

const rowClass = (active: boolean) =>
  cn(
    "flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] transition-colors",
    active ? "bg-sunken font-semibold" : "hover:bg-sunken/60",
  );

export function Sidebar({ view, folder, folders, counts, recap, open, onClose, onView, onFolder, onShareRecap }: Props) {
  return (
    <>
      {open && <div className="fixed inset-0 z-40 animate-fade-in bg-ink/40 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        aria-label="Navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col gap-6 overflow-y-auto border-r border-line bg-paper px-4 py-6",
          "lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-[232px] lg:shrink-0 lg:self-start lg:visible lg:translate-x-0",
          open ? "visible translate-x-0 animate-slide-in-left" : "invisible -translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-[10px] bg-ember font-serif text-xl text-white">S</span>
            <span className="font-serif text-[30px] leading-none">Stashd</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid size-11 place-items-center rounded-full text-ink-3 hover:bg-sunken lg:hidden"
          >
            <CloseIcon />
          </button>
        </div>

        <nav aria-label="Views" className="flex flex-col gap-1">
          {NAV.map((n) => {
            const active = !folder && view === n.view;
            return (
              <button key={n.view} type="button" onClick={() => onView(n.view)} aria-current={active ? "page" : undefined} className={rowClass(active)}>
                <span className="size-2 rounded-full" style={{ background: n.dot }} />
                <span className="flex-1">{n.label}</span>
                <span className="text-sm font-normal text-ink-4 tabular-nums">{n.count(counts)}</span>
              </button>
            );
          })}
        </nav>

        <nav aria-label="Folders" className="flex flex-col gap-1">
          <Eyebrow className="mb-2 px-3">Folders</Eyebrow>
          {folders.map((name) => {
            const active = folder === name;
            return (
              <button key={name} type="button" onClick={() => onFolder(name)} aria-current={active ? "page" : undefined} className={rowClass(active)}>
                <span className="size-6 rounded-md" style={{ background: tintFor(name) }} />
                <span className="flex-1">{name}</span>
                <span className="text-sm font-normal text-ink-4 tabular-nums">{counts.folders[name] ?? 0}</span>
              </button>
            );
          })}
        </nav>

        <section aria-label={`${recap.month} recap`} className="mt-auto rounded-3xl bg-ink p-5 text-on-ink">
          <p className="font-mono text-[11px] tracking-[0.14em] text-ember-soft uppercase">{recap.month} recap</p>
          <p className="mt-3 font-serif text-[28px] leading-[1.05]">
            {recap.saved} saved, <em className="whitespace-nowrap text-ember-soft">{recap.used} used</em>.
          </p>
          <p className="mt-3 text-sm leading-snug text-on-ink-muted">
            {recap.topFolders.length > 0 && <>Mostly {recap.topFolders.join(" and ")}. </>}
            Your best week for actually trying things.
          </p>
          <Button variant="dark-outline" size="sm" className="mt-4" onClick={onShareRecap}>
            Share card
          </Button>
        </section>
      </aside>
    </>
  );
}
