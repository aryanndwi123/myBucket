"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { adaptItem, pendingItem, toFolder } from "@/lib/adapt";
import { api, ApiError } from "@/lib/api";
import type { Folder, SaveItem } from "@/lib/types";
import { canonicalKey, detectPlatform, extractUrl, newestFirst } from "@/lib/utils";

export interface Toast {
  id: number;
  text: string;
  sub?: string;
}

export type AskState =
  | { mode: "idle" }
  | { mode: "busy"; question: string }
  | { mode: "done"; question: string; items: SaveItem[] };

export type LoadState = "loading" | "ready" | "error";

/** How often to re-check saves the server is still processing (e.g. after a page reload mid-save). */
const POLL_MS = 4000;

const messageOf = (err: unknown, fallback: string) => (err instanceof ApiError ? err.message : fallback);

/**
 * All save and folder state, backed by the API. Mutations update the screen first and roll back if the
 * request fails. Reminders, snooze and archive have no endpoint, so they are not offered.
 */
export function useSaves() {
  const [items, setItems] = useState<SaveItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);
  const [ask, setAsk] = useState<AskState>({ mode: "idle" });
  /** Local placeholder id → real id, so a page opened on a placeholder can move to the saved item. */
  const [aliases, setAliases] = useState<Record<string, string>>({});

  // Async callbacks read the latest values through refs instead of stale closures.
  const itemsRef = useRef(items);
  const foldersRef = useRef(folders);
  itemsRef.current = items;
  foldersRef.current = folders;

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const askSeq = useRef(0);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const say = useCallback((text: string, sub?: string) => {
    const id = Date.now();
    setToast({ id, text, sub });
    timers.current.push(setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 3200));
  }, []);

  const patch = (id: string, fn: (x: SaveItem) => Partial<SaveItem>) => setItems((list) => list.map((x) => (x.id === id ? { ...x, ...fn(x) } : x)));
  const find = (id: string) => itemsRef.current.find((x) => x.id === id);
  const setFolderList = (next: Folder[]) => {
    foldersRef.current = next;
    setFolders(next);
  };

  // ---- loading ------------------------------------------------------------------------
  /** GET /api/folders + GET /api/items. Keeps saves that are still being created locally. */
  const load = useCallback(async () => {
    const [folderRes, itemRes] = await Promise.all([api.listFolders(), api.listItems()]);
    const nextFolders = folderRes.folders.map(toFolder);
    setFolderList(nextFolders);
    setItems((prev) => {
      const picked = new Set(prev.filter((x) => x.confidence === "you picked").map((x) => x.id));
      const fresh = itemRes.items.map((i) => {
        const adapted = adaptItem(i, nextFolders);
        return picked.has(adapted.id) ? { ...adapted, confidence: "you picked" } : adapted;
      });
      return [...prev.filter((x) => x.pending), ...fresh];
    });
  }, []);

  const reload = useCallback(async () => {
    setState("loading");
    try {
      await load();
      setState("ready");
    } catch (err) {
      setLoadError(messageOf(err, "Something went wrong loading your saves."));
      setState("error");
    }
  }, [load]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const waiting = items.some((x) => x.status === "processing" && !x.pending);
  useEffect(() => {
    if (!waiting) return;
    const t = setInterval(() => void load().catch(() => {}), POLL_MS);
    return () => clearInterval(t);
  }, [waiting, load]);

  /** GET /api/items/:id for a save that isn't in the loaded list (older than the list's 100, or a shared link). */
  const fetchItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { item } = await api.getItem(id);
      const adapted = adaptItem(item, foldersRef.current);
      setItems((list) => (list.some((x) => x.id === adapted.id) ? list : [...list, adapted].sort(newestFirst)));
      return true;
    } catch {
      return false;
    }
  }, []);

  // ---- saving -------------------------------------------------------------------------
  /**
   * POST /api/items { url }. The request stays open while the server extracts and classifies, so a
   * placeholder card shows straight away and is replaced by the finished item (or removed on failure).
   */
  const saveLink = (raw: string): { id?: string; duplicateOf?: string } => {
    const url = extractUrl(raw);
    if (!url) {
      say("That doesn’t look like a link", "Paste the full link to save it");
      return {};
    }

    const key = canonicalKey(url);
    const dup = itemsRef.current.find((x) => canonicalKey(x.url) === key);
    if (dup) {
      say(dup.pending ? "Already saving that one" : `Already saved on ${dup.savedOn}`, "Opening it now");
      return { duplicateOf: dup.id };
    }

    const platform = detectPlatform(url);
    if (!platform) {
      say("Not supported yet", "Stashd saves Instagram reels and X posts for now");
      return {};
    }

    const tempId = `pending-${Date.now()}`;
    setItems((list) => [pendingItem(tempId, url, platform), ...list]);
    say("Saving…", "This takes a few seconds");

    api
      .createItem(url)
      .then(async ({ item, alreadySaved }) => {
        // The classifier may have created a folder for this save.
        let known = foldersRef.current;
        try {
          known = (await api.listFolders()).folders.map(toFolder);
          setFolderList(known);
        } catch {
          // Keep the folders we have; the next reload picks the new one up.
        }
        const adapted = adaptItem(item, known);
        setItems((list) => [adapted, ...list.filter((x) => x.id !== tempId && x.id !== adapted.id)]);
        setAliases((a) => ({ ...a, [tempId]: adapted.id }));

        if (alreadySaved) say("Already saved", adapted.title);
        else if (adapted.status === "unavailable") say("Couldn’t read that link", adapted.error);
        else say(adapted.status === "review" ? "Needs a look" : `Filed in ${adapted.folder}`, adapted.title);
      })
      .catch((err) => {
        setItems((list) => list.filter((x) => x.id !== tempId));
        say("Couldn’t save that link", messageOf(err, "Try again in a moment"));
      });

    return { id: tempId };
  };

  /** POST /api/items/:id/retry, for a save whose extraction failed. */
  const retry = async (id: string) => {
    patch(id, () => ({ status: "processing", step: "Trying again…", error: undefined }));
    try {
      const { item } = await api.retryItem(id);
      const adapted = adaptItem(item, foldersRef.current);
      setItems((list) => list.map((x) => (x.id === id ? adapted : x)));
      if (adapted.status === "unavailable") say("Still couldn’t read it", adapted.error);
      else say(`Filed in ${adapted.folder}`, adapted.title);
    } catch (err) {
      patch(id, () => ({ status: "unavailable", step: undefined, error: messageOf(err, "We couldn’t read this link.") }));
      say("Couldn’t retry", messageOf(err, "Try again in a moment"));
    }
  };

  // ---- editing ------------------------------------------------------------------------
  /** DELETE /api/items/:id. */
  const remove = async (id: string): Promise<boolean> => {
    const prev = find(id);
    if (!prev || prev.pending) return false;
    setItems((list) => list.filter((x) => x.id !== id));
    try {
      await api.deleteItem(id);
      say("Deleted", prev.title);
      return true;
    } catch (err) {
      setItems((list) => [prev, ...list].sort(newestFirst));
      say("Couldn’t delete that save", messageOf(err, "Try again"));
      return false;
    }
  };

  /**
   * PATCH /api/items/:id { folderIds }. Adds the save to a folder, or takes it out of one.
   * It always keeps at least one folder, and filing into a real folder takes it out of the Inbox.
   */
  const toggleFolder = (id: string, name: string) => {
    const item = find(id);
    const target = foldersRef.current.find((f) => f.name === name && !f.isInbox);
    if (!item || !target || item.pending) return;

    const real = item.folders.filter((n) => foldersRef.current.some((f) => f.name === n && !f.isInbox));
    const next = real.includes(name) ? real.filter((n) => n !== name) : [...real, name];
    if (next.length === 0) {
      say("Keep at least one folder", "Pick another folder first, then remove this one");
      return;
    }

    const before = { folders: item.folders, folder: item.folder, status: item.status, confidence: item.confidence };
    patch(id, (x) => ({ folders: next, folder: next[0], confidence: "you picked", status: x.status === "review" ? "ready" : x.status }));

    const folderIds = next.map((n) => foldersRef.current.find((f) => f.name === n)!.id);
    api
      .patchItem(id, { folderIds })
      .then(() => say(real.includes(name) ? `Removed from ${name}` : `Filed in ${name}`, "Saved"))
      .catch((err) => {
        patch(id, () => before);
        say("Couldn’t save that change", messageOf(err, "Try again"));
      });
  };

  /** PATCH /api/items/:id { title }. */
  const rename = (id: string, title: string) => {
    const item = find(id);
    const next = title.trim();
    if (!item || item.pending || !next || next === item.title) return;
    patch(id, () => ({ title: next }));
    api.patchItem(id, { title: next }).catch((err) => {
      patch(id, () => ({ title: item.title }));
      say("Couldn’t rename that save", messageOf(err, "Try again"));
    });
  };

  /** PATCH /api/items/:id { actionItems }. */
  const toggleAction = (id: string, index: number) => {
    const item = find(id);
    if (!item || item.pending) return;
    const before = item.actions;
    const next = before.map((a, i) => (i === index ? { ...a, done: !a.done } : a));
    patch(id, () => ({ actions: next }));
    api.patchItem(id, { actionItems: next }).catch((err) => {
      patch(id, () => ({ actions: before }));
      say("Couldn’t save that change", messageOf(err, "Try again"));
    });
  };

  // ---- search -------------------------------------------------------------------------
  /** GET /api/search?q=. Word match over title, text and tags, including saves beyond the loaded list. */
  const search = useCallback(async (q: string): Promise<SaveItem[]> => {
    const { items: found } = await api.search(q);
    return found.map((i) => adaptItem(i, foldersRef.current));
  }, []);

  /** Ask is a keyword search for now (the PRD defers the AI answer), so the answer card says so. */
  const askQuestion = (question: string) => {
    const seq = ++askSeq.current;
    setAsk({ mode: "busy", question });
    search(question)
      .then((found) => {
        if (seq === askSeq.current) setAsk({ mode: "done", question, items: found.slice(0, 3) });
      })
      .catch(() => {
        if (seq === askSeq.current) setAsk({ mode: "done", question, items: [] });
      });
  };

  const clearAsk = useCallback(() => {
    askSeq.current++;
    setAsk({ mode: "idle" });
  }, []);

  return {
    items,
    folders,
    state,
    loadError,
    aliases,
    toast,
    ask,
    say,
    reload,
    fetchItem,
    saveLink,
    retry,
    remove,
    toggleFolder,
    rename,
    toggleAction,
    search,
    askQuestion,
    clearAsk,
  };
}
