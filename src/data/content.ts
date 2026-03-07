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
  }
];
