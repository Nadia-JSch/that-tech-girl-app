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
  | "career"
  | "visibility"
  | "pacing"
  | "imposter syndrome"
  | "mistakes"
  | "comparison"
  | "communication";

export type Lesson = {
  id: string;
  title: string;
  category: "code" | "career" | "tools";
  summary: string;
  bullets: string[];
  snippet?: string;
};

export type LessonResource = {
  label: string;
  href: string;
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

export const topicOptions: Array<{ value: Topic; label: string }> = [
  { value: "confidence", label: "Confidence" },
  { value: "learning", label: "Learning" },
  { value: "feedback", label: "Feedback" },
  { value: "debugging", label: "Debugging" },
  { value: "career", label: "Career" },
  { value: "visibility", label: "Visibility" },
  { value: "pacing", label: "Pacing" },
  { value: "imposter syndrome", label: "Imposter syndrome" },
  { value: "mistakes", label: "Mistakes" },
  { value: "comparison", label: "Comparison" },
  { value: "communication", label: "Communication" }
];

export const lessons: Lesson[] = [
  {
    id: "lesson-async-await",
    title: "Handle async flows cleanly with async/await",
    category: "code",
    summary: "Async JavaScript gets easier when each await has clear error handling and one obvious responsibility.",
    bullets: [
      "Wrap the smallest meaningful async block in try/catch so failures stay local.",
      "Await API calls in sequence only when order matters; otherwise reach for Promise.all.",
      "Name async helpers after the business action, not the transport detail."
    ],
    snippet: `async function loadProfile(userId) {\n  try {\n    const response = await fetch(\`/api/users/\${userId}\`);\n    return await response.json();\n  } catch (error) {\n    console.error("Failed to load profile", error);\n    throw error;\n  }\n}`
  },
  {
    id: "lesson-communication",
    title: "Communicate blockers without sounding vague",
    category: "career",
    summary: "Clear workplace communication is a technical multiplier because it reduces churn, delay, and bad assumptions.",
    bullets: [
      "State what you tried first so your update sounds informed, not passive.",
      "Name the blocker in one sentence, then ask for the exact missing context or decision.",
      "Close with the next action you can take once the blocker is removed."
    ],
    snippet: `"I checked the API response and the UI mapping, and the mismatch is in the payload shape. Can you confirm whether \`status\` should come back as a string or enum?"`
  },
  {
    id: "lesson-git-flow",
    title: "Keep your Git flow calm and reversible",
    category: "tools",
    summary: "Most Git stress comes from doing too much at once. Small, explicit commands keep you safe.",
    bullets: [
      "Pull latest changes before opening a feature branch so your diff starts clean.",
      "Commit small checkpoints with meaningful messages instead of one giant cleanup commit.",
      "Use status and diff constantly; they are your safety rails, not just debugging tools."
    ],
    snippet: `git switch main\ngit pull\ngit switch -c feature/user-profile-api`
  },
  {
    id: "lesson-api-design",
    title: "Read API responses before wiring the UI",
    category: "career",
    summary: "Frontends break less when you inspect the real payload shape before you start mapping fields into components.",
    bullets: [
      "Check whether the API returns arrays, nested objects, or nullable fields before writing JSX.",
      "Log one real response and compare it to the interface you expected.",
      "Normalize the response in one place so the rest of your UI stays boring."
    ],
    snippet: `const user = {\n  id: payload.id,\n  name: payload.name ?? "Unknown",\n  isActive: payload.status === "active"\n};`
  },
  {
    id: "lesson-crud",
    title: "Think about CRUD as user actions, not database verbs",
    category: "code",
    summary: "CRUD becomes clearer when you map it to what the user is trying to do in the interface.",
    bullets: [
      "Create means collecting valid input and sending a POST with the fields that matter.",
      "Read means fetching and shaping data so the UI can render without guesswork.",
      "Update and delete should always have visible user feedback so state changes feel trustworthy."
    ],
    snippet: `await fetch("/api/tasks/42", {\n  method: "PATCH",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({ done: true })\n});`
  },
  {
    id: "lesson-fetch-patterns",
    title: "Structure fetch calls so the happy path is obvious",
    category: "code",
    summary: "Fetch code gets easier to maintain when parsing, validation, and error handling are not all mixed together.",
    bullets: [
      "Check response.ok before assuming the payload shape is usable.",
      "Parse JSON once, then pass normalized data to the rest of the app.",
      "Throw useful errors so UI code can show meaningful states."
    ],
    snippet: `const response = await fetch("/api/projects");\nif (!response.ok) throw new Error("Failed to load projects");\nconst data = await response.json();`
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
    snippet: `"Thanks, that helps. What would a strong version of this look like in one example?"`
  },
  {
    id: "lesson-pr-bestie",
    title: "Review PRs like a bestie",
    category: "tools",
    summary: "Great code reviews balance technical rigor with genuine encouragement.",
    bullets: [
      "Lead with what you love before suggesting changes.",
      "Use 'we' and 'our' to keep it collaborative.",
      "Ask questions instead of giving orders when there is room for design choice."
    ],
    snippet: `"Love the logic here. What do you think about extracting the request mapping into a helper so this component stays smaller?"`
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
    title: "Type API lookup objects with Record",
    category: "code",
    summary: "Record is useful when JavaScript data comes from dynamic API states but your keys still follow a known set.",
    bullets: [
      "Use Record<K, T> to define keys of type K and values of type T.",
      "It makes your intent clear and provides full autocompletion.",
      "Pairs beautifully with union types or enums."
    ],
    snippet: `type Status = 'active' | 'inactive';\nconst counts: Record<Status, number> = {\n  active: 10,\n  inactive: 2\n};`
  }
];

export const lessonResources: Record<string, LessonResource[]> = {
  "lesson-async-await": [
    {
      label: "MDN: async function",
      href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function"
    },
    {
      label: "MDN: Promise.all()",
      href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all"
    }
  ],
  "lesson-communication": [
    {
      label: "GitHub Docs: communicating in issues and PRs",
      href: "https://docs.github.com/en/issues/tracking-your-work-with-issues/about-issues"
    }
  ],
  "lesson-git-flow": [
    {
      label: "GitHub Docs: Git basics",
      href: "https://docs.github.com/en/get-started/using-git/about-git"
    }
  ],
  "lesson-api-design": [
    {
      label: "MDN: Working with JSON",
      href: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON"
    }
  ],
  "lesson-crud": [
    {
      label: "MDN: Fetch API",
      href: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API"
    }
  ],
  "lesson-fetch-patterns": [
    {
      label: "MDN: Using the Fetch API",
      href: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch"
    }
  ],
  "lesson-feedback": [
    {
      label: "Atlassian: code review best practices",
      href: "https://www.atlassian.com/blog/add-ons/code-review-best-practices"
    }
  ],
  "lesson-pr-bestie": [
    {
      label: "GitHub Docs: reviewing proposed changes",
      href: "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews"
    }
  ],
  "lesson-brag-doc": [
    {
      label: "The Muse: how to keep a brag document",
      href: "https://www.themuse.com/advice/brag-document"
    }
  ],
  "lesson-ts-record": [
    {
      label: "TypeScript Handbook: utility types",
      href: "https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type"
    }
  ]
};

export const affirmations: Affirmation[] = [
  {
    id: "affirm-confidence",
    topic: "confidence",
    text: "I speak up with grace and glitter. My questions sharpen the room, and my ideas deserve air time.",
    mantra: "My voice belongs in every technical conversation.",
    lessonId: "lesson-communication"
  },
  {
    id: "affirm-learning",
    topic: "learning",
    text: "I absorb knowledge like a pretty little powerhouse. Every tutorial, ticket, and typo is building range.",
    mantra: "Beginner energy is momentum, not weakness.",
    lessonId: "lesson-async-await"
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
    lessonId: "lesson-fetch-patterns"
  },
  {
    id: "affirm-career",
    topic: "career",
    text: "I navigate tools, teams, and branch drama with polish. My growth is real, and I am allowed to take up space.",
    mantra: "I am building a career with intention and style.",
    lessonId: "lesson-git-flow"
  },
  {
    id: "affirm-learning-2",
    topic: "learning",
    text: "I am a methodical explorer of the codebase. Every new concept I grasp adds a new layer to my technical foundation.",
    mantra: "My curiosity is my greatest competitive advantage.",
    lessonId: "lesson-crud"
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
    lessonId: "lesson-api-design"
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
  },
  {
    id: "affirm-visibility",
    topic: "visibility",
    text: "I do not have to be the loudest person in the room to be the most valuable. My work speaks clearly when I let it.",
    mantra: "My impact lands, even when I can't see it.",
    lessonId: "lesson-brag-doc"
  },
  {
    id: "affirm-pacing",
    topic: "pacing",
    text: "Slowness is not failure. It is the way I build understanding that actually holds. I am not behind — I am thorough.",
    mantra: "I move at the pace of real comprehension.",
    lessonId: "lesson-async-await"
  },
  {
    id: "affirm-imposter-syndrome",
    topic: "imposter syndrome",
    text: "The fact that I keep showing up — and they keep employing me — is evidence. I do not need to earn my place again today.",
    mantra: "I belong here. That's already been decided.",
    lessonId: "lesson-brag-doc"
  },
  {
    id: "affirm-mistakes",
    topic: "mistakes",
    text: "Making mistakes is part of doing real work. I am someone who tries things, and that is braver than waiting to be perfect.",
    mantra: "I fix it and keep going. That's what professionals do.",
    lessonId: "lesson-fetch-patterns"
  },
  {
    id: "affirm-comparison",
    topic: "comparison",
    text: "Other people's timelines are not my measure. I am building something that fits my actual life, not a highlight reel.",
    mantra: "My path is the right shape for me.",
    lessonId: "lesson-crud"
  },
  {
    id: "affirm-communication",
    topic: "communication",
    text: "Asking for clarity is not a sign of incompetence. It is how I make sure I do the work right the first time.",
    mantra: "Clarity-seeking is a professional skill, not a weakness.",
    lessonId: "lesson-communication"
  },
  {
    id: "affirm-confidence-3",
    topic: "confidence",
    text: "I do not need to sound perfect to sound credible. My thinking has substance, and my perspective adds value in real time.",
    mantra: "My ideas are allowed to arrive before they are polished.",
    lessonId: "lesson-communication"
  },
  {
    id: "affirm-confidence-4",
    topic: "confidence",
    text: "I trust the proof of my own practice. Every solved problem, shipped fix, and brave question has built real authority.",
    mantra: "My confidence is evidence-based.",
    lessonId: "lesson-ts-record"
  },
  {
    id: "affirm-learning-3",
    topic: "learning",
    text: "I learn in layers. What feels confusing now is often just the edge of my next breakthrough.",
    mantra: "Confusion is not failure. It is the door before understanding.",
    lessonId: "lesson-fetch-patterns"
  },
  {
    id: "affirm-learning-4",
    topic: "learning",
    text: "I am building technical depth one clear concept at a time. My pace is not a problem when it creates real understanding.",
    mantra: "I study to understand, not to perform speed.",
    lessonId: "lesson-crud"
  },
  {
    id: "affirm-feedback-3",
    topic: "feedback",
    text: "I can hear a note without turning it into a story about my worth. I am here to iterate, not to be untouchable.",
    mantra: "A note is a direction, not a verdict.",
    lessonId: "lesson-feedback"
  },
  {
    id: "affirm-feedback-4",
    topic: "feedback",
    text: "Review is a collaboration space, not a courtroom. I stay open, specific, and rooted in what will make the work stronger.",
    mantra: "Feedback helps me sharpen, not shrink.",
    lessonId: "lesson-pr-bestie"
  },
  {
    id: "affirm-debugging-3",
    topic: "debugging",
    text: "I do not need to panic to solve a problem. I can slow down, inspect the system, and let the answer emerge from the details.",
    mantra: "Calm is part of the method.",
    lessonId: "lesson-fetch-patterns"
  },
  {
    id: "affirm-debugging-4",
    topic: "debugging",
    text: "Every bug is information. I follow the trail, reduce the noise, and move with the quiet confidence of someone who figures things out.",
    mantra: "I debug with patience, not drama.",
    lessonId: "lesson-api-design"
  },
  {
    id: "affirm-career-3",
    topic: "career",
    text: "I am allowed to want visibility, ease, money, range, and meaningful work at the same time. Ambition can be elegant.",
    mantra: "I grow on purpose, not by accident.",
    lessonId: "lesson-brag-doc"
  },
  {
    id: "affirm-career-4",
    topic: "career",
    text: "My career is not built only in dramatic moments. It is also built in the quiet consistency of good judgment, follow-through, and taste.",
    mantra: "My body of work is speaking for me every day.",
    lessonId: "lesson-git-flow"
  },
  {
    id: "affirm-visibility-2",
    topic: "visibility",
    text: "I let my work be seen without performing a louder version of myself. Clarity, receipts, and consistency are enough.",
    mantra: "My impact does not need theatrics to be real.",
    lessonId: "lesson-brag-doc"
  },
  {
    id: "affirm-visibility-3",
    topic: "visibility",
    text: "I can make my contributions legible. What I finish, improve, document, and notice all count as real value.",
    mantra: "I am learning to leave a clearer trail of my work.",
    lessonId: "lesson-communication"
  },
  {
    id: "affirm-pacing-2",
    topic: "pacing",
    text: "I refuse to confuse urgency with importance. The quality of my understanding protects the quality of my work.",
    mantra: "Depth is a strength, not a delay.",
    lessonId: "lesson-async-await"
  },
  {
    id: "affirm-pacing-3",
    topic: "pacing",
    text: "I can move gently and still move seriously. My pace makes room for thoughtfulness, which saves me from avoidable chaos later.",
    mantra: "I build at a pace that can hold.",
    lessonId: "lesson-git-flow"
  },
  {
    id: "affirm-imposter-syndrome-2",
    topic: "imposter syndrome",
    text: "I am not required to relitigate my belonging every morning. My work, growth, and presence already answer that question.",
    mantra: "Belonging is not up for daily review.",
    lessonId: "lesson-brag-doc"
  },
  {
    id: "affirm-imposter-syndrome-3",
    topic: "imposter syndrome",
    text: "Feeling unsure does not cancel my skill. I can be stretched, learning, and still entirely legitimate in the room.",
    mantra: "Uncertainty and capability can exist together.",
    lessonId: "lesson-feedback"
  },
  {
    id: "affirm-mistakes-2",
    topic: "mistakes",
    text: "I can make a mistake without making it my identity. Repair is more useful than shame, and I know how to repair.",
    mantra: "I recover with clarity and self-respect.",
    lessonId: "lesson-fetch-patterns"
  },
  {
    id: "affirm-mistakes-3",
    topic: "mistakes",
    text: "Real builders misread things, miss things, and learn things. What matters is how honestly and calmly I respond next.",
    mantra: "I am allowed to be imperfect and still professional.",
    lessonId: "lesson-git-flow"
  },
  {
    id: "affirm-comparison-2",
    topic: "comparison",
    text: "I release the fantasy that someone else's timeline should fit my life. My progress becomes stronger when it becomes mine.",
    mantra: "I measure my path by truth, not by noise.",
    lessonId: "lesson-crud"
  },
  {
    id: "affirm-comparison-3",
    topic: "comparison",
    text: "I do not need to rush to keep up with an edited version of someone else's story. My work can be quiet, deep, and still excellent.",
    mantra: "My pace and path are allowed to be personal.",
    lessonId: "lesson-brag-doc"
  },
  {
    id: "affirm-communication-2",
    topic: "communication",
    text: "Precision is a kindness in technical work. I can ask better questions, give clearer updates, and make collaboration easier for everyone.",
    mantra: "My clarity creates momentum.",
    lessonId: "lesson-communication"
  },
  {
    id: "affirm-communication-3",
    topic: "communication",
    text: "I am allowed to pause and get specific. The more clearly I name the issue, the faster the right help can find me.",
    mantra: "Specificity is one of my strengths.",
    lessonId: "lesson-feedback"
  }
];
