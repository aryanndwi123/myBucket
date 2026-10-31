import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FolderPage } from "@/components/folders/FolderPage";
import { FOLDERS } from "@/lib/data";
import { folderFromSlug, slugify } from "@/lib/folders";

type Props = { params: Promise<{ folder: string }> };

// Categories are a fixed list, so every valid page is built ahead of time and anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return FOLDERS.map((f) => ({ folder: slugify(f) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const folder = folderFromSlug((await params).folder);
  return { title: folder ?? "Not found" };
}

export default async function Page({ params }: Props) {
  const folder = folderFromSlug((await params).folder);
  if (!folder) notFound();
  return <FolderPage folder={folder} />;
}
