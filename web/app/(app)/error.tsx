"use client";

import { Button } from "@/components/ui/primitives";

/** Keeps the sidebar on screen when a page throws, and lets the user retry without a full reload. */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg py-24 text-center">
      <h1 className="font-serif text-5xl leading-none">Something went wrong</h1>
      <p className="mt-4 text-ink-3">This page hit a problem. Your saves are fine. Try again, or go back.</p>
      <div className="mt-6 flex justify-center">
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
