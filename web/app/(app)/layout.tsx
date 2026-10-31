import type { ReactNode } from "react";
import { AppRoot } from "@/components/app/AppRoot";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppRoot>{children}</AppRoot>;
}
