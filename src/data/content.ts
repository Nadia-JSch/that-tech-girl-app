export type ThemeKey =
  | "clean-girl-coder"
  | "strawberry-syntax"
  | "coquette-compiler"
  | "ballet-backend"
  | "midnight-coder";

export type Topic =
  | "confidence"
  | "learning"
  | "feedback"
  | "debugging"
  | "career";

export type Lesson = {
  id: string;
  title: string;
  category: "code" | "career" | "tools";
  summary: string;
  bullets: string[];
  snippet?: string;
};

export type Affirmation = {
  id: string;
  topic: Topic;
  text: string;
  mantra: string;
  lessonId: string;
};

export const themes: Record<
  ThemeKey,
  { name: string; description: string; surfaceClass: string }
> = {
  "clean-girl-coder": {
    name: "Clean Girl Coder",
    description: "Soft pinks, fresh air, glossy cards.",
    surfaceClass: "theme-clean"
  },
  "strawberry-syntax": {
    name: "Strawberry Syntax",
    description: "Cherry reds with playful contrast.",
    surfaceClass: "theme-strawberry"
  },
  "coquette-compiler": {
    name: "Coquette Compiler",
    description: "Dreamy lavender, pixel clouds, starlit vibes.",
    surfaceClass: "theme-coquette"
  },
  "ballet-backend": {
    name: "Ballet Backend",
    description: "Powder blues and ribbon gradients.",
    surfaceClass: "theme-ballet"
  },
  "midnight-coder": {
    name: "Midnight Coder",
    description: "Dark plum, glowing violet, late-night energy.",
    surfaceClass: "theme-midnight"
  }
};

export const lessons: Lesson[] = [
  {
    id: "lesson-console-table",
    title: "Debug prettier with console.table()",
    category: "code",
    summary: "When arrays of objects get messy in logs, turn them into something skimmable.",
    bullets: [
      "Use it for API responses, form state, or quick QA checks.",
      "Pick a few key fields first so the table stays readable.",
      "It is perfect for tiny inspections before you reach for a debugger."
    ],
    snippet: `const rows = users.map(({ name, role, active }) => ({ name, role, active }));\nconsole.table(rows);`
  },
  {
    id: "lesson-feedback",
    title: "Turn feedback into next-step questions",
    category: "career",
    summary: "Feedback lands better when you convert it into a clear action.",
    bullets: [
      "Reply with what you heard to show alignment.",
      "Ask what good looks like in one concrete example.",
      "Confirm the next iteration point so the ask is bounded."
    ],
    snippet: `\"Thanks, that helps. What would a strong version of this look like in one example?\"`
  },
  {
    id: "lesson-git-switch",
    title: "Use git switch for cleaner branch flow",
    category: "tools",
    summary: "Modern Git separates branch switching from file restoration.",
    bullets: [
      "Create and move in one command with -c.",
      "It reads more clearly than older checkout habits.",
      "It reduces mistakes when you only mean to change branches."
    ],
    snippet: `git switch -c feature/polish-settings\n# later\ngit switch main`
  },
  {
    id: "lesson-context",
    title: "Ask for context without sounding uncertain",
    category: "career",
    summary: "Direct questions are a strength, especially when they reduce rework.",
    bullets: [
      "Frame the question around speed or alignment.",
      "Ask about constraints, not just preferences.",
      "Repeat the decision driver back in one sentence."
    ],
    snippet: `\"I can move faster with one constraint clarified: is the priority speed, polish, or flexibility?\"`
  },
  {
    id: "lesson-css-minmax",
    title: "Make responsive cards with minmax()",
    category: "code",
    summary: "Grid layouts feel better when the cards decide their own minimum size.",
    bullets: [
      "Use auto-fit to fill available space without brittle breakpoints.",
      "Keep a strong minimum width to preserve hierarchy.",
      "Pair it with gap and padding tokens so the layout breathes."
    ],
    snippet: `.card-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));\n  gap: 1rem;\n}`
  },
  {
    id: "lesson-css-has",
    title: "Select parents with :has()",
    category: "code",
    summary: "The CSS :has() selector is a 'family selector' that lets you style a parent based on its children.",
    bullets: [
      "Style a card differently if it contains an image.",
      "Highlight a form group if its input is invalid.",
      "No more 'js-parent-class' hacks needed for simple layout shifts."
    ],
    snippet: `.card:has(img) {\n  padding: 0;\n  overflow: hidden;\n}`
  },
  {
    id: "lesson-pr-bestie",
    title: "Review PRs like a bestie",
    category: "career",
    summary: "Great code reviews balance technical rigor with genuine encouragement.",
    bullets: [
      "Lead with what you love before suggesting changes.",
      "Use 'we' and 'our' to keep it collaborative.",
      "Ask questions (e.g., 'What do you think about...?') instead of giving orders."
    ],
    snippet: `\"Love the logic here! Quick thought: would extracting this into a helper make it easier to test?\"`
  },
  {
    id: "lesson-aliases",
    title: "Save time with shell aliases",
    category: "tools",
    summary: "Stop typing long commands over and over. Your shell is your personal assistant.",
    bullets: [
      "Add aliases to your .zshrc or .bashrc file.",
      "Shorten 'git status' to 'gs' or 'npm run dev' to 'nd'.",
      "Include frequent paths like 'alias cdn=\"cd ~/Documents/notes\"'."
    ],
    snippet: `alias gs='git status'\nalias gcm='git commit -m'\nalias nrd='npm run dev'`
  },
  {
    id: "lesson-brag-doc",
    title: "Maintain a brag document",
    category: "career",
    summary: "Don't wait for your performance review to remember your wins. Write them down as they happen.",
    bullets: [
      "Log technical wins, mentorship moments, and bug fixes.",
      "Note down nice things teammates say about your work.",
      "Update it once a week for 10 minutes—your future self will thank you."
    ],
    snippet: `### Week of March 8\n- Fixed the race condition in the auth flow.\n- Mentored a junior on CSS Grid.\n- Shipped the 'Midnight Princess' dark mode.`
  },
  {
    id: "lesson-ts-record",
    title: "Type dynamic objects with Record",
    category: "code",
    summary: "TypeScript's Record utility is perfect for objects where the keys follow a specific set.",
    bullets: [
      "Use Record<K, T> to define keys of type K and values of type T.",
      "It makes your intent clear and provides full autocompletion.",
      "Pairs beautifully with union types or enums."
    ],
    snippet: `type Status = 'active' | 'inactive';\nconst counts: Record<Status, number> = {\n  active: 10,\n  inactive: 2\n};`
  }
];

export const affirmations: Affirmation[] = [
  {
    id: "affirm-confidence",
    topic: "confidence",
    text: "I speak up with grace and glitter. My questions sharpen the room, and my ideas deserve air time.",
    mantra: "My voice belongs in every technical conversation.",
    lessonId: "lesson-context"
  },
  {
    id: "affirm-learning",
    topic: "learning",
    text: "I absorb knowledge like a pretty little powerhouse. Every tutorial, ticket, and typo is building range.",
    mantra: "Beginner energy is momentum, not weakness.",
    lessonId: "lesson-css-minmax"
  },
  {
    id: "affirm-feedback",
    topic: "feedback",
    text: "Critique is sparkle polish. I sort signal from noise and turn notes into my next level-up.",
    mantra: "Feedback refines me; it does not reduce me.",
    lessonId: "lesson-feedback"
  },
  {
    id: "affirm-debugging",
    topic: "debugging",
    text: "I turn bugs into breadcrumbs. I stay calm, trace the pattern, and let the system tell me its secret.",
    mantra: "My patience is part of my technical skill.",
    lessonId: "lesson-console-table"
  },
  {
    id: "affirm-career",
    topic: "career",
    text: "I navigate tools, teams, and branch drama with polish. My growth is real, and I am allowed to take up space.",
    mantra: "I am building a career with intention and style.",
    lessonId: "lesson-git-switch"
  },
  {
    id: "affirm-learning-2",
    topic: "learning",
    text: "I am a methodical explorer of the codebase. Every new concept I grasp adds a new layer to my technical foundation.",
    mantra: "My curiosity is my greatest competitive advantage.",
    lessonId: "lesson-css-has"
  },
  {
    id: "affirm-feedback-2",
    topic: "feedback",
    text: "I approach reviews with Bestie Energy. I see the collaborative effort in every comment and the growth in every change request.",
    mantra: "We build better software when we build together.",
    lessonId: "lesson-pr-bestie"
  },
  {
    id: "affirm-debugging-2",
    topic: "debugging",
    text: "I am the master of my environment. I optimize my workflow to clear the path for my most creative and difficult work.",
    mantra: "I build tools that build my success.",
    lessonId: "lesson-aliases"
  },
  {
    id: "affirm-career-2",
    topic: "career",
    text: "My work creates visible impact. I own my narrative and celebrate the progress I make every single day.",
    mantra: "I am my own best advocate.",
    lessonId: "lesson-brag-doc"
  },
  {
    id: "affirm-confidence-2",
    topic: "confidence",
    text: "I trust my intuition and my types. I am capable of solving complex problems with precision and poise.",
    mantra: "My competence is constant and growing.",
    lessonId: "lesson-ts-record"
  }
];
