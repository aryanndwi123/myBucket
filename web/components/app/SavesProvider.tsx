"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useSaves } from "@/hooks/useSaves";
import { Toast } from "@/components/dashboard/Toast";

type SavesContextValue = ReturnType<typeof useSaves>;

const SavesContext = createContext<SavesContextValue | null>(null);

/**
 * Holds save and folder state above the routes, so moving between a folder, a topic and a save keeps
 * everything (including saves still processing) instead of refetching per page.
 * Also owns the toast, which any route can trigger. Mounted only once there is a session.
 */
export function SavesProvider({ children }: { children: ReactNode }) {
  const saves = useSaves();
  return (
    <SavesContext value={saves}>
      {children}
      <Toast toast={saves.toast} />
    </SavesContext>
  );
}

export function useSavesContext(): SavesContextValue {
  const ctx = useContext(SavesContext);
  if (!ctx) throw new Error("useSavesContext must be used inside <SavesProvider>");
  return ctx;
}
