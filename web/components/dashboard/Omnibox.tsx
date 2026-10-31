import type { FormEvent, KeyboardEvent, RefObject } from "react";
import type { OmniMode } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CloseIcon, LinkIcon, SearchIcon, SparkIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/primitives";

interface Props {
  value: string;
  mode: OmniMode;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

const MODE_LABEL: Record<OmniMode, string> = { idle: "Type or paste", save: "Save link", search: "Search", ask: "Ask" };
const ACTION_LABEL: Record<OmniMode, string> = { idle: "Save", save: "Save", search: "Search", ask: "Ask" };

/** One box for everything: a link saves, words search, a trailing "?" asks. */
export function Omnibox({ value, mode, inputRef, onChange, onSubmit }: Props) {
  const Icon = mode === "save" ? LinkIcon : mode === "ask" ? SparkIcon : SearchIcon;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Escape") return;
    if (value) onChange("");
    else e.currentTarget.blur();
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="mt-8 flex items-center gap-3 rounded-[22px] border border-line-strong bg-card p-2 pl-5 transition-shadow focus-within:border-ink focus-within:ring-4 focus-within:ring-ember-tint"
    >
      <Icon className={cn("size-5 shrink-0", mode === "idle" ? "text-ink-4" : "text-ink")} />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Save a link, search your saves, or ask a question"
        placeholder="Paste a link to save · type to search · end with ? to ask"
        autoComplete="off"
        spellCheck={false}
        className="h-12 min-w-0 flex-1 bg-transparent text-base outline-none sm:text-[17px]"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          aria-label="Clear"
          className="grid size-10 shrink-0 place-items-center rounded-full text-ink-4 hover:bg-sunken hover:text-ink"
        >
          <CloseIcon className="size-4" />
        </button>
      )}
      <span
        className={cn(
          "hidden shrink-0 rounded-lg px-3 py-1.5 font-mono text-[11px] tracking-[0.12em] uppercase sm:inline-block",
          mode === "save" ? "bg-ember-tint text-ember-text" : "bg-sunken text-ink-3",
        )}
      >
        {MODE_LABEL[mode]}
      </span>
      <Button type="submit" variant="ember" size="lg" className="rounded-2xl">
        {ACTION_LABEL[mode]}
      </Button>
    </form>
  );
}
