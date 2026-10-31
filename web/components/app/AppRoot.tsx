"use client";

import type { ReactNode } from "react";
import { AuthGate } from "@/components/auth/AuthGate";
import { AppShell } from "./AppShell";
import { SavesProvider } from "./SavesProvider";

/** Everything behind the login: session → save/folder state → sidebar shell → the page. */
export function AppRoot({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <SavesProvider>
        <AppShell>{children}</AppShell>
      </SavesProvider>
    </AuthGate>
  );
}
