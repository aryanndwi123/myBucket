import { useEffect, useRef } from "react";
import { FOLDERS, FOLDER_TINT } from "@/lib/data";
import type { FolderName, SaveItem } from "@/lib/types";
import { kindLabel } from "@/lib/utils";
import { ArrowUpRightIcon, CloseIcon } from "@/components/ui/icons";
import { Button, Checkbox, Chip, Spinner, Tag } from "@/components/ui/primitives";

interface Props {
  item: SaveItem;
  onClose: () => void;
  onToggleAction: (index: number) => void;
  onMove: (folder: FolderName) => void;
  onDone: () => void;
  onSnooze: () => void;
  onArchive: () => void;
}

/** Folder-line copy: say how sure the AI was, so moving a save feels like teaching, not fixing. */
function folderNote(item: SaveItem) {
  if (item.confidence === "you picked") return "Folder · You picked this one. Stashd will remember.";
  if (item.folder === "Inbox") return `Folder · Not sure about this one (${item.confidence}). Pick where it belongs.`;
  return `Folder · AI picked, ${item.confidence} sure. Wrong? One click — we learn from it.`;
}

/**
 * Right-hand details. A sticky column from `xl` up; a full-height sheet on smaller screens
 * (the Dashboard renders the backdrop).
 */
export function DetailPanel({ item, onClose, onToggleAction, onMove, onDone, onSnooze, onArchive }: Props) {
  const ref = useRef<HTMLElement>(null);

  // Move focus into the panel when a different save opens, so keyboard users land on it.
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, [item.id]);

  const processing = item.status === "processing";
  const hasReminder = !processing && item.remind !== "" && item.remind !== "No reminder yet";
  const doneCount = item.actions.filter((a) => a.done).length;

  return (
    <aside
      ref={ref}
      tabIndex={-1}
      aria-label="Save details"
      className="fixed inset-y-0 right-0 z-40 w-full max-w-[420px] animate-slide-in overflow-y-auto overscroll-contain bg-card shadow-2xl outline-none xl:sticky xl:top-6 xl:z-auto xl:max-h-[calc(100vh-3rem)] xl:w-[340px] xl:max-w-none xl:shrink-0 xl:self-start xl:rounded-[28px] xl:border xl:border-line xl:shadow-none"
    >
      <div className="relative h-[150px]" style={{ background: processing ? "var(--color-sunken)" : FOLDER_TINT[item.folder] }}>
        <span className="absolute top-4 left-4 rounded-md bg-white/85 px-2 py-1 font-mono text-[11px] leading-none">{kindLabel(item)}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="absolute top-3 right-3 grid size-11 place-items-center rounded-full bg-white hover:bg-paper"
        >
          <CloseIcon className="size-4" />
        </button>
        {!processing && <span className="absolute bottom-3 left-5 font-serif text-5xl leading-none text-ink/85 italic">{item.folder}</span>}
      </div>

      <div className="p-6">
        {processing ? (
          <>
            <p className="font-mono text-sm break-all text-ink-3">{item.title}</p>
            <p className="mt-4 flex items-center gap-3 font-medium">
              <Spinner /> <span className="animate-pulse-soft">{item.step}</span>
            </p>
            <p className="mt-2 text-sm text-ink-3">It’s saved. You can close this — the card fills in when it’s done.</p>
          </>
        ) : (
          <>
            <p className="text-[13px] text-ink-3">{[item.author, `saved ${item.saved}`, item.intent].filter(Boolean).join(" · ")}</p>
            <h2 className="mt-2 font-serif text-[32px] leading-[1.05]">{item.title}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{item.summary}</p>
            {item.tags.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <li key={tag}>
                    <Tag>{tag}</Tag>
                  </li>
                ))}
              </ul>
            )}

            <section aria-label="Reminder" className="mt-5 rounded-3xl bg-ink p-4 text-on-ink">
              {item.finished ? (
                <p className="font-semibold">Marked done. Nice one.</p>
              ) : hasReminder ? (
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[17px] font-semibold">{item.remind}</p>
                    <p className="mt-1 text-sm leading-snug text-on-ink-muted">{item.why}</p>
                    <Button variant="dark-outline" size="sm" className="mt-3" onClick={onSnooze}>
                      Snooze
                    </Button>
                  </div>
                  <Button variant="light" size="sm" onClick={onDone}>
                    Done
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="font-semibold">No reminder yet</p>
                  <p className="mt-1 text-sm text-on-ink-muted">{item.why}</p>
                </div>
              )}
            </section>

            {item.actions.length > 0 && (
              <section aria-labelledby="todos-heading" className="mt-6">
                <div className="flex items-baseline justify-between">
                  <h3 id="todos-heading" className="font-serif text-2xl">
                    To-dos
                  </h3>
                  <span className="text-sm text-ink-3">
                    {doneCount} of {item.actions.length} done
                  </span>
                </div>
                <div role="group" aria-labelledby="todos-heading" className="mt-2">
                  {item.actions.map((action, i) => (
                    <Checkbox key={i} checked={action.done} onChange={() => onToggleAction(i)}>
                      {action.text}
                    </Checkbox>
                  ))}
                </div>
              </section>
            )}

            <section aria-label="Folder" className="mt-4">
              <p className="text-[13px] leading-snug text-ink-3">{folderNote(item)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {FOLDERS.map((name) => (
                  <Chip key={name} selected={item.folder === name} onClick={() => onMove(name)}>
                    {name}
                  </Chip>
                ))}
              </div>
            </section>

            <section aria-label="Transcript" className="mt-6 border-t border-line pt-5">
              <p className="text-[13px] text-ink-3">Transcript · {item.language}</p>
              <p className="mt-2 text-[15px] leading-relaxed">{item.transcript}</p>
              {item.transcriptEn && item.transcriptEn !== item.transcript && (
                <p className="mt-3 text-sm leading-relaxed text-ink-3 italic">{item.transcriptEn}</p>
              )}
            </section>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
              <a
                href={`https://${item.key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-ink-3 hover:text-ink"
              >
                Open original <ArrowUpRightIcon className="size-4" />
              </a>
              <Button variant="ghost" size="sm" onClick={onArchive}>
                Archive
              </Button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
