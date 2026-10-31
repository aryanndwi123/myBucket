"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MOCK_RESULTS, SEED_ITEMS } from "@/lib/data";
import { canonicalKey, detectPlatform, extractUrl, mockAsk } from "@/lib/utils";
import type { FolderName, SaveItem } from "@/lib/types";

export interface Toast {
  id: number;
  text: string;
  sub?: string;
}

export type AskState =
  | { mode: "idle" }
  | { mode: "busy"; question: string }
  | { mode: "done"; question: string; ids: string[] };

/** Matches the PRD: a save is archived after its reminder was ignored/snoozed 3 times. */
const MAX_SNOOZES = 3;

/**
 * All save state for the dashboard.
 * Every mutation here maps to one API call in the PRD — swap the bodies for fetch() calls
 * when the backend is ready (see the table in README.md).
 */
export function useSaves() {
  const [items, setItems] = useState<SaveItem[]>(SEED_ITEMS);
  const [toast, setToast] = useState<Toast | null>(null);
  const [ask, setAsk] = useState<AskState>({ mode: "idle" });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const askSeq = useRef(0);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const say = useCallback((text: string, sub?: string) => {
    const id = Date.now();
    setToast({ id, text, sub });
    timers.current.push(setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 2600));
  }, []);

  const patch = (id: string, fn: (x: SaveItem) => Partial<SaveItem>) =>
    setItems((list) => list.map((x) => (x.id === id ? { ...x, ...fn(x) } : x)));

  const find = (id: string) => items.find((x) => x.id === id);

  /**
   * POST /api/items { url }.
   * Real API (PRD addendum 2): the request stays open while the server extracts + classifies,
   * then returns the finished item — no SSE. The mock below fakes those few seconds so the
   * "in-flight" card state can be designed. Returns the new id, or the id of the existing save.
   */
  const saveLink = (raw: string): { id?: string; duplicateOf?: string } => {
    const url = extractUrl(raw);
    if (!url) {
      say("That doesn’t look like a link", "Paste the full link to save it");
      return {};
    }
    const key = canonicalKey(url);
    const dup = items.find((x) => x.key === key);
    if (dup) {
      say(`Already saved on ${dup.savedOn}`, "Opened it on the right");
      return { duplicateOf: dup.id };
    }
    const platform = detectPlatform(key);
    const result = MOCK_RESULTS[platform];
    const id = `n${Date.now()}`;
    const pending: SaveItem = {
      id, key, platform, status: "processing", step: "Fetching caption…",
      title: key, kind: result.kind, author: "", folder: "", tags: [], intent: "", summary: "",
      actions: [], remind: "", why: "", due: false, saved: "just now", savedOn: "today",
      language: "", confidence: "", transcript: "", transcriptEn: "",
    };
    setItems((list) => [pending, ...list]);
    say("Saved", "Categorising in the background");

    const hasAudio = platform === "instagram" || platform === "youtube";
    later(() => patch(id, () => ({ step: hasAudio ? "Transcribing audio…" : "Reading the post…" })), 1000);
    later(() => patch(id, () => ({ step: "Picking a folder…" })), 2000);
    later(() => {
      patch(id, () => ({
        ...result,
        actions: result.actions.map((text) => ({ text, done: false })),
        status: result.folder === "Inbox" ? "review" : "ready",
        step: undefined,
      }));
      say(result.folder === "Inbox" ? "Needs a look" : `Filed in ${result.folder}`, result.title);
    }, 3000);

    return { id };
  };

  /** POST /api/items/:id/reminder { action: "done" } */
  const markDone = (id: string) => {
    patch(id, () => ({ finished: true, due: false, remind: "Done" }));
    say("Marked done", find(id)?.title);
  };

  /** POST /api/items/:id/reminder { action: "snooze" } — the 3rd snooze archives the save. */
  const snooze = (id: string) => {
    const count = (find(id)?.snoozes ?? 0) + 1;
    if (count >= MAX_SNOOZES) {
      patch(id, () => ({ snoozes: count, archived: true, due: false }));
      say("Archived", `Snoozed ${MAX_SNOOZES} times, so it’s out of your way`);
      return;
    }
    patch(id, () => ({ snoozes: count, due: false, remind: "Tomorrow · 9:00 AM", why: "Snoozed — back tomorrow morning" }));
    say("Snoozed until tomorrow", `${MAX_SNOOZES - count} snooze${MAX_SNOOZES - count === 1 ? "" : "s"} left before it archives`);
  };

  /** POST /api/items/:id/reminder { action: "archive" } */
  const archive = (id: string) => {
    patch(id, () => ({ archived: true, due: false }));
    say("Archived", find(id)?.title);
  };

  /** PATCH /api/items/:id { folder } — the server also logs a correction for the classifier. */
  const moveTo = (id: string, folder: FolderName) => {
    if (find(id)?.folder === folder) return;
    patch(id, (x) => ({ folder, confidence: "you picked", status: x.status === "review" ? "ready" : x.status }));
    say(`Moved to ${folder}`, "Stashd will learn from this");
  };

  /** PATCH /api/items/:id { actionItems } */
  const toggleAction = (id: string, index: number) =>
    patch(id, (x) => ({ actions: x.actions.map((a, i) => (i === index ? { ...a, done: !a.done } : a)) }));

  /**
   * POST /api/ask { question }.
   * Ask is deferred in the PRD (search stays simple word match), so this is a keyword stand-in.
   */
  const askQuestion = (question: string) => {
    const seq = ++askSeq.current;
    setAsk({ mode: "busy", question });
    later(() => {
      if (seq !== askSeq.current) return;
      setAsk({ mode: "done", question, ids: mockAsk(items, question) });
    }, 900);
  };

  const clearAsk = useCallback(() => {
    askSeq.current++;
    setAsk({ mode: "idle" });
  }, []);

  return { items, toast, ask, saveLink, markDone, snooze, archive, moveTo, toggleAction, askQuestion, clearAsk };
}
