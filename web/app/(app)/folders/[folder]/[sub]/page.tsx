"use client";

import { useParams } from "next/navigation";
import { folderFromSlug } from "@/lib/folders";
import { topicBySlug } from "@/lib/topics";
import { useSavesContext } from "@/components/app/SavesProvider";
import { SubfolderPage } from "@/components/folders/SubfolderPage";
import { NotFoundState } from "@/components/ui/NotFoundState";
import { PageSkeleton } from "@/components/ui/States";

export default function Page() {
  const { folder: folderSlug, sub } = useParams<{ folder: string; sub: string }>();
  const { items, folders, state } = useSavesContext();

  if (state === "loading" && folders.length === 0) return <PageSkeleton />;

  const folder = folderFromSlug(folders, folderSlug);
  if (!folder) return <NotFoundState />;

  const saves = items.filter((x) => x.folders.includes(folder.name));
  const topic = topicBySlug(saves, sub);
  if (!topic) return <NotFoundState />;

  return <SubfolderPage folder={folder} topic={topic} />;
}
