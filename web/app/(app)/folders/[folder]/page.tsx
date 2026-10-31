"use client";

import { useParams } from "next/navigation";
import { folderFromSlug } from "@/lib/folders";
import { useSavesContext } from "@/components/app/SavesProvider";
import { FolderPage } from "@/components/folders/FolderPage";
import { NotFoundState } from "@/components/ui/NotFoundState";
import { PageSkeleton } from "@/components/ui/States";

/** Folders are loaded at runtime (per user), so this resolves the slug against the live list instead of a static map. */
export default function Page() {
  const { folder: slug } = useParams<{ folder: string }>();
  const { folders, state } = useSavesContext();

  if (state === "loading" && folders.length === 0) return <PageSkeleton />;

  const folder = folderFromSlug(folders, slug);
  if (!folder) return <NotFoundState />;

  return <FolderPage folder={folder} />;
}
