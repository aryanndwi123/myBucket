import type { Metadata } from "next";
import { BackendOverview } from "@/components/backend/BackendOverview";

export const metadata: Metadata = { title: "Backend" };

export default function Page() {
  return <BackendOverview />;
}
