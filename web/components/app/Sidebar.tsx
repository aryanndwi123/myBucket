import Link from "next/link";
import { dotFor, tintFor } from "@/lib/data";
import { folderHref, topicHref } from "@/lib/folders";
import type { Folder } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CloseIcon } from "@/components/ui/icons";
import { Button, Eyebrow } from "@/components/ui/primitives";

export interface SidebarCounts {
  all: number;
  inbox: number;
  /** folder name → saves in it */
  folders: Record<string, number>;
}

export interface Recap {
  month: string;
  /** Saves added this month. */
  saved: number;
  todosDone: number;
  todosTotal: number;
  topFolders: string[];
}

export interface SidebarTopic {
  slug: string;
  name: string;
  count: number;
}

interface Props {
  pathname: string;
  username: string;
  /** Real (non-Inbox) folders, in the order the API returns them. */
  folders: Folder[];
  counts: SidebarCounts;
  /** Topics of the folder the user is in, shown nested under it. */
  activeFolder: { name: string; topics: SidebarTopic[] } | null;
  recap: Recap;
  /** Mobile drawer state; ignored from `lg` up where the sidebar is always visible. */
  open: boolean;
  onClose: () => void;
  /** Null while sign-in is automatic. */
  onLogout: (() => void) | null;
}

const NAV = [
  { href: "/", label: "Home", dot: "var(--color-ember)", count: null },
  { href: "/all", label: "All saves", dot: "var(--color-ink)", count: (c: SidebarCounts) => c.all },
  { href: "/inbox", label: "Inbox", dot: dotFor("Inbox"), count: (c: SidebarCounts) => c.inbox },
];

const rowClass = (active: boolean) =>
  cn(
    "flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] transition-colors",
    active ? "bg-sunken font-semibold" : "hover:bg-sunken/60",
  );

export function Sidebar({ pathname, username, folders, counts, activeFolder, recap, open, onClose, onLogout }: Props) {
  return (
    <>
      {open && <div className="fixed inset-0 z-40 animate-fade-in bg-ink/40 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        aria-label="Navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col gap-6 overflow-y-auto border-r border-line bg-paper px-4 py-6",
          "lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-[248px] lg:shrink-0 lg:self-start lg:visible lg:translate-x-0",
          open ? "visible translate-x-0 animate-slide-in-left" : "invisible -translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-1">
          <Link href="/" className="flex items-center gap-3" aria-label="Stashd, home">
            <span className="grid size-9 place-items-center rounded-[10px] bg-ember font-serif text-xl text-white">S</span>
            <span className="font-serif text-[30px] leading-none">Stashd</span>
          </Link>
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
            const active = pathname === n.href;
            return (
              <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined} className={rowClass(active)}>
                <span className="size-2 rounded-full" style={{ background: n.dot }} />
                <span className="flex-1">{n.label}</span>
                {n.count && <span className="text-sm font-normal text-ink-4 tabular-nums">{n.count(counts)}</span>}
              </Link>
            );
          })}
        </nav>

        <nav aria-label="Folders" className="flex flex-col gap-1">
          <Eyebrow className="mb-2 px-3">Folders</Eyebrow>
          {folders.length === 0 && <p className="px-3 text-sm text-ink-4">Folders appear here as Stashd files your saves.</p>}
          {folders.map((f) => {
            const href = folderHref(f.name);
            const here = pathname === href;
            const expanded = activeFolder?.name === f.name && activeFolder.topics.length > 0;
            return (
              <div key={f.id}>
                <Link href={href} aria-current={here ? "page" : undefined} className={rowClass(here)}>
                  <span className="size-6 rounded-md" style={{ background: tintFor(f.name) }} />
                  <span className="flex-1 truncate">{f.name}</span>
                  <span className="text-sm font-normal text-ink-4 tabular-nums">{counts.folders[f.name] ?? 0}</span>
                </Link>
                {expanded && (
                  <ul className="mt-1 mb-1 ml-[22px] flex flex-col gap-0.5 border-l border-line pl-3">
                    {activeFolder.topics.map((t) => {
                      const topicPath = topicHref(f.name, t.slug);
                      const active = pathname === topicPath;
                      return (
                        <li key={t.slug}>
                          <Link
                            href={topicPath}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "flex h-10 items-center gap-2 rounded-lg px-3 text-sm transition-colors sm:h-9",
                              active ? "bg-sunken font-semibold" : "text-ink-3 hover:bg-sunken/60 hover:text-ink",
                            )}
                          >
                            <span className="flex-1 truncate">{t.name}</span>
                            <span className="text-xs text-ink-4 tabular-nums">{t.count}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        <nav aria-label="More pages" className="flex flex-col gap-1">
          <Eyebrow className="mb-2 px-3">More</Eyebrow>
          <Link href="/recipes" aria-current={pathname === "/recipes" ? "page" : undefined} className={rowClass(pathname === "/recipes")}>
            <span className="size-2 rounded-full" style={{ background: dotFor("Recipes") }} />
            <span className="flex-1">Recipes summary</span>
          </Link>
          <Link href="/backend" aria-current={pathname === "/backend" ? "page" : undefined} className={rowClass(pathname === "/backend")}>
            <span className="size-2 rounded-full" style={{ background: "var(--color-ink)" }} />
            <span className="flex-1">Backend</span>
          </Link>
          <Link href="/settings" aria-current={pathname === "/settings" ? "page" : undefined} className={rowClass(pathname === "/settings")}>
            <span className="size-2 rounded-full" style={{ background: "var(--color-ink-4)" }} />
            <span className="flex-1">Settings</span>
          </Link>
        </nav>

        <div className="mt-auto flex flex-col gap-4">
          <section aria-label={`${recap.month} recap`} className="rounded-3xl bg-ink p-5 text-on-ink">
            <p className="font-mono text-[11px] tracking-[0.14em] text-ember-soft uppercase">{recap.month} recap</p>
            <p className="mt-3 font-serif text-[28px] leading-[1.05]">
              {recap.saved} saved
              {recap.todosTotal > 0 && (
                <>
                  , <em className="whitespace-nowrap text-ember-soft">{recap.todosDone} done</em>
                </>
              )}
              .
            </p>
            <p className="mt-3 text-sm leading-snug text-on-ink-muted">
              {recap.todosTotal > 0 && `${recap.todosDone} of ${recap.todosTotal} to-dos ticked off. `}
              {recap.topFolders.length > 0 && <>Mostly {recap.topFolders.join(" and ")}.</>}
            </p>
          </section>

          <div className="flex items-center justify-between gap-2 px-1">
            <p className="min-w-0 truncate text-sm text-ink-3">
              <span className="sr-only">Signed in as </span>
              {username}
            </p>
            {onLogout && (
              <Button variant="ghost" size="sm" onClick={onLogout}>
                Log out
              </Button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
