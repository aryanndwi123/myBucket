import type { Toast as ToastData } from "@/hooks/useSaves";
import { CheckIcon } from "@/components/ui/icons";

/** The live region stays mounted so screen readers announce each new message. */
export function Toast({ toast }: { toast: ToastData | null }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4"
    >
      {toast && (
        <div key={toast.id} className="flex max-w-md animate-toast items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-on-ink shadow-xl">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ember text-white">
            <CheckIcon className="size-3.5" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium">{toast.text}</span>
            {toast.sub && <span className="block truncate text-xs text-on-ink-muted">{toast.sub}</span>}
          </span>
        </div>
      )}
    </div>
  );
}
