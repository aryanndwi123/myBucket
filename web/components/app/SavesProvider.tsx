"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useSaves } from "@/hooks/useSaves";
import { Toast } from "@/components/dashboard/Toast";

type SavesContextValue = ReturnType<typeof useSaves>;

const SavesContext = createContext<SavesContextValue | null>(null);

/**
 * Holds save state above the routes, so moving between a category, a subcategory and a save
 * keeps everything (including saves still processing) instead of resetting per page.
 * Also owns the toast, which any route can trigger.
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
