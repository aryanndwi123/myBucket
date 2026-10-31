import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "./icons";

type ButtonVariant = "ink" | "ember" | "outline" | "light" | "dark-outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const BUTTON_VARIANT: Record<ButtonVariant, string> = {
  ink: "bg-ink text-on-ink hover:bg-ink-2",
  ember: "bg-ember text-white hover:bg-ember-text",
  outline: "border border-line-strong bg-card text-ink hover:bg-sunken",
  light: "bg-on-ink text-ink hover:bg-white",
  "dark-outline": "border border-ink-border text-on-ink hover:bg-ink-2",
  ghost: "text-ink-3 hover:bg-sunken hover:text-ink",
};

// 44px touch targets on mobile, tighter from `sm` up.
const BUTTON_SIZE: Record<ButtonSize, string> = {
  sm: "h-11 px-4 text-sm sm:h-9",
  md: "h-11 px-5 text-[15px]",
  lg: "h-12 px-6 text-base",
};

/** Button styling as a class string, so links can look like buttons (`<Link className={buttonClass()}>`). */
export const buttonClass = (variant: ButtonVariant = "ink", size: ButtonSize = "md", className?: string) =>
  cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50",
    BUTTON_VARIANT[variant],
    BUTTON_SIZE[size],
    className,
  );

export function Button({
  variant = "ink",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}

export function LinkButton({
  variant = "ink",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

const chipClass = (selected?: boolean, className?: string) =>
  cn(
    "inline-flex h-11 shrink-0 items-center rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors sm:h-9",
    selected ? "border-ink bg-ink text-on-ink" : "border-line-strong bg-card text-ink hover:bg-sunken",
    className,
  );

/** A toggle: a filter or a choice on the current page. */
export function Chip({
  selected,
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return <button type={type} aria-pressed={selected} className={chipClass(selected, className)} {...props} />;
}

/** Navigation that looks like a chip. `selected` marks the current page. */
export function ChipLink({ selected, className, ...props }: ComponentProps<typeof Link> & { selected?: boolean }) {
  return <Link aria-current={selected ? "page" : undefined} className={chipClass(selected, className)} {...props} />;
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="rounded-md bg-sunken px-2 py-0.5 text-xs text-ink-3">#{children}</span>;
}

/** Small mono label used above headings and in metadata rows. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("font-mono text-[11px] tracking-[0.14em] text-ink-4 uppercase", className)}>{children}</p>;
}

export function Checkbox({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className="flex min-h-11 w-full items-center gap-3 border-b border-line py-2 text-left"
    >
      <span
        className={cn(
          "grid size-[22px] shrink-0 place-items-center rounded-md border-2 border-ink transition-colors",
          checked ? "bg-ink text-on-ink" : "bg-card",
        )}
      >
        {checked && <CheckIcon className="size-3.5" />}
      </span>
      <span className={cn("text-[15px]", checked && "text-ink-4 line-through")}>{children}</span>
    </button>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="presentation"
      className={cn("inline-block size-4 animate-spin rounded-full border-2 border-ink-4/30 border-t-ember", className)}
    />
  );
}

export function ProgressBar({ value, max, label, className }: { value: number; max: number; label: string; className?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-sunken", className)}
    >
      <div className="h-full rounded-full bg-ink transition-[width] duration-300" style={{ width: `${pct}%` }} />
    </div>
  );
}
