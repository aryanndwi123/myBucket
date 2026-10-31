import type { Metadata } from "next";
import { RecipesSummary } from "@/components/recipes/RecipesSummary";

export const metadata: Metadata = { title: "Recipes summary" };

export default function Page() {
  return <RecipesSummary />;
}
