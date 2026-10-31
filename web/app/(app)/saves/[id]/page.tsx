import type { Metadata } from "next";
import { SaveDetail } from "@/components/saves/SaveDetail";

type Props = { params: Promise<{ id: string }> };

// The title depends on client-side state until the API exists; swap for a real lookup then.
export const metadata: Metadata = { title: "Save" };

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <SaveDetail id={id} />;
}
