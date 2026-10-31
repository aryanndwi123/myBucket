import Link from "next/link";
import { FOLDERS, FOLDER_DOT, FOLDER_SUBS, FOLDER_TINT } from "@/lib/data";
import { folderHref, subHref } from "@/lib/folders";
import { cn } from "@/lib/utils";
import { CloseIcon } from "@/components/ui/icons";
import { Button, Eyebrow } from "@/components/ui/primitives";

export interface SidebarCounts {
  today: number;
  all: number;
  inbox: number;
  folders: Record<string, number>;
  /** folder → subcategory → count */
  subs: Record<string, Record<string, number>>;
}

export interface Recap {
  month: string;
  saved: number;
  used: number;
  topFolders: string[];
}

interface Props {
  pathname: string;
  counts: SidebarCounts;
  recap: Recap;
  /** Mobile drawer state; ignored from `lg` up where the sidebar is always visible. */
  open: boolean;
  onClose: () => void;
  onShareRecap: () => void;
}

const NAV = [
  { href: "/", label: "Today", dot: "var(--color-ember)", count: (c: SidebarCounts) => c.today },
  { href: "/all", label: "All saves", dot: "var(--color-ink)", count: (c: SidebarCounts) => c.all },
  { href: "/inbox", label: "Inbox", dot: FOLDER_DOT.Inbox, count: (c: SidebarCounts) => c.inbox },
];

const rowClass = (active: boolean) =>
  cn(
    "flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] transition-colors",
    active ? "bg-sunken font-semibold" : "hover:bg-sunken/60",
  );

export function Sidebar({ pathname, counts, recap, open, onClose, onShareRecap }: Props) {
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
                <span className="text-sm font-normal text-ink-4 tabular-nums">{n.count(counts)}</span>
              </Link>
            );
          })}
        </nav>

        <nav aria-label="Categories" className="flex flex-col gap-1">
          <Eyebrow className="mb-2 px-3">Categories</Eyebrow>
          {FOLDERS.map((name) => {
            const href = folderHref(name);
            const inFolder = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <div key={name}>
                <Link href={href} aria-current={pathname === href ? "page" : undefined} className={rowClass(pathname === href)}>
                  <span className="size-6 rounded-md" style={{ background: FOLDER_TINT[name] }} />
                  <span className="flex-1">{name}</span>
                  <span className="text-sm font-normal text-ink-4 tabular-nums">{counts.folders[name] ?? 0}</span>
                </Link>
                {inFolder && (
                  <ul className="mt-1 mb-1 ml-[22px] flex flex-col gap-0.5 border-l border-line pl-3">
                    {FOLDER_SUBS[name].map((sub) => {
                      const subPath = subHref(name, sub);
                      const active = pathname === subPath;
                      return (
                        <li key={sub}>
                          <Link
                            href={subPath}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "flex h-10 items-center gap-2 rounded-lg px-3 text-sm transition-colors sm:h-9",
                              active ? "bg-sunken font-semibold" : "text-ink-3 hover:bg-sunken/60 hover:text-ink",
                            )}
                          >
                            <span className="flex-1 truncate">{sub}</span>
                            <span className="text-xs text-ink-4 tabular-nums">{counts.subs[name]?.[sub] ?? 0}</span>
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
            <span className="size-2 rounded-full" style={{ background: FOLDER_DOT.Recipes }} />
            <span className="flex-1">Recipes summary</span>
          </Link>
          <Link href="/backend" aria-current={pathname === "/backend" ? "page" : undefined} className={rowClass(pathname === "/backend")}>
            <span className="size-2 rounded-full" style={{ background: "var(--color-ink)" }} />
            <span className="flex-1">Backend</span>
          </Link>
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
