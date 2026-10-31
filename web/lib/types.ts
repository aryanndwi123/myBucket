// Shapes mirror the `items` collection in the PRD so the UI can switch to the real API later.

export type Platform = "instagram" | "x" | "linkedin" | "youtube" | "web";
export type ItemStatus = "processing" | "ready" | "review" | "unavailable";
export type Intent = "Learn" | "Try" | "Buy" | "Visit" | "Apply" | "Watch" | "Inspire" | "Read";
export type FolderName = "Recipes" | "Coding" | "Career" | "Fitness" | "Travel" | "Tools" | "Inbox";
/** The fixed categories. Inbox is the catch-all and has no subcategories. */
export type ContentFolder = Exclude<FolderName, "Inbox">;

export interface ActionItem {
  text: string;
  done: boolean;
}

export interface SaveItem {
  id: string;
  /** Canonical URL key used for dedupe (PRD: urlHash). */
  key: string;
  platform: Platform;
  status: ItemStatus;
  /** While processing, the current pipeline step shown on the card. */
  step?: string;
  title: string;
  kind: string; // "Reel", "Post on X", "LinkedIn post", "YouTube", "Link"
  length?: string; // "0:48"
  author: string;
  folder: FolderName | "";
  /** One of FOLDER_SUBS[folder], or "" when the folder is Inbox or still processing. */
  subcategory: string;
  tags: string[];
  intent: Intent | "";
  summary: string;
  actions: ActionItem[];
  remind: string; // display label, e.g. "Sat · 9:30 AM"
  why: string; // why the reminder is timed this way
  due: boolean; // shows in Today
  saved: string; // "2d ago"
  savedOn: string; // "29 Oct"
  language: string;
  confidence: string; // "86%" or "you picked"
  transcript: string;
  transcriptEn: string;
  finished?: boolean;
  archived?: boolean;
  snoozes?: number;
}

export type View = "today" | "all" | "inbox";
export type OmniMode = "idle" | "save" | "search" | "ask";
export type TypeFilter = "All types" | "Reels" | "X" | "LinkedIn" | "YouTube" | "To try" | "To learn" | "To apply";
