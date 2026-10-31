import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard/Dashboard";

export const metadata: Metadata = { title: "Inbox" };

export default function Page() {
  return <Dashboard view="inbox" />;
}
