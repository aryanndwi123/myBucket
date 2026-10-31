"use client";

import { AuthGate } from "@/components/auth/AuthGate";
import { Dashboard } from "@/components/dashboard/Dashboard";

export default function Page() {
  return <AuthGate>{(user) => <Dashboard username={user.username} />}</AuthGate>;
}
