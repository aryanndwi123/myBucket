import type { FolderName, Platform, SaveItem, TypeFilter } from "./types";

/** Placeholder until auth exists (PRD: Google sign-in). */
export const USER = { name: "Danish" };

export const FOLDERS: Exclude<FolderName, "Inbox">[] = ["Recipes", "Coding", "Career", "Fitness", "Travel", "Tools"];

/** Soft cover colour per folder (content colour). */
export const FOLDER_TINT: Record<string, string> = {
  Recipes: "#F5C9A6",
  Coding: "#F1DF9E",
  Career: "#D8D1F0",
  Fitness: "#C9DDBB",
  Travel: "#BBD8DC",
  Tools: "#EBCFC6",
  Inbox: "#E6DED0",
};

/** Stronger accent per folder, used for small dots and rails. */
export const FOLDER_DOT: Record<string, string> = {
  Recipes: "#D9773F",
  Coding: "#B8952A",
  Career: "#7A68C2",
  Fitness: "#5E8C4A",
  Travel: "#3E8791",
  Tools: "#B0614E",
  Inbox: "#8A7E72",
};

export const TYPE_FILTERS: TypeFilter[] = ["All types", "Reels", "X", "LinkedIn", "YouTube", "To try", "To learn", "To apply"];

const todo = (list: string[]) => list.map((text) => ({ text, done: false }));

// Mock data. The creators, people and companies are fictional.
export const SEED_ITEMS: SaveItem[] = [
  {
    id: "i3", key: "instagram.com/reel/c8ueff", platform: "instagram", status: "ready",
    title: "4 useEffect mistakes that cause extra re-renders", kind: "Reel", length: "1:12", author: "@codewithriya",
    folder: "Coding", tags: ["react", "hooks", "performance"], intent: "Learn",
    summary: "Missing dependency arrays, objects created in render, fetching without cleanup, and syncing state that could be derived. Each with a one-line fix.",
    actions: todo(["Re-watch and note the 4 fixes", "Check the dashboard repo for #2"]),
    remind: "Today · 8:00 PM", why: "Day-7 revision · saved last Saturday", due: true, saved: "7d ago", savedOn: "24 Oct",
    language: "English", confidence: "91%",
    transcript: "Mistake number one — you forgot the dependency array, so this effect runs after every render…",
    transcriptEn: "Original audio is in English.",
  },
  {
    id: "i2", key: "linkedin.com/posts/kiranalabs-frontend", platform: "linkedin", status: "ready",
    title: "Frontend Engineer II at Kirana Labs, Bengaluru", kind: "LinkedIn post", author: "Meera Iyer · Recruiter",
    folder: "Career", tags: ["hiring", "react", "bengaluru"], intent: "Apply",
    summary: "Hiring a React + TypeScript engineer with 2–4 years’ experience for their payments dashboard. Referral link in comments; applications close Monday.",
    actions: todo(["Add the PWA project to resume", "Apply through the referral link", "Message Meera after applying"]),
    remind: "Tomorrow · 10:00 AM", why: "Applications close Monday — 48 h nudge", due: true, saved: "1d ago", savedOn: "30 Oct",
    language: "English", confidence: "96%",
    transcript: "We’re hiring! Frontend Engineer II to own our merchant payments dashboard…",
    transcriptEn: "Post text (no audio).",
  },
  {
    id: "i1", key: "instagram.com/reel/c9xyz", platform: "instagram", status: "ready",
    title: "5-minute high-protein paneer bhurji", kind: "Reel", length: "0:48", author: "@chef.anaya",
    folder: "Recipes", tags: ["high-protein", "veg", "breakfast"], intent: "Try",
    summary: "Quick veg breakfast with about 30 g protein: crumble paneer into an onion-tomato masala, add a spoon of besan for body and finish with kasuri methi.",
    actions: todo(["Buy paneer and kasuri methi", "Cook it this weekend"]),
    remind: "Sat · 9:30 AM", why: "Recipes come back on weekend mornings", due: true, saved: "2d ago", savedOn: "29 Oct",
    language: "Hinglish → English", confidence: "86%",
    transcript: "Aaj banayenge sirf 5 minute mein paneer bhurji, 30 gram protein ke saath. Pehle pyaaz ko halka sa bhuno, phir tamatar…",
    transcriptEn: "Today we’ll make paneer bhurji in just 5 minutes, with 30 grams of protein. First lightly sauté the onion, then the tomato…",
  },
  {
    id: "i4", key: "x.com/thrifty_notion/status/1851", platform: "x", status: "ready",
    title: "Notion budget template that splits needs, wants and savings", kind: "Post on X", author: "@thrifty_notion",
    folder: "Tools", tags: ["notion", "money", "template"], intent: "Try",
    summary: "A 50/30/20 budget board with a monthly roll-up and a recurring-expense database. Template link in the reply.",
    actions: todo(["Duplicate the template", "Add October expenses"]),
    remind: "Sun · 11:00 AM", why: "Set-up tasks go to Sunday mornings", due: false, saved: "3d ago", savedOn: "28 Oct",
    language: "English", confidence: "78%",
    transcript: "I rebuilt my budget in Notion and it finally stuck. Here’s the template.",
    transcriptEn: "Thread text (no audio).",
  },
  {
    id: "i5", key: "instagram.com/reel/c7fit20", platform: "instagram", status: "ready",
    title: "20-minute dumbbell full-body workout", kind: "Reel", length: "0:59", author: "@liftwithmeera",
    folder: "Fitness", tags: ["strength", "home-workout", "dumbbells"], intent: "Try",
    summary: "Five moves, four rounds, 40 seconds on and 20 off: goblet squat, renegade row, reverse lunge, push press, dead bug.",
    actions: todo(["Do it Monday morning"]),
    remind: "Mon · 7:00 AM", why: "Workouts land on weekday mornings", due: false, saved: "4d ago", savedOn: "27 Oct",
    language: "English", confidence: "93%",
    transcript: "Grab two dumbbells, set a timer for 40 on, 20 off…", transcriptEn: "Original audio is in English.",
  },
  {
    id: "i6", key: "instagram.com/reel/c6cafe", platform: "instagram", status: "ready",
    title: "Three quiet cafés in Bandra with good Wi-Fi", kind: "Reel", length: "0:34", author: "@mumbai.sips",
    folder: "Travel", tags: ["mumbai", "cafes", "work-friendly"], intent: "Visit",
    summary: "Laptop-friendly spots with plug points and slow afternoons, plus what to order at each.",
    actions: todo(["Pick one for next Saturday"]),
    remind: "Next Sat · 2:00 PM", why: "Places come back when you are free", due: false, saved: "6d ago", savedOn: "25 Oct",
    language: "Hinglish → English", confidence: "88%",
    transcript: "Bandra mein teen aise cafés jahan aap shanti se kaam kar sakte ho…",
    transcriptEn: "Three cafés in Bandra where you can work in peace…",
  },
  {
    id: "i7", key: "x.com/pixelpushr/status/1849", platform: "x", status: "ready",
    title: "12 AI tools designers actually use", kind: "Post on X", author: "@pixelpushr",
    folder: "Tools", tags: ["design", "ai", "thread"], intent: "Learn",
    summary: "A thread grouping tools by job: moodboards, copy, prototyping and handoff, with one sentence on when each is worth it.",
    actions: todo(["Try two of them this week"]),
    remind: "Wed · 6:00 PM", why: "Learning saves come back mid-week", due: false, saved: "1w ago", savedOn: "23 Oct",
    language: "English", confidence: "82%",
    transcript: "12 AI tools I use every week as a product designer. A thread…", transcriptEn: "Thread text (no audio).",
  },
  {
    id: "i8", key: "youtube.com/watch?v=sd10min", platform: "youtube", status: "ready",
    title: "System design interview in 10 minutes", kind: "YouTube", length: "11:42", author: "@systems.simplified",
    folder: "Coding", tags: ["system-design", "interview"], intent: "Watch",
    summary: "Requirements, estimates, API, data model, then scale: a repeatable 5-step frame with a URL-shortener walkthrough.",
    actions: todo(["Watch with notes", "Practise on a chat app"]),
    remind: "Day 1 · revisit Day 7", why: "Spaced revision for learning saves", due: false, saved: "1w ago", savedOn: "22 Oct",
    language: "English (captions)", confidence: "94%",
    transcript: "Let’s design a URL shortener in ten minutes. Step one: requirements…", transcriptEn: "From YouTube captions.",
  },
  {
    id: "i9", key: "instagram.com/reel/c5sunset", platform: "instagram", status: "review",
    title: "Sunset timelapse, no caption", kind: "Reel", length: "0:21", author: "@unknown",
    folder: "Inbox", tags: ["music-only"], intent: "Inspire",
    summary: "Music only, no caption. From the thumbnail it looks like a beach sunset timelapse — is this for Travel?",
    actions: todo(["Pick a folder"]),
    remind: "No reminder yet", why: "File it and we’ll pick a time", due: false, saved: "2w ago", savedOn: "17 Oct",
    language: "No speech", confidence: "52%",
    transcript: "(music only)", transcriptEn: "No speech detected. Classified from the thumbnail.",
  },
];

/**
 * What the mock "worker" returns per platform after processing.
 * Replace with the real API response (POST /api/items returns the finished item).
 */
export const MOCK_RESULTS: Record<Platform, Omit<SaveItem, "id" | "key" | "platform" | "status" | "saved" | "savedOn" | "due" | "actions"> & { actions: string[] }> = {
  instagram: {
    title: "Morning mobility flow for desk workers", kind: "Reel", length: "0:52", author: "@stretch.with.sana",
    folder: "Fitness", tags: ["mobility", "desk", "morning"], intent: "Try",
    summary: "Six moves for hips, upper back and neck you can do next to your desk in under 5 minutes.",
    actions: ["Try it before work tomorrow"], remind: "Tomorrow · 7:30 AM", why: "Workouts land on weekday mornings",
    confidence: "89%", language: "Hinglish → English",
    transcript: "Subah uthte hi yeh 6 stretches karo…", transcriptEn: "Do these 6 stretches right after you wake up…",
  },
  x: {
    title: "7 prompts to plan your week in 10 minutes", kind: "Post on X", author: "@weeklyreset",
    folder: "Tools", tags: ["productivity", "prompts"], intent: "Try",
    summary: "A Sunday reset routine: brain-dump, sort, pick three priorities, block time, then a 2-minute review.",
    actions: ["Run it this Sunday"], remind: "Sun · 6:00 PM", why: "Planning saves come back on Sunday evening",
    confidence: "84%", language: "English",
    transcript: "My 10-minute Sunday reset, as 7 prompts.", transcriptEn: "Thread text (no audio).",
  },
  linkedin: {
    title: "Product design internship — apply by Friday", kind: "LinkedIn post", author: "Arjun Rao · Design Lead",
    folder: "Career", tags: ["internship", "design"], intent: "Apply",
    summary: "Six-month paid internship, portfolio required. Applications close Friday.",
    actions: ["Update portfolio", "Apply"], remind: "Tomorrow · 10:00 AM", why: "Deadline in 6 days",
    confidence: "95%", language: "English",
    transcript: "We are opening 3 internship roles on the design team…", transcriptEn: "Post text (no audio).",
  },
  youtube: {
    title: "Sourdough for beginners, start to finish", kind: "YouTube", length: "18:20", author: "@slowbakes",
    folder: "Recipes", tags: ["baking", "sourdough"], intent: "Try",
    summary: "Starter, autolyse, folds, shaping and bake, with a printable timeline.",
    actions: ["Feed a starter", "Bake on Sunday"], remind: "Sat · 10:00 AM", why: "Recipes come back on weekend mornings",
    confidence: "90%", language: "English (captions)",
    transcript: "Today we’re baking our first sourdough loaf…", transcriptEn: "From YouTube captions.",
  },
  web: {
    title: "Saved article", kind: "Link", author: "web",
    folder: "Inbox", tags: ["article"], intent: "Read",
    summary: "We saved the page text. Pick a folder so we know where it belongs.",
    actions: ["Pick a folder"], remind: "No reminder yet", why: "File it and we’ll pick a time",
    confidence: "48%", language: "English", transcript: "(page text)", transcriptEn: "",
  },
};
