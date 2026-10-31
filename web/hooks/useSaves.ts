"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError, type BackendFolder } from "@/lib/api";
import { adaptItem } from "@/lib/adapt";
import { extractUrl } from "@/lib/utils";
import type { SaveItem } from "@/lib/types";

export interface Toast {
  id: number;
  text: string;
  sub?: string;
}

export type AskState =
  | { mode: "idle" }
  | { mode: "busy"; question: string }
  | { mode: "done"; question: string; ids: string[] };

/**
 * All save state for the dashboard, backed by the real API.
 * Reminders/snooze/archive/to-do scheduling aren't implemented server-side
 * (PRD addendum 2/3 dropped that scope) — those actions only update local
 * state so the UI still works, but nothing persists across a reload.
 */
export function useSaves() {
  const [items, setItems] = useState<SaveItem[]>([]);
  const [folders, setFolders] = useState<BackendFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);
  const [ask, setAsk] = useState<AskState>({ mode: "idle" });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const askSeq = useRef(0);

  const say = useCallback((text: string, sub?: string) => {
    const id = Date.now();
    setToast({ id, text, sub });
    timers.current.push(setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 2600));
  }, []);

  const refresh = useCallback(async () => {
    const [folderRes, itemRes] = await Promise.all([api.listFolders(), api.listItems()]);
    setFolders(folderRes.folders);
    setItems(itemRes.items.map((i) => adaptItem(i, folderRes.folders)));
  }, []);

  useEffect(() => {
    refresh()
      .catch(() => say("Couldn't load your saves", "Check your connection and try again"))
      .finally(() => setLoading(false));
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patch = (id: string, fn: (x: SaveItem) => Partial<SaveItem>) =>
    setItems((list) => list.map((x) => (x.id === id ? { ...x, ...fn(x) } : x)));

  const find = (id: string) => items.find((x) => x.id === id);

  /** POST /api/items { url } — the request stays open until extraction + classification finish. */
  const saveLink = (raw: string): { id?: string; duplicateOf?: string } => {
    const url = extractUrl(raw);
    if (!url) {
      say("That doesn’t look like a link", "Paste the full link to save it");
      return {};
    }

    const dup = items.find((x) => x.key === url);
    if (dup) {
      say(`Already saved on ${dup.savedOn}`, "Opened it on the right");
      return { duplicateOf: dup.id };
    }

    say("Saving…", "Fetching caption and transcript");
    api
      .createItem(url)
      .then(async ({ item, alreadySaved }) => {
        // Folders may have changed (a new one created during classification).
        const folderRes = await api.listFolders();
        setFolders(folderRes.folders);
        const adapted = adaptItem(item, folderRes.folders);
        setItems((list) => (list.some((x) => x.id === adapted.id) ? list.map((x) => (x.id === adapted.id ? adapted : x)) : [adapted, ...list]));
        if (!alreadySaved) {
          say(adapted.status === "review" ? "Needs a look" : `Filed in ${adapted.folder || "Inbox"}`, adapted.title);
        }
      })
      .catch((err) => {
        say("Couldn't save that link", err instanceof ApiError ? err.message : "Try again in a moment");
      });

    return {};
  };

  /** No backend reminder system yet — local-only so the UI still responds. */
  const markDone = (id: string) => {
    patch(id, () => ({ finished: true, due: false, remind: "Done" }));
    say("Marked done", find(id)?.title);
  };

  const snooze = (id: string) => {
    patch(id, () => ({ due: false, remind: "Tomorrow · 9:00 AM" }));
    say("Snoozed until tomorrow", "Reminders aren't wired up server-side yet");
  };

  const archive = (id: string) => {
    patch(id, () => ({ archived: true, due: false }));
    say("Archived", find(id)?.title);
  };

  /** PATCH /api/items/:id { folderIds } */
  const moveTo = (id: string, folder: string) => {
    if (find(id)?.folder === folder) return;
    const target = folders.find((f) => f.name === folder);
    if (!target) return;
    patch(id, (x) => ({ folder, confidence: "you picked", status: x.status === "review" ? "ready" : x.status }));
    say(`Moved to ${folder}`, "Saved");
    api.patchItem(id, { folderIds: [target.id] }).catch(() => say("Couldn't save the move", "Try again"));
  };

  /** PATCH /api/items/:id { actionItems } */
  const toggleAction = (id: string, index: number) => {
    const item = find(id);
    if (!item) return;
    const nextActions = item.actions.map((a, i) => (i === index ? { ...a, done: !a.done } : a));
    patch(id, () => ({ actions: nextActions }));
    api.patchItem(id, { actionItems: nextActions }).catch(() => say("Couldn't save that change", "Try again"));
  };

  /** Simple local keyword match — real search is GET /api/search (plain word match server-side). */
  const askQuestion = (question: string) => {
    const seq = ++askSeq.current;
    setAsk({ mode: "busy", question });
    api
      .search(question)
      .then((res) => {
        if (seq !== askSeq.current) return;
        const ids = res.items.map((i) => i._id).slice(0, 3);
        setAsk({ mode: "done", question, ids });
      })
      .catch(() => {
        if (seq !== askSeq.current) return;
        setAsk({ mode: "done", question, ids: [] });
      });
  };

  const clearAsk = useCallback(() => {
    askSeq.current++;
    setAsk({ mode: "idle" });
  }, []);

  const folderNames = folders.filter((f) => !f.isInbox).map((f) => f.name);

  return {
    items,
    folderNames,
    loading,
    toast,
    ask,
    say,
    saveLink,
    markDone,
    snooze,
    archive,
    moveTo,
    toggleAction,
    askQuestion,
    clearAsk,
  };
}
