"use client";

import { useEffect, useState } from "react";

/**
 * The current date, available only after mount.
 * Rendering `new Date()` during SSR would differ from the browser's timezone and cause a hydration mismatch,
 * so callers render a neutral placeholder while this is null.
 */
export function useNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  return now;
}
