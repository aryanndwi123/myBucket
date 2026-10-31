// The UI's view of the backend's `items` and `folders`. `lib/adapt.ts` converts API responses into these.

/** The backend extracts Instagram reels and X posts today. */
export type Platform = "instagram" | "x";
/** `review` = the classifier wasn't sure, so the save sits in the Inbox. `unavailable` = extraction failed. */
export type ItemStatus = "processing" | "ready" | "review" | "unavailable";
export type Intent = "Learn" | "Try" | "Buy" | "Visit" | "Apply" | "Watch" | "Inspire";
/** Folder names are dynamic: the classifier creates them from the user's own saves. */
export type FolderName = string;

export interface ActionItem {
  text: string;
  done: boolean;
}

export interface Folder {
  id: string;
  name: FolderName;
  /** One line from the classifier on what belongs here. */
  description: string;
  isInbox: boolean;
}

export interface SaveItem {
  id: string;
  /** Normalised source URL. The server dedupes on its hash. */
  url: string;
  platform: Platform;
  status: ItemStatus;
  /** Set while the save request is still open. */
  step?: string;
  /** Created locally and not on the server yet; replaced when the request returns. */
  pending?: boolean;
  /** Why extraction failed, when `status` is `unavailable`. */
  error?: string;
  title: string;
  kind: string; // "Reel", "Post on X"
  length?: string; // "0:48"
  author: string;
  /** Primary folder: the first real one, else Inbox. "" while processing or failed. */
  folder: FolderName | "";
  /** Every folder the save is in (an item can be in more than one). */
  folders: FolderName[];
  tags: string[];
  intent: Intent | "";
  summary: string;
  actions: ActionItem[];
  thumbnailUrl: string;
  /** "2d ago" */
  saved: string;
  /** "29 Oct" */
  savedOn: string;
  createdAt: number;
  /** "86%", or "you picked" after the user files it themselves. */
  confidence: string;
  /** What was said (reels) or written (posts). */
  text: string;
  textSource: "audio" | "post";
}

export type View = "home" | "all" | "inbox";
export type OmniMode = "idle" | "save" | "search" | "ask";
export type TypeFilter = "All types" | "Reels" | "X" | "To try" | "To learn" | "To apply";
