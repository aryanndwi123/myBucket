import type { ContentFolder, Platform, SaveItem, TypeFilter } from "./types";

/** Placeholder until auth exists (PRD: Google sign-in). */
export const USER = { name: "Danish" };

/** Categories are fixed for now. */
export const FOLDERS: ContentFolder[] = ["Recipes", "Coding", "Career", "Fitness", "Travel", "Tools"];

/**
 * Fixed subcategories per category. The classifier picks one of these (an enum in its JSON schema),
 * so a save can never land in a subcategory that doesn't exist.
 */
export const FOLDER_SUBS: Record<ContentFolder, string[]> = {
  Recipes: ["Breakfast", "Dinner", "Snacks", "Desserts", "Baking"],
  Coding: ["React", "System design", "DSA", "Backend"],
  Career: ["Job openings", "Internships", "Interview prep", "Resume"],
  Fitness: ["Strength", "Mobility", "Cardio", "Nutrition"],
  Travel: ["Cafés", "Weekend trips", "Stays", "Itineraries"],
  Tools: ["Productivity", "Design", "AI tools", "Money"],
};

/** One line per category, shown under its name on the category page. Also useful as classifier context. */
export const FOLDER_BLURB: Record<ContentFolder, string> = {
  Recipes: "Things to cook, from quick weekday meals to weekend bakes.",
  Coding: "Tutorials, patterns and interview prep worth coming back to.",
  Career: "Roles to apply for, interview prep and ways to improve your profile.",
  Fitness: "Workouts, mobility and food that supports them.",
  Travel: "Places to go, where to stay and plans worth copying.",
  Tools: "Apps and workflows that save you time or money.",
};

/** What each subcategory covers. */
export const SUB_BLURB: Record<ContentFolder, Record<string, string>> = {
  Recipes: {
    Breakfast: "Quick, filling starts to the day.",
    Dinner: "Weeknight mains and one-pot meals.",
    Snacks: "Small bites between meals.",
    Desserts: "Sweet things, with or without an oven.",
    Baking: "Breads, cakes and anything that needs an oven.",
  },
  Coding: {
    React: "Hooks, rendering and component patterns.",
    "System design": "Architecture and scale, mostly for interviews.",
    DSA: "Data structures, algorithms and problem patterns.",
    Backend: "APIs, databases and server-side craft.",
  },
  Career: {
    "Job openings": "Roles you might apply for, with deadlines.",
    Internships: "Early-career and student programmes.",
    "Interview prep": "Questions, frameworks and mock rounds.",
    Resume: "Resume, portfolio and profile advice.",
  },
  Fitness: {
    Strength: "Lifting and resistance training.",
    Mobility: "Stretching, posture and recovery.",
    Cardio: "Running, skipping and conditioning.",
    Nutrition: "Protein, meal prep and eating for training.",
  },
  Travel: {
    Cafés: "Places to work, meet or slow down.",
    "Weekend trips": "Short getaways you can plan in an evening.",
    Stays: "Hostels, homestays and hotels.",
    Itineraries: "Day-by-day plans for longer trips.",
  },
  Tools: {
    Productivity: "Systems and shortcuts for getting things done.",
    Design: "Kits, palettes and design resources.",
    "AI tools": "Assistants, prompts and workflows.",
    Money: "Budgets, tracking and saving.",
  },
};

export interface Suggestion {
  title: string;
  /** One line on why it fits, the way the LLM would phrase it. */
  why: string;
  by: string;
  kind: string;
}

const sg = (title: string, why: string, by: string, kind: string): Suggestion => ({ title, why, by, kind });

/**
 * Related content the LLM suggests for each subcategory.
 * Hard-coded sample data: the real version is one small LLM call per subcategory (see the Backend page).
 * The creators and titles are fictional.
 */
export const SUGGESTIONS: Record<ContentFolder, Record<string, Suggestion[]>> = {
  Recipes: {
    Breakfast: [
      sg("Moong dal chilla with paneer filling", "Same protein-first idea as your paneer bhurji, ready in 10 minutes.", "@tiffin.tales", "Reel"),
      sg("Overnight oats with peanut butter", "No-cook, about 25 g protein, prep it the night before.", "@fuelbowl", "Reel"),
      sg("Besan cheela, three ways", "Uses the besan already on your paneer bhurji shopping list.", "@desi.pantry", "Post on X"),
    ],
    Dinner: [
      sg("One-pot paneer tikka masala", "A weeknight sequel to your paneer save, one pan to wash.", "@onepot.nisha", "Reel"),
      sg("Dal tadka, restaurant style", "The staple most of your saved dinners assume you can make.", "@tadka.tom", "Reel"),
      sg("Veg khichdi that isn't boring", "Quick comfort food for tired evenings.", "@simmer.sid", "YouTube"),
    ],
    Snacks: [
      sg("Roasted makhana in four flavours", "Crunchy, high-protein and ready in 6 minutes.", "@snackshelf", "Reel"),
      sg("Sprout bhel in five minutes", "A no-oil snack that fits your high-protein saves.", "@chaatwali.chitra", "Reel"),
      sg("Air-fryer chaat cups", "Party snack with a make-ahead trick.", "@crispy.kitchen", "Reel"),
    ],
    Desserts: [
      sg("Two-ingredient chocolate mousse", "Low effort, good for when you want sweet without baking.", "@sweetsprint", "Reel"),
      sg("Date and walnut energy balls", "Dessert that doubles as a gym snack.", "@fuelbowl", "Reel"),
      sg("Mango shrikhand", "Seasonal and takes ten minutes plus fridge time.", "@thaali.diaries", "Post on X"),
    ],
    Baking: [
      sg("No-knead focaccia for first-timers", "Pairs with your sourdough interest, far less fuss.", "@slowbakes", "YouTube"),
      sg("Whole-wheat banana bread", "A forgiving first bake with pantry ingredients.", "@ovenmitt.omi", "Reel"),
      sg("Eggless brownies in a pressure cooker", "Baking without an oven.", "@cooker.club", "Reel"),
    ],
  },
  Coding: {
    React: [
      sg("useMemo vs useCallback: when it's worth it", "A natural follow-up to your useEffect mistakes reel.", "@codewithriya", "Reel"),
      sg("Five custom hooks you can steal", "Small, reusable and easy to explain in interviews.", "@hookline", "YouTube"),
    ],
    "System design": [
      sg("Design a rate limiter in 8 minutes", "Builds on the 5-step frame from your system design save.", "@systems.simplified", "YouTube"),
      sg("Cache invalidation, explained with a bakery", "Makes the hardest part of design interviews stick.", "@boxesandarrows", "Post on X"),
    ],
    DSA: [
      sg("Sliding window in five patterns", "Covers most array questions you'll meet in screens.", "@leetloop", "Reel"),
      sg("Graphs for people who skipped graphs", "Gentle start with BFS and DFS.", "@dsa.daily", "YouTube"),
    ],
    Backend: [
      sg("Idempotency keys for payment APIs", "Pairs with the payments dashboard role you saved.", "@apibrew", "Post on X"),
      sg("Why your Postgres query is slow", "Reading an EXPLAIN plan without fear.", "@sqlsundays", "Reel"),
    ],
  },
  Career: {
    "Job openings": [
      sg("Remote React roles that reply within a week", "Matches the frontend openings you've been saving.", "@remote.radar", "Post on X"),
      sg("How to ask for a referral without being awkward", "Useful for the referral link in your saved post.", "@careernotes.k", "LinkedIn post"),
    ],
    Internships: [
      sg("Portfolio tips for design internships", "Fits the internship post you saved this week.", "@foliofix", "LinkedIn post"),
      sg("Cold email template for internship leads", "Short, specific and easy to personalise.", "@intern.lab", "Post on X"),
    ],
    "Interview prep": [
      sg("STAR answers that don't sound rehearsed", "Good for the behavioural round after system design.", "@mockmate", "Reel"),
      sg("Questions to ask your interviewer", "Leaves a better last impression.", "@careernotes.k", "LinkedIn post"),
    ],
    Resume: [
      sg("One-page resume teardown", "A before-and-after you can copy.", "@cvclinic", "Reel"),
      sg("Turning projects into bullet points", "Helps with 'add the PWA project to resume'.", "@foliofix", "Post on X"),
    ],
  },
  Fitness: {
    Strength: [
      sg("Progressive overload without a gym", "Keeps your dumbbell workout improving week to week.", "@liftwithmeera", "Reel"),
      sg("Dumbbell back day in 25 minutes", "Fills the pulling gap in your full-body routine.", "@homegains", "Reel"),
    ],
    Mobility: [
      sg("Ten-minute hip opener before bed", "Pairs with your morning desk mobility flow.", "@stretch.with.sana", "Reel"),
      sg("Desk-neck reset in 3 minutes", "A quick break between long coding sessions.", "@posturepal", "Reel"),
    ],
    Cardio: [
      sg("Zone 2 cardio for beginners", "Low effort and a good base for strength days.", "@pacewithpriya", "YouTube"),
      sg("Skipping rope intervals", "Fifteen minutes, no equipment beyond the rope.", "@jumpstart.jay", "Reel"),
    ],
    Nutrition: [
      sg("Veg protein sources, ranked", "Backs up the high-protein recipes you save.", "@plantplates", "Post on X"),
      sg("Meal-prep Sunday for muscle gain", "Turns your paneer saves into a week of lunches.", "@fuelbowl", "Reel"),
    ],
  },
  Travel: {
    Cafés: [
      sg("Quiet cafés in Pune for deep work", "Same laptop-friendly idea as your Bandra save.", "@sipandcode", "Reel"),
      sg("Filter coffee trail in Bengaluru", "A slow Saturday plan with good seating.", "@brewmap", "Reel"),
    ],
    "Weekend trips": [
      sg("A weekend in Lonavala by train", "Easy from Mumbai, no car needed.", "@wanderlist", "Reel"),
      sg("Pondicherry in 48 hours", "Short, walkable and cheap to plan.", "@passportpuri", "YouTube"),
    ],
    Stays: [
      sg("Hostels with real private rooms", "Social without losing sleep.", "@bunkandbag", "Post on X"),
      sg("Hill homestays under ₹2,000", "Good value for a quiet work-from-hills week.", "@hillhopper", "Reel"),
    ],
    Itineraries: [
      sg("Five days in Himachal, no rush", "A relaxed route with buffer days.", "@wanderlist", "YouTube"),
      sg("Kerala backwaters on a budget", "Day-by-day costs and stay picks.", "@coconutcompass", "Reel"),
    ],
  },
  Tools: {
    Productivity: [
      sg("A weekly review in Notion", "Goes with the Sunday reset prompts you might save.", "@weeklyreset", "Post on X"),
      sg("Keyboard shortcuts that save an hour a week", "Small habits that compound.", "@shortcutsam", "Reel"),
    ],
    Design: [
      sg("Free Figma kits for dashboards", "Handy next to your designer-tools thread.", "@pixelpushr", "Post on X"),
      sg("Colour palettes from a single photo", "Quick moodboards without guesswork.", "@huehouse", "Reel"),
    ],
    "AI tools": [
      sg("A prompt library for product managers", "Extends the AI tools thread you saved.", "@promptpantry", "Post on X"),
      sg("Summarise PDFs without losing the numbers", "A safer way to use AI on reports.", "@docdigest", "Reel"),
    ],
    Money: [
      sg("Three variants of the 50/30/20 sheet", "Alternatives to your Notion budget template.", "@thrifty_notion", "Post on X"),
      sg("Track every subscription in one view", "Finds the quiet monthly leaks.", "@ledgerlane", "Reel"),
    ],
  },
};

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

/** Every suggestion with its place in the tree, so search can find ideas as well as saves. */
export const SUGGESTION_INDEX: (Suggestion & { folder: ContentFolder; sub: string })[] = FOLDERS.flatMap((folder) =>
  Object.entries(SUGGESTIONS[folder]).flatMap(([sub, list]) => list.map((s) => ({ ...s, folder, sub }))),
);

export const TYPE_FILTERS: TypeFilter[] = ["All types", "Reels", "X", "LinkedIn", "YouTube", "To try", "To learn", "To apply"];

const todo = (list: string[]) => list.map((text) => ({ text, done: false }));

// Mock data. The creators, people and companies are fictional.
export const SEED_ITEMS: SaveItem[] = [
  {
    id: "i3", key: "instagram.com/reel/c8ueff", platform: "instagram", status: "ready",
    title: "4 useEffect mistakes that cause extra re-renders", kind: "Reel", length: "1:12", author: "@codewithriya",
    folder: "Coding", subcategory: "React", tags: ["react", "hooks", "performance"], intent: "Learn",
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
    folder: "Career", subcategory: "Job openings", tags: ["hiring", "react", "bengaluru"], intent: "Apply",
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
    folder: "Recipes", subcategory: "Breakfast", tags: ["high-protein", "veg", "breakfast"], intent: "Try",
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
    folder: "Tools", subcategory: "Money", tags: ["notion", "money", "template"], intent: "Try",
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
    folder: "Fitness", subcategory: "Strength", tags: ["strength", "home-workout", "dumbbells"], intent: "Try",
    summary: "Five moves, four rounds, 40 seconds on and 20 off: goblet squat, renegade row, reverse lunge, push press, dead bug.",
    actions: todo(["Do it Monday morning"]),
    remind: "Mon · 7:00 AM", why: "Workouts land on weekday mornings", due: false, saved: "4d ago", savedOn: "27 Oct",
    language: "English", confidence: "93%",
    transcript: "Grab two dumbbells, set a timer for 40 on, 20 off…", transcriptEn: "Original audio is in English.",
  },
  {
    id: "i6", key: "instagram.com/reel/c6cafe", platform: "instagram", status: "ready",
    title: "Three quiet cafés in Bandra with good Wi-Fi", kind: "Reel", length: "0:34", author: "@mumbai.sips",
    folder: "Travel", subcategory: "Cafés", tags: ["mumbai", "cafes", "work-friendly"], intent: "Visit",
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
    folder: "Tools", subcategory: "AI tools", tags: ["design", "ai", "thread"], intent: "Learn",
    summary: "A thread grouping tools by job: moodboards, copy, prototyping and handoff, with one sentence on when each is worth it.",
    actions: todo(["Try two of them this week"]),
    remind: "Wed · 6:00 PM", why: "Learning saves come back mid-week", due: false, saved: "1w ago", savedOn: "23 Oct",
    language: "English", confidence: "82%",
    transcript: "12 AI tools I use every week as a product designer. A thread…", transcriptEn: "Thread text (no audio).",
  },
  {
    id: "i8", key: "youtube.com/watch?v=sd10min", platform: "youtube", status: "ready",
    title: "System design interview in 10 minutes", kind: "YouTube", length: "11:42", author: "@systems.simplified",
    folder: "Coding", subcategory: "System design", tags: ["system-design", "interview"], intent: "Watch",
    summary: "Requirements, estimates, API, data model, then scale: a repeatable 5-step frame with a URL-shortener walkthrough.",
    actions: todo(["Watch with notes", "Practise on a chat app"]),
    remind: "Day 1 · revisit Day 7", why: "Spaced revision for learning saves", due: false, saved: "1w ago", savedOn: "22 Oct",
    language: "English (captions)", confidence: "94%",
    transcript: "Let’s design a URL shortener in ten minutes. Step one: requirements…", transcriptEn: "From YouTube captions.",
  },
  {
    id: "i9", key: "instagram.com/reel/c5sunset", platform: "instagram", status: "review",
    title: "Sunset timelapse, no caption", kind: "Reel", length: "0:21", author: "@unknown",
    folder: "Inbox", subcategory: "", tags: ["music-only"], intent: "Inspire",
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
    folder: "Fitness", subcategory: "Mobility", tags: ["mobility", "desk", "morning"], intent: "Try",
    summary: "Six moves for hips, upper back and neck you can do next to your desk in under 5 minutes.",
    actions: ["Try it before work tomorrow"], remind: "Tomorrow · 7:30 AM", why: "Workouts land on weekday mornings",
    confidence: "89%", language: "Hinglish → English",
    transcript: "Subah uthte hi yeh 6 stretches karo…", transcriptEn: "Do these 6 stretches right after you wake up…",
  },
  x: {
    title: "7 prompts to plan your week in 10 minutes", kind: "Post on X", author: "@weeklyreset",
    folder: "Tools", subcategory: "Productivity", tags: ["productivity", "prompts"], intent: "Try",
    summary: "A Sunday reset routine: brain-dump, sort, pick three priorities, block time, then a 2-minute review.",
    actions: ["Run it this Sunday"], remind: "Sun · 6:00 PM", why: "Planning saves come back on Sunday evening",
    confidence: "84%", language: "English",
    transcript: "My 10-minute Sunday reset, as 7 prompts.", transcriptEn: "Thread text (no audio).",
  },
  linkedin: {
    title: "Product design internship — apply by Friday", kind: "LinkedIn post", author: "Arjun Rao · Design Lead",
    folder: "Career", subcategory: "Internships", tags: ["internship", "design"], intent: "Apply",
    summary: "Six-month paid internship, portfolio required. Applications close Friday.",
    actions: ["Update portfolio", "Apply"], remind: "Tomorrow · 10:00 AM", why: "Deadline in 6 days",
    confidence: "95%", language: "English",
    transcript: "We are opening 3 internship roles on the design team…", transcriptEn: "Post text (no audio).",
  },
  youtube: {
    title: "Sourdough for beginners, start to finish", kind: "YouTube", length: "18:20", author: "@slowbakes",
    folder: "Recipes", subcategory: "Baking", tags: ["baking", "sourdough"], intent: "Try",
    summary: "Starter, autolyse, folds, shaping and bake, with a printable timeline.",
    actions: ["Feed a starter", "Bake on Sunday"], remind: "Sat · 10:00 AM", why: "Recipes come back on weekend mornings",
    confidence: "90%", language: "English (captions)",
    transcript: "Today we’re baking our first sourdough loaf…", transcriptEn: "From YouTube captions.",
  },
  web: {
    title: "Saved article", kind: "Link", author: "web",
    folder: "Inbox", subcategory: "", tags: ["article"], intent: "Read",
    summary: "We saved the page text. Pick a folder so we know where it belongs.",
    actions: ["Pick a folder"], remind: "No reminder yet", why: "File it and we’ll pick a time",
    confidence: "48%", language: "English", transcript: "(page text)", transcriptEn: "",
  },
};
