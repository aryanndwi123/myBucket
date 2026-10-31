import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard/Dashboard";

export const metadata: Metadata = { title: "All saves" };

export default function Page() {
  return <Dashboard view="all" />;
}
