"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNow } from "@/hooks/useNow";
import { FOLDERS, FOLDER_SUBS } from "@/lib/data";
import { saveHref } from "@/lib/folders";
import { extractUrl } from "@/lib/utils";
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
  const { items, say, saveLink } = useSavesContext();
  const pathname = usePathname();
  const router = useRouter();
  const now = useNow();
  const [menuOpen, setMenuOpen] = useState(false);

  const { counts, recap } = useMemo(() => {
    const live = items.filter((x) => !x.archived);
    const folders = Object.fromEntries(FOLDERS.map((f) => [f, live.filter((x) => x.folder === f).length]));
    const subs = Object.fromEntries(
      FOLDERS.map((f) => [f, Object.fromEntries(FOLDER_SUBS[f].map((s) => [s, live.filter((x) => x.folder === f && x.subcategory === s).length]))]),
    );
    const counts: SidebarCounts = {
      today: live.filter((x) => x.due && !x.finished).length,
      all: live.length,
      inbox: live.filter((x) => x.folder === "Inbox").length,
      folders,
      subs,
    };
    const recap: Recap = {
      month: now ? now.toLocaleDateString("en-US", { month: "long" }) : "This month",
      saved: live.length,
      used: live.filter((x) => x.finished).length,
      topFolders: [...FOLDERS].sort((a, b) => folders[b] - folders[a]).filter((f) => folders[f] > 0).slice(0, 2),
    };
    return { counts, recap };
  }, [items, now]);

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
        counts={counts}
        recap={recap}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onShareRecap={() => say("Recap card", "Sharing is coming soon")}
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
