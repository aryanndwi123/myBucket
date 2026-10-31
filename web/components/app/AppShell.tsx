"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNow } from "@/hooks/useNow";
import { folderFromSlug, saveHref, slugify } from "@/lib/folders";
import { topicsOf } from "@/lib/topics";
import { extractUrl } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthGate";
import { MenuIcon } from "@/components/ui/icons";
import { useSavesContext } from "./SavesProvider";
import { Sidebar, type Recap, type SidebarCounts } from "./Sidebar";

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

/**
 * Sidebar, mobile top bar and global shortcuts around every page of the app:
 * "/" focuses the search box when the page has one, Esc closes the menu,
 * and pasting a link anywhere (outside an input) saves it.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { items, folders, saveLink } = useSavesContext();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const now = useNow();
  const [menuOpen, setMenuOpen] = useState(false);

  const realFolders = useMemo(() => folders.filter((f) => !f.isInbox), [folders]);

  const { counts, recap, activeFolder } = useMemo(() => {
    const byFolder = Object.fromEntries(realFolders.map((f) => [f.name, items.filter((x) => x.folders.includes(f.name))]));
    const counts: SidebarCounts = {
      all: items.length,
      inbox: items.filter((x) => x.folders.includes("Inbox")).length,
      folders: Object.fromEntries(Object.entries(byFolder).map(([n, list]) => [n, list.length])),
    };

    const month = now ? new Date(now.getFullYear(), now.getMonth(), 1).getTime() : 0;
    const actions = items.flatMap((x) => x.actions);
    const recap: Recap = {
      month: now ? now.toLocaleDateString("en-US", { month: "long" }) : "This month",
      saved: items.filter((x) => x.createdAt >= month).length,
      todosDone: actions.filter((a) => a.done).length,
      todosTotal: actions.length,
      topFolders: [...realFolders].sort((a, b) => counts.folders[b.name] - counts.folders[a.name]).filter((f) => counts.folders[f.name] > 0).slice(0, 2).map((f) => f.name),
    };

    const slug = pathname.startsWith("/folders/") ? pathname.split("/")[2] : null;
    const current = slug ? folderFromSlug(realFolders, slug) : null;
    const activeFolder = current
      ? { name: current.name, topics: topicsOf(byFolder[current.name] ?? []).topics.map((t) => ({ slug: t.slug, name: t.name, count: t.saves.length })) }
      : null;
    return { counts, recap, activeFolder };
  }, [items, realFolders, now, pathname]);

  // The drawer is only a mobile affordance; close it whenever the route changes.
  useEffect(() => setMenuOpen(false), [pathname]);

  const pasteHandler = useRef<(text: string) => void>(() => {});
  useEffect(() => {
    pasteHandler.current = (text) => {
      const { duplicateOf } = saveLink(text);
      if (duplicateOf) router.push(saveHref(duplicateOf));
    };
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setMenuOpen(false);
      if (isTyping(e.target) || e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const box = document.getElementById("omnibox");
      if (!box) return;
      e.preventDefault();
      box.focus();
    };
    const onPaste = (e: ClipboardEvent) => {
      if (isTyping(e.target)) return;
      const text = e.clipboardData?.getData("text") ?? "";
      if (!extractUrl(text)) return;
      e.preventDefault();
      pasteHandler.current(text);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("paste", onPaste);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("paste", onPaste);
    };
  }, []);

  return (
    <div className="min-h-screen lg:flex">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:rounded-xl focus:bg-ink focus:px-4 focus:py-3 focus:text-on-ink"
      >
        Skip to content
      </a>

      <Sidebar
        pathname={pathname}
        username={user.username}
        folders={realFolders}
        counts={counts}
        activeFolder={activeFolder}
        recap={recap}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onLogout={logout}
      />

      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-paper/90 px-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="grid size-11 place-items-center rounded-full hover:bg-sunken"
          >
            <MenuIcon />
          </button>
          <span className="font-serif text-2xl">Stashd</span>
        </div>

        <main id="main" className="mx-auto w-full max-w-[1400px] px-4 pt-6 pb-24 sm:px-6 lg:px-10 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
