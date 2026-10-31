import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SubfolderPage } from "@/components/folders/SubfolderPage";
import { FOLDERS, FOLDER_SUBS } from "@/lib/data";
import { folderFromSlug, slugify, subFromSlug } from "@/lib/folders";

type Props = { params: Promise<{ folder: string; sub: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return FOLDERS.flatMap((f) => [...FOLDER_SUBS[f].map(slugify), "unsorted"].map((sub) => ({ folder: slugify(f), sub })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { folder: folderSlug, sub: subSlug } = await params;
  const folder = folderFromSlug(folderSlug);
  const sub = folder ? subFromSlug(folder, subSlug) : null;
  return { title: folder && sub !== null ? `${sub || "Unsorted"} · ${folder}` : "Not found" };
}

export default async function Page({ params }: Props) {
  const { folder: folderSlug, sub: subSlug } = await params;
  const folder = folderFromSlug(folderSlug);
  const sub = folder ? subFromSlug(folder, subSlug) : null;
  if (!folder || sub === null) notFound();
  return <SubfolderPage folder={folder} sub={sub} />;
}
