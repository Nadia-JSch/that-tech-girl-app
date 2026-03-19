import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  affirmations,
  lessonResources,
  themes,
  type ThemeKey,
} from "./data/content";
import { getDailyPair } from "./lib/daily";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import bash from "highlight.js/lib/languages/bash";
import markdown from "highlight.js/lib/languages/markdown";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("markdown", markdown);

type JournalEntry = {
  text: string;
  tag?: string;
  emoji?: string;
  createdAt: string;
};

type GeneratedContent = {
  affirmation: string;
  mantra: string;
  lessonTitle: string;
  lessonSummary: string;
  bullets: string[];
  snippet: string;
  ritualSteps: string[];
  archiveAffirmations: Array<{
    topic: string;
    mantra: string;
  }>;
  inspirationIdeas: Array<{
    label: string;
    title: string;
    description: string;
  }>;
};

type RevisionNote = {
  topic: string;
  question: string;
  answer: string;
  codeExample: string | null;
  tip: string;
};

type CachedDailyContent = {
  cacheKey: string;
  content: GeneratedContent;
};

type CachedRevisionCard = {
  cacheKey: string;
  content: RevisionNote;
  sourceFile: string;
};

const themeOrder = Object.keys(themes) as ThemeKey[];
const storageKeys = {
  theme: "that-tech-girl.theme",
  journal: "that-tech-girl.journal",
  claimed: "that-tech-girl.claimed-day",
  dark: "that-tech-girl.dark-mode",
  dailyAi: "that-tech-girl.daily-ai",
  dailyRevision: "that-tech-girl.daily-revision",
  preferredTopic: "that-tech-girl.preferred-topic"
};

const navItems = [
  { id: "ritual", label: "Ritual" },
  { id: "protocol", label: "Protocol" },
  { id: "lesson", label: "Lesson" },
  { id: "revision", label: "Revision" },
  { id: "win-log", label: "Win log" },
  { id: "bug-spray", label: "Bug spray" },
  { id: "palette", label: "Palette" }
];

const miniAffirmationTemplates = [
  "That's not luck. That's skill with a receipt.",
  "Imposter syndrome has no evidence. You do.",
  "Another data point that you belong here.",
  "The record shows: competence.",
  "You did that. On purpose. With your brain.",
  "Future you will read this and feel so seen.",
  "Filed under: things a fake person couldn't do.",
  "Your evidence file is getting thick.",
  "Proof of brilliance, softly logged.",
  "You are not winging it. You are adapting in real time.",
  "Every tiny win still counts as a win.",
  "Competence can be quiet and still be undeniable.",
  "This is your reminder that you know what you're doing.",
  "The receipts are glowing today.",
  "A very elegant display of technical range.",
  "Not accidental. Not random. Entirely you.",
  "This belongs in the archive of iconic things you've done."
];

const loadingMessages = [
  "Consulting the cosmos...",
  "Channeling goddess energy...",
  "Aligning your stars...",
  "The universe is listening...",
  "Manifesting your success...",
  "The compile gods are pondering...",
  "Aligning your vibes...",
  "Pulling a prettier timeline...",
  "Reading the code tea leaves...",
  "Syncing with your soft-launch destiny...",
  "Decorating the stack with good omens...",
  "Fetching a fresh little prophecy...",
  "Tuning the frequency of your next win...",
  "Recalculating your main character arc..."
];

const journalCompliments = [
  "The compile gods are pleased.",
  "Your code is giving main character energy.",
  "This ship has been logged in the universe.",
  "The stack overflowed with joy.",
  "Your git history just got more interesting.",
  "The PR gods have accepted this offering.",
  "Your branch was merged successfully.",
  "This win has been committed to memory.",
  "The algorithm is shook.",
  "Your future self is obsessed with this entry.",
  "This is what a person who belongs here sounds like.",
  "The evidence board just got hotter.",
  "Your technical aura has been updated.",
  "A deeply chic display of competence.",
  "The system recognizes this as a real win.",
  "This entry has strong promotion-review energy.",
  "Your progress log is getting impossible to argue with."
];

const footerMessages = [
  "/* running on caffeine and good intentions */",
  "/* built with sparkle motion and chaos */",
  "/* vibes: immaculate, code: questionable */",
  "/* this app is giving main character */",
  "/* don't let the console logs bite */",
  "/* literally vibrating with potential */",
  "/* bestie energy: ACTIVE */",
  "/* the documentation said no but we did it anyway */",
  "/* polished enough to deploy, chaotic enough to be fun */",
  "/* soft life, hard skills */",
  "/* pretty interface, serious problem-solving */",
  "/* emotionally supported by syntax highlighting */",
  "/* currently romanticizing the backlog */",
  "/* all sparkle, no imposter */",
  "/* beauty, brains, and browser storage */"
];

const buildIdeas = [
  {
    label: "App idea",
    title: "Build a CRUD studio for your own life",
    description:
      "Use your CRUD, API, and async JS practice to build something personal: a job-application tracker, a content planner, a study dashboard, or a bug log that actually feels good to use."
  },
  {
    label: "AI workflow",
    title: "Design a vibe-coded sidekick with guardrails",
    description:
      "Pair AI generation with your own judgment: let the model draft UI states, copy, or test cases, then use JavaScript and Git discipline to shape it into something reliable."
  },
  {
    label: "Emergent tech",
    title: "Create an MCP-style tool that connects context",
    description:
      "As you get better at APIs and communication, you can build small tools that let AI assistants read docs, notes, tickets, or product data with the right permissions and structure."
  },
  {
    label: "Career leverage",
    title: "Turn communication into technical force multiplication",
    description:
      "The same skills you're practicing here can become demos, internal tools, onboarding helpers, PR bots, research assistants, or product prototypes that make teams move faster."
  },
  {
    label: "Portfolio move",
    title: "Make a tiny dashboard for your strongest habits",
    description:
      "Track sleep, study streaks, applications, workouts, or mood with a small polished UI and thoughtful CRUD flows that actually show product taste."
  },
  {
    label: "Frontend flex",
    title: "Build a ritual-based UI with state that feels magical",
    description:
      "Use transitions, local storage, and friendly copy to make a daily experience feel personal without overcomplicating the code."
  },
  {
    label: "Automation",
    title: "Create a soft little workflow bot for repetitive tasks",
    description:
      "Turn recurring chores into scripts or mini tools: file cleanup, note formatting, issue triage, changelog drafting, or meeting-summary generation."
  },
  {
    label: "Learning system",
    title: "Turn revision into a spaced-repetition studio",
    description:
      "Combine flashcards, snippets, confidence ratings, and tiny prompts into a study tool that feels more like a lifestyle app than homework."
  },
  {
    label: "Team tool",
    title: "Design a handoff helper that reduces unclear updates",
    description:
      "Build a form or assistant that helps teammates write better status notes, bug reports, or PR summaries with consistent structure."
  },
  {
    label: "Creative tech",
    title: "Make a mood-based recommendation engine",
    description:
      "Blend tagged content, playful prompts, and lightweight logic to recommend music, tasks, tutorials, or affirmations based on energy level."
  },
  {
    label: "Career visibility",
    title: "Build your brag doc as an actual product",
    description:
      "Turn your wins, feedback, metrics, and screenshots into a searchable personal archive so advocating for yourself gets easier over time."
  }
];

const vibeCheckResponses = [
  "The vibes are immaculate, queen.",
  "We're glitching but we're coping.",
  "The universe says: yes, obviously.",
  "Your aura is pixel-perfect.",
  "Serving server energy.",
  "Serving main character energy.",
  "The algorithm is shook but in a good way.",
  "Vibes: certified baddie.",
  "Cosmic approval: granted.",
  "The signal is clear: you're still that girl.",
  "Your aura is compiling beautifully.",
  "Energy report: soft, sharp, and dangerous.",
  "Romanticizing the backlog is working.",
  "The readout says: chic and capable.",
  "Your frequency is set to quietly iconic.",
  "The system detects elegant resilience.",
  "Current mood: glitter with boundaries.",
  "You are serving calm technical authority.",
  "The stars say push the branch.",
  "Your energy is half velvet, half debugger.",
  "A gentle reminder that your brain is elite.",
  "The dashboard says you ate, actually.",
  "Signal strength: main-character with receipts.",
  "Today's read: polished, powerful, and unbothered."
];

const bugSprayResponses: Record<string, string> = {
  meeting: "MEETING ELIMINATED. The docs said no but we did it anyway.",
  meetings: "MEETINGS: GONE. Your calendar is now pristine. You're welcome.",
  slack: "SLACK NOTIFICATIONS: OBLITERATED. Peace has been restored to your mental state.",
  "slack notifications": "NOTIFICATIONS: VAPORIZED. Your phone can sleep now.",
  "tech debt": "TECH DEBT: SPRAYED INTO OBLIVION. The code gods are shook.",
  bugs: "BUGS: EXTERMINATED. Another one bites the dust.",
  bug: "BUG: TERMINATED. Your code is now 100% less buggy.",
  "imposter syndrome": "IMPOSTER SYNDROME: INVALIDATED. You belong here. That's final.",
  procrastination: "PROCRASTINATION: GONE. Your productivity just leveled up.",
  burnout: "BURNOUT: SPRAYED AWAY. Self-care has entered the chat.",
  friday: "FRIDAY FEELINGS: ACTIVATED. The weekend is near.",
  monday: "MONDAY MOODS: ELIMINATED. You're built for this.",
  "pull request": "PR REVIEW: COMPLETED. The merge is imminent.",
  "merge conflict": "MERGE CONFLICT: DISSOLVED. Git is now your servant.",
  deployment: "DEPLOYMENT: SUCCESS. Ship it and dip.",
  debugging: "DEBUGGING: DONE. The bug never stood a chance.",
  deadline: "DEADLINE: EXTENDED (mentally). You've got this.",
  "performance issue": "PERFORMANCE: OPTIMIZED. It goes brrrrr now.",
  "memory leak": "MEMORY LEAK: PATCHED. Your RAM can finally rest.",
  "null pointer": "NULL POINTER: HANDLED. The undefined is now defined.",
  default: "SPRAYED AND DISMISSED. That thing doesn't stand a chance."
};

const evidenceTags = [
  { emoji: "🐛", label: "Fixed a bug" },
  { emoji: "🚀", label: "Shipped something" },
  { emoji: "💡", label: "Figured it out" },
  { emoji: "🗣️", label: "Spoke up" },
  { emoji: "🤝", label: "Helped someone" },
  { emoji: "📚", label: "Learned something new" },
  { emoji: "🔥", label: "Survived a hard day" },
  { emoji: "✍️", label: "Wrote good code" },
  { emoji: "🧠", label: "Solved something tricky" },
  { emoji: "🪄", label: "Made it smoother" },
  { emoji: "🎯", label: "Got unstuck" },
  { emoji: "📣", label: "Shared progress" },
  { emoji: "🧩", label: "Connected the dots" },
  { emoji: "💻", label: "Finished a feature" },
  { emoji: "🌱", label: "Stayed consistent" },
  { emoji: "✨", label: "Had a breakthrough" },
];

const evidenceReframes = [
  "That's not luck. That's skill with a receipt.",
  "Imposter syndrome has no evidence. You do.",
  "Filed under: things a fake person couldn't do.",
  "Your brain lied. Your git log didn't.",
  "Evidence collected. Case closed.",
  "Another data point that you belong here.",
  "The record shows: competence.",
  "Noted, logged, and undeniable.",
  "You did that. On purpose. With your brain.",
  "Future you will read this and feel so seen.",
  "This is what progress looks like in real life, not in a highlight reel.",
  "You are building proof faster than doubt can keep up.",
  "Tiny wins still count as evidence when they are real.",
  "Your growth is documented now, which is inconvenient for your inner hater.",
  "There is nothing accidental about repeated competence.",
  "This goes in the folder marked: absolutely capable.",
  "You keep doing hard things and then pretending it was normal.",
  "The facts remain glamorous and in your favor.",
  "Real skill often looks quieter than panic expects.",
  "Even on a weird day, the evidence is still evidence.",
];

const ritualByTopic = {
  confidence: [
    "Read the affirmation out loud once.",
    "Pick one moment today where you will speak first.",
    "Carry the lesson phrasing into your next meeting.",
    "Write down one technical thing you explained well today.",
    "Strike a power pose before your next high-stakes call.",
    "Recall a time you fixed a 'unfixable' bug.",
    "Compliment a teammate on their technical logic today.",
    "Say one idea before you over-edit it in your head.",
    "Write your next question down exactly as it is and ask it anyway.",
    "List three things you know now that you did not know six months ago.",
    "Notice one place where your instinct was correct before the proof arrived."
  ],
  learning: [
    "Read the affirmation and underline the skill word that fits today.",
    "Choose one tiny concept to practice for ten focused minutes.",
    "Save the lesson snippet somewhere you will reuse it.",
    "Explain a new concept to a 'rubber duck' or a non-tech friend.",
    "Read one page of documentation for a tool you use every day.",
    "Identify one 'magic' part of your stack and look under the hood.",
    "Write a 3-sentence summary of one thing you learned today.",
    "Turn one confusing term into a flashcard or note.",
    "Practice one tiny example instead of consuming more content.",
    "Highlight the exact sentence in the docs that unlocked the concept.",
    "Revisit one thing you learned last week so it sticks."
  ],
  feedback: [
    "Take a breath before attaching meaning to critique.",
    "Turn the note into one clear follow-up question.",
    "Write down the exact improvement you want to make next.",
    "Celebrate the fact that someone cared enough to review your work.",
    "Find one positive piece of feedback and save it in your brag doc.",
    "Ask for feedback on a specific part of your code you're unsure about.",
    "Give someone else high-quality, supportive feedback today.",
    "Translate one comment into a concrete code change before spiraling.",
    "Separate tone from substance and respond to the useful part first.",
    "Write down what you agree with before deciding what to question.",
    "Thank someone for precision, not just for approval."
  ],
  debugging: [
    "Read the affirmation slowly and commit to staying methodical.",
    "Reduce the bug to one reproducible case.",
    "Use the lesson trick before you escalate the problem.",
    "Take a 5-minute screen break if the logic isn't flowing.",
    "Explain the bug out loud to see if the gap becomes obvious.",
    "Check your assumptions—is the server actually running?",
    "Check the logs for one specific keyword you usually ignore.",
    "Write the expected behavior in one sentence before testing again.",
    "Remove one moving part so the bug has fewer places to hide.",
    "Confirm the data shape instead of trusting the interface in your head.",
    "Leave yourself one note about the fix so future you feels protected."
  ],
  career: [
    "Read the affirmation and picture one room you belong in.",
    "Choose one action that makes your work more visible.",
    "Use the lesson to remove friction from your workflow.",
    "Reach out to one person whose work you admire for a 15-min chat.",
    "Update your LinkedIn or portfolio with one recent win.",
    "Block out 'focus time' on your calendar for deep technical work.",
    "Read back through your brag document to remind yourself of your range.",
    "Write one sentence about your current role that sounds like leadership.",
    "Note one business outcome your work improved, even indirectly.",
    "Document one process you understand well enough to teach someone else.",
    "Pick one small move that future-you would call strategic."
  ],
  visibility: [
    "Write down one task you completed this week that required real skill.",
    "Share one small progress update in a place your team already looks.",
    "Add one useful sentence to a doc, ticket, or handover note.",
    "Name one quiet contribution you made that kept work moving.",
    "Finish one task in a way that leaves a clearer trail for the next person.",
    "Notice where your work is already visible without forcing a performance.",
    "Pick one low-pressure way to let your work be seen today.",
    "Share a before-and-after when you fix something messy.",
    "Post one concise update that names progress, not just effort.",
    "Mention one decision you made and why it mattered.",
    "Leave one thoughtful note that makes your judgment visible."
  ],
  pacing: [
    "Name one thing you're understanding more deeply because you did not rush it.",
    "Break today's work into the smallest step that still counts as real progress.",
    "Replace one 'I should be faster' thought with a concrete next action.",
    "Give yourself twenty focused minutes without checking how other people are moving.",
    "Write down one place where slowing down prevented a bigger mess.",
    "Choose depth over speed for one part of today's work on purpose.",
    "End the day by noting what became clearer because you stayed with it.",
    "Close one tab that is making you feel rushed instead of focused.",
    "Choose a finish line for this session that is honest, not aspirational.",
    "Protect one block of uninterrupted time like it matters, because it does.",
    "Notice how much better your thinking gets when you stop narrating your pace."
  ],
  "imposter syndrome": [
    "Open your brag doc, commits, or shipped work and read three pieces of evidence out loud.",
    "Name one hard thing you handled recently that a newer version of you could not have done.",
    "Write down one reason you are still trusted with real work here.",
    "Notice where your brain is making feelings sound like facts and separate the two.",
    "Ask yourself what proof you would accept from a friend in your exact position.",
    "List one thing you learned this month that proves you are still growing, not faking it.",
    "Keep one visible reminder of your own evidence nearby for the rest of the day.",
    "Read one old message that proves someone trusted your judgment.",
    "Write down what is actually expected of you today, not what fear invented.",
    "Let being in progress count as being real.",
    "Name one area where your standards are higher than your actual performance requirement."
  ],
  mistakes: [
    "Name one mistake from this week in neutral language, without turning it into a personality trait.",
    "Write what the mistake taught you or clarified, even if the lesson is simply 'slow down here.'",
    "Decide on one tiny prevention step instead of replaying the whole moment.",
    "Notice how much energy goes into shame, then redirect some of it into repair.",
    "Treat one misstep like debugging data: what happened, why, and what changes next time?",
    "Remember one time you recovered well after getting something wrong.",
    "Say the sentence 'I made a mistake, and I am still a competent person' once without arguing with it.",
    "Write the fix before you write the self-criticism.",
    "Separate impact from identity in one sentence.",
    "Apologize clearly if needed, then stop performing punishment.",
    "Notice how repair is usually more useful than rumination."
  ],
  comparison: [
    "Catch one comparison thought and rewrite it as information, not a verdict.",
    "Name one metric that actually matters in your life right now.",
    "Write down one thing you are building that would not show up on someone else's highlight reel.",
    "Unfollow, mute, or step away from one input that reliably makes you feel behind.",
    "List two ways your path already fits your real circumstances better than a copied timeline would.",
    "Pick one personal measure of progress for today and ignore the rest.",
    "Read back your last three journal entries as if a friend wrote them.",
    "Name one invisible strength in your process that public timelines never show.",
    "Replace one envy spiral with one action that belongs to your own path.",
    "Remember that speed, visibility, and depth are not the same metric.",
    "Choose admiration without turning it into self-erasure."
  ],
  communication: [
    "Ask one clarifying question earlier than you usually would.",
    "Rewrite one vague message so it says what you tried, what you need, and what happens next.",
    "Practice saying 'I need one more piece of context before I move' without apologizing.",
    "Notice one moment today where clarity saved time or confusion.",
    "Write down one question you are avoiding and ask it in the lowest-stakes channel available.",
    "Name one communication habit that makes your work easier for other people to follow.",
    "End one update with a direct next step instead of leaving it open-ended.",
    "Swap one soft vague phrase for a precise sentence.",
    "State one assumption out loud before it quietly becomes a bug.",
    "Use a short bullet list when the message has more than one moving part.",
    "Ask yourself whether your update answers: what changed, what matters, what next."
  ]
} as const;

const formatDate = (dayKey: string) =>
  new Date(`${dayKey}T00:00:00`).toLocaleDateString("en-ZA", {
    weekday: "long",
    month: "long",
    day: "numeric"
  });

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) return "Late-night debugging energy.";
  if (hour < 12) return "Good morning, pixel empress.";
  if (hour < 17) return "Afternoon focus mode.";
  if (hour < 21) return "Golden hour coding.";
  return "Night owl energy activated.";
};

const renderInlineMarkdown = (text: string) => {
  const segments = text.split(/(\*\*.*?\*\*)/g).filter(Boolean);

  return segments.map((segment, index) => {
    if (segment.startsWith("**") && segment.endsWith("**")) {
      return <strong key={`${segment}-${index}`}>{segment.slice(2, -2)}</strong>;
    }

    return <span key={`${segment}-${index}`}>{segment}</span>;
  });
};

const readJsonStorage = <T,>(key: string) => {
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
};

const App = () => {
  // Topic is determined by the daily rotation, not user selection
  const dailyPair = useMemo(() => getDailyPair(new Date()), []);
  const [theme, setTheme] = useState<ThemeKey>("clean-girl-coder");
  const [darkMode, setDarkMode] = useState(false);
  const [journalText, setJournalText] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [claimedDay, setClaimedDay] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [generatedCacheKey, setGeneratedCacheKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [revision, setRevision] = useState<RevisionNote | null>(null);
  const [revisionSource, setRevisionSource] = useState("");
  const [revisionCacheKey, setRevisionCacheKey] = useState("");
  const [isLoadingRevision, setIsLoadingRevision] = useState(false);
  const [revisionError, setRevisionError] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [vibeMessage, setVibeMessage] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");
  const [sprayInput, setSprayInput] = useState("");
  const [sprayResult, setSprayResult] = useState("");
  const [selectedTag, setSelectedTag] = useState<{ emoji: string; label: string } | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeSection, setActiveSection] = useState("ritual");
  const initialCacheKeyRef = useRef<string | null>(null);

  const cacheKey = dailyPair.dayKey;

  const [footerMessage] = useState(
    () => footerMessages[Math.floor(Math.random() * footerMessages.length)]
  );

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(storageKeys.theme) as ThemeKey | null;
    const savedJournal = readJsonStorage<JournalEntry[]>(storageKeys.journal);
    const savedClaimed = window.localStorage.getItem(storageKeys.claimed);
    const savedDark = window.localStorage.getItem(storageKeys.dark);
    if (savedTheme && themeOrder.includes(savedTheme)) {
      setTheme(savedTheme);
    }
    if (savedJournal) {
      setEntries(savedJournal);
    }
    if (savedClaimed) {
      setClaimedDay(savedClaimed);
    }
    if (savedDark) {
      setDarkMode(savedDark === "true");
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const savedDailyAi = readJsonStorage<CachedDailyContent>(storageKeys.dailyAi);
    const savedRevision = readJsonStorage<CachedRevisionCard>(storageKeys.dailyRevision);

    if (savedDailyAi?.cacheKey === cacheKey) {
      setGenerated(savedDailyAi.content);
      setGeneratedCacheKey(cacheKey);
    } else {
      setGenerated(null);
      setGeneratedCacheKey("");
    }

    if (savedRevision?.cacheKey === cacheKey) {
      setRevision(savedRevision.content);
      setRevisionSource(savedRevision.sourceFile);
      setRevisionCacheKey(cacheKey);
    } else {
      setRevision(null);
      setRevisionSource("");
      setRevisionCacheKey("");
    }
  }, [cacheKey, isHydrated]);

  const isMidnightTheme = theme === "midnight-coder";
  const effectiveDarkMode = darkMode && !isMidnightTheme;

  useEffect(() => {
    const classes = [themes[theme].surfaceClass, effectiveDarkMode ? "dark-mode" : ""].filter(Boolean);
    document.body.className = classes.join(" ");
    window.localStorage.setItem(storageKeys.theme, theme);
    window.localStorage.setItem(storageKeys.dark, String(darkMode));
  }, [theme, darkMode, effectiveDarkMode]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.journal, JSON.stringify(entries));
  }, [entries]);

  const preferredTopicForApi = dailyPair.affirmation.topic;

  useEffect(() => {
    if (generated && generatedCacheKey === cacheKey) {
      const payload: CachedDailyContent = {
        cacheKey,
        content: generated
      };
      window.localStorage.setItem(storageKeys.dailyAi, JSON.stringify(payload));
    }
  }, [cacheKey, generated, generatedCacheKey]);

  useEffect(() => {
    if (revision && revisionSource && revisionCacheKey === cacheKey) {
      const payload: CachedRevisionCard = {
        cacheKey,
        content: revision,
        sourceFile: revisionSource
      };
      window.localStorage.setItem(storageKeys.dailyRevision, JSON.stringify(payload));
    }
  }, [cacheKey, revision, revisionCacheKey, revisionSource]);

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entriesList) => {
        const visible = entriesList
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveSection(visible.target.id);
        }
      },
      {
        rootMargin: "-35% 0px -45% 0px",
        threshold: [0.2, 0.4, 0.6]
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const isClaimed = claimedDay === dailyPair.dayKey;
  const journalAffirmation =
    miniAffirmationTemplates[entries.length % miniAffirmationTemplates.length];

  const ritualSteps = useMemo(() => {
    const allSteps = ritualByTopic[dailyPair.affirmation.topic];
    const dayHash = dailyPair.dayKey.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

    return [
      allSteps[dayHash % allSteps.length],
      allSteps[(dayHash + 1) % allSteps.length],
      allSteps[(dayHash + 2) % allSteps.length]
    ];
  }, [dailyPair.affirmation.topic, dailyPair.dayKey]);

  const archiveCards =
    generated?.archiveAffirmations ??
    affirmations
      .filter((entry) => entry.id !== dailyPair.affirmation.id)
      .slice(0, 3)
      .map((entry) => ({ topic: entry.topic, mantra: entry.mantra }));
  const displayAffirmation = generated?.affirmation ?? dailyPair.affirmation.text;
  const displayMantra = generated?.mantra ?? dailyPair.affirmation.mantra;
  const displayLessonTitle = generated?.lessonTitle ?? dailyPair.lesson.title;
  const displayLessonSummary = generated?.lessonSummary ?? dailyPair.lesson.summary;
  const displayLessonBullets = generated?.bullets ?? dailyPair.lesson.bullets;
  const rawSnippet = generated?.snippet ?? dailyPair.lesson.snippet ?? "";
  const displaySnippet = useMemo(() => {
    if (!rawSnippet || rawSnippet.includes("\n")) return rawSnippet;
    let depth = 0;
    return rawSnippet
      .replace(/([;{}])\s*/g, (_, ch) => {
        if (ch === "{") { depth++; return "{\n" + "  ".repeat(depth); }
        if (ch === "}") { depth = Math.max(0, depth - 1); return "\n" + "  ".repeat(depth) + "}"; }
        return ";\n" + "  ".repeat(depth);
      });
  }, [rawSnippet]);
  const displayRitualSteps = generated?.ritualSteps ?? ritualSteps;
  const displayInspirationIdeas = generated?.inspirationIdeas ?? buildIdeas;
  const currentLessonResources = lessonResources[dailyPair.lesson.id] ?? [];
  const aiStatusLabel = isGenerating
    ? loadingMessage || "Loading today's AI ritual..."
    : generated
      ? `AI ritual cached for ${formatDate(dailyPair.dayKey)}`
      : "Preparing today's AI ritual";
  const aiStatusNote = generated
    ? "Generate a new ritual overwrites today's cached ideas, lesson, and affirmations for this topic."
    : "The app generates one AI ritual per day for your selected topic and stores it locally.";
  const themeModeNote = isMidnightTheme
    ? "Midnight Coder already includes its own dark look."
    : darkMode
      ? `${themes[theme].name} with dark mode enabled.`
      : `${themes[theme].name} with light mode enabled.`;
  const activeThemeCapability = isMidnightTheme
    ? "Built-in midnight mode"
    : effectiveDarkMode
      ? "Dark mode enabled"
      : "Light mode enabled";
  const activeThemeSupportCopy = isMidnightTheme
    ? "This palette already lives in its own dark world. No extra mode switch needed."
    : "This palette can switch between light and dark mode, so the vibe stays the same while the lighting changes.";

  const claimRitual = () => {
    window.localStorage.setItem(storageKeys.claimed, dailyPair.dayKey);
    setClaimedDay(dailyPair.dayKey);
    setShareMessage("Keep that energy for your next task.");
  };

  const saveJournal = () => {
    if (!journalText.trim() && !selectedTag) return;

    const text = journalText.trim() || (selectedTag ? selectedTag.label : "");
    setEntries([
      {
        text,
        tag: selectedTag?.label,
        emoji: selectedTag?.emoji,
        createdAt: new Date().toLocaleDateString("en-ZA", {
          month: "short",
          day: "numeric"
        })
      },
      ...entries
    ]);
    setJournalText("");
    setSelectedTag(null);
    const reframe = evidenceReframes[Math.floor(Math.random() * evidenceReframes.length)];
    setShareMessage(reframe);
  };

  const clearJournalHistory = () => {
    setEntries([]);
    setShareMessage("Your local win log has been cleared.");
  };

  const shareDailyCard = async () => {
    const text = `${displayMantra}\n${displayAffirmation}\n\nGlow-up tip: ${displayLessonTitle}\n${displayLessonSummary}`;

    if (navigator.share) {
      await navigator.share({
        title: "Soft Focus Code",
        text
      });
      setShareMessage("Shared from your ritual card.");
      return;
    }

    await navigator.clipboard.writeText(text);
    setShareMessage("Share text copied to clipboard.");
  };

  const copySnippet = async () => {
    if (!displaySnippet) return;
    try {
      await navigator.clipboard.writeText(displaySnippet);
      setCopiedSnippet(true);
      window.setTimeout(() => setCopiedSnippet(false), 1600);
    } catch {
      setCopiedSnippet(false);
    }
  };

  const handleBugSpray = () => {
    if (!sprayInput.trim()) return;
    const normalized = sprayInput.toLowerCase().trim();
    const response = bugSprayResponses[normalized] || bugSprayResponses.default;
    setSprayResult(response);
    setSprayInput("");
  };

  const usePrompt = (prompt: string) => {
    setJournalText((current) => (current ? `${current}\n${prompt} ` : `${prompt} `));
  };

  const fetchRevisionNote = useCallback(async (force = false) => {
    if (!force) {
      const cachedRevision = readJsonStorage<CachedRevisionCard>(storageKeys.dailyRevision);
      if (cachedRevision?.cacheKey === cacheKey) {
        setRevision(cachedRevision.content);
        setRevisionSource(cachedRevision.sourceFile);
        setRevisionCacheKey(cacheKey);
        setRevisionError("");
        setShowAnswer(false);
        return;
      }
    }

    setIsLoadingRevision(true);
    setRevisionError("");
    setShowAnswer(false);

    try {
      const response = await fetch("/api/revision-note");
      const data = (await response.json()) as
        | { content: RevisionNote; sourceFile: string }
        | { error: string };

      if (!response.ok || !("content" in data)) {
        throw new Error("error" in data ? data.error : "Failed to load revision note.");
      }

      setRevision(data.content);
      setRevisionSource(data.sourceFile.replace(/\.md$/, "").replace(/^\d+-/, "").replaceAll("-", " "));
      setRevisionCacheKey(cacheKey);
    } catch (error) {
      setRevisionError(error instanceof Error ? error.message : "Failed to load revision note.");
    } finally {
      setIsLoadingRevision(false);
    }
  }, [cacheKey]);

  const generateDaily = useCallback(async (force = false) => {
    if (!force) {
      const cachedDailyAi = readJsonStorage<CachedDailyContent>(storageKeys.dailyAi);
      if (cachedDailyAi?.cacheKey === cacheKey) {
        setGenerated(cachedDailyAi.content);
        setGeneratedCacheKey(cacheKey);
        return;
      }
    }

    setIsGenerating(true);
    setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);

    try {
      const response = await fetch("/api/generate-daily", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          theme,
          topic: preferredTopicForApi,
          experienceLevel: "early-career"
        })
      });

      const data = (await response.json()) as
        | { content: GeneratedContent }
        | { error: string; details?: string };

      if (!response.ok || !("content" in data)) {
        throw new Error("error" in data ? data.error : "Generation failed.");
      }

      setGenerated(data.content);
      setGeneratedCacheKey(cacheKey);
      setShareMessage("Your new ritual has been manifested.");
    } catch (error) {
      setShareMessage(error instanceof Error ? error.message : "The universe said no.");
    } finally {
      setIsGenerating(false);
      setLoadingMessage("");
    }
  }, [cacheKey, theme, preferredTopicForApi]);

  useEffect(() => {
    if (!isHydrated) return;

    if (initialCacheKeyRef.current === null) {
      initialCacheKeyRef.current = cacheKey;
    } else if (initialCacheKeyRef.current !== cacheKey) {
      return;
    }

    const cachedDailyAi = readJsonStorage<CachedDailyContent>(storageKeys.dailyAi);
    if (cachedDailyAi?.cacheKey !== cacheKey) {
      void generateDaily();
    }

    const cachedRevision = readJsonStorage<CachedRevisionCard>(storageKeys.dailyRevision);
    if (cachedRevision?.cacheKey !== cacheKey) {
      void fetchRevisionNote();
    }
  }, [cacheKey, isHydrated, generateDaily, fetchRevisionNote]);

  return (
    <div className="app-shell">
      <nav className="top-nav" aria-label="Page sections">
        <a className="nav-brand" href="#ritual">
          Soft Focus Code
        </a>
        <div className="nav-links">
          {navItems.map((item) => (
            <a
              key={item.id}
              className={activeSection === item.id ? "nav-link active" : "nav-link"}
              href={`#${item.id}`}
              aria-current={activeSection === item.id ? "location" : undefined}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <header id="ritual" className="hero-shell">
        <motion.section
          className="hero-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="hero-top-row">
            <span className="hero-date">{formatDate(dailyPair.dayKey)}</span>
            {isMidnightTheme ? (
              <span className="eyebrow mood-toggle mood-toggle-static">{activeThemeCapability}</span>
            ) : (
              <button
                className="secondary tiny mood-toggle"
                type="button"
                onClick={() => setDarkMode((value) => !value)}
                aria-pressed={effectiveDarkMode}
                aria-label={effectiveDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {effectiveDarkMode ? "Switch to light" : "Switch to dark"}
              </button>
            )}
          </div>

          <div className="hero-main">
            <div className="hero-intro">
              <h1>Soft Focus Code</h1>
              <p className="hero-tagline">{getGreeting()}</p>
              <p className="hero-copy">
                Daily affirmations, mini lessons, and AI-powered revision cards from{" "}
                <a href="https://www.pgofcode.co.za/coding-notes/" target="_blank" rel="noopener noreferrer">
                  these coding notes
                </a>
                .
              </p>
            </div>
            <img
              className="hero-cat-img"
              src="/incredible-suggestion.jpg"
              alt="A cat surrounded by pointing hands with the text 'incredible suggestion'"
            />
          </div>

          <div className="hero-affirmation">
            <span className="badge">{dailyPair.affirmation.topic}</span>
            <blockquote className="hero-affirmation-quote">{displayAffirmation}</blockquote>
            <p className="hero-mantra">{displayMantra}</p>
          </div>

          <div className="hero-actions">
            <button className={isClaimed ? "primary claimed" : "primary"} type="button" onClick={claimRitual}>
              {isClaimed ? "Claimed for today" : "Claim today's ritual"}
            </button>
            <button className="secondary" type="button" onClick={shareDailyCard}>
              Share card
            </button>
            <button className="secondary" type="button" onClick={() => void generateDaily(true)} disabled={isGenerating}>
              {isGenerating ? (loadingMessage || "Generating...") : "Pull a new card"}
            </button>
          </div>

          {shareMessage && (
            <p className={shareMessage.includes("Missing") || shareMessage.includes("failed") || shareMessage.includes("error")
              ? "hero-status-error"
              : "hero-toast"
            }>{shareMessage}</p>
          )}
        </motion.section>

        <motion.div
          className="mood-strip"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
        >
          <button
            className="mood-strip-card mood-strip-lesson"
            type="button"
            onClick={() => document.getElementById("lesson")?.scrollIntoView({ behavior: "smooth", block: "start" })}
          >
            <span className="mood-stat-label">{dailyPair.lesson.category} focus</span>
            <p className="mood-stat-title">{displayLessonTitle}</p>
          </button>

          <button
            className="mood-strip-card mood-strip-vibe"
            type="button"
            onClick={() => {
              setVibeMessage(vibeCheckResponses[Math.floor(Math.random() * vibeCheckResponses.length)]);
            }}
          >
            <span className="mood-stat-label">Vibe check</span>
            <p className="mood-vibe-result" aria-live="polite">
              {vibeMessage || "Tap for today's energy read."}
            </p>
          </button>

          <div className="mood-strip-card mood-strip-support">
            <div>
              <p className="mood-support-message">
                Your soft little reminder that you can absolutely do this.
              </p>
            </div>
            <img
              className="hero-support-img"
              src="/you-can-do-this-cat.jpg"
              alt="A cat with a note that says you can do this"
            />
          </div>
        </motion.div>
      </header>

      <main className="main-grid">
        <motion.section
          id="protocol"
          className="card ritual-stage"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
        >
          <div className="section-head">
            <div className="eyebrow-row">
              <span className="eyebrow">Implementation steps</span>
              <span className="eyebrow">{dailyPair.affirmation.topic}</span>
            </div>
            <h2>Daily Protocol</h2>
            <p className="section-copy">Execute these moves to integrate today&apos;s technical energy.</p>
          </div>

          <div className="ritual-steps">
            {displayRitualSteps.map((step, index) => (
              <article key={step} className="step-card">
                <span className="step-index">0{index + 1}</span>
                <p>{renderInlineMarkdown(step)}</p>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="lesson"
          className="card lesson-stage"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
        >
          <div className="section-head">
            <div className="eyebrow-row">
              <span className="eyebrow">Glow-up lesson</span>
              <span className="badge">{dailyPair.lesson.category}</span>
            </div>
            <h2>{displayLessonTitle}</h2>
          </div>

          <p className="section-copy">{displayLessonSummary}</p>

          <div className="ritual-steps">
            {displayLessonBullets.map((bullet) => (
              <article key={bullet} className="step-card">
                <span className="step-index">✦</span>
                <p>{renderInlineMarkdown(bullet)}</p>
              </article>
            ))}
          </div>

          {displaySnippet && (
            <div className="mood-stat lesson-resource-card">
              <strong>Code snippet</strong>
              <pre>
                <code
                  className="hljs"
                  dangerouslySetInnerHTML={{
                    __html: hljs.highlightAuto(displaySnippet, ["javascript", "bash", "markdown"]).value,
                  }}
                />
              </pre>
              <button className="secondary snippet-action" type="button" onClick={copySnippet}>
                {copiedSnippet ? "Copied" : "Copy snippet"}
              </button>
            </div>
          )}

          {currentLessonResources.length > 0 && (
            <div className="resource-list">
              <span className="eyebrow">Go deeper</span>
              <div className="resource-links">
                {currentLessonResources.map((resource) => (
                  <a key={resource.href} className="resource-link" href={resource.href} target="_blank" rel="noopener noreferrer">
                    {resource.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </motion.section>

        <motion.section
          id="revision"
          className="card revision-stage"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
        >
          <div className="section-head">
            <div className="eyebrow-row">
              <span className="eyebrow">Revision flashcard</span>
              {revision && <span className="badge">{revision.topic}</span>}
            </div>
            <h2>Quick recall from your notes</h2>
          </div>

          <div className="cta-row">
            <button
              className="primary"
              type="button"
              onClick={() => void fetchRevisionNote()}
              disabled={isLoadingRevision}
            >
              {isLoadingRevision ? "Loading..." : revision ? "Open today's card" : "Start recall session"}
            </button>
            <span className="soft-note">Keyboard-friendly reveal flow with one cached card per day and topic.</span>
          </div>

          {revisionError && <p className="eyebrow revision-error-chip">{revisionError}</p>}

          {revision && (
            <div className="mood-stat">
              <strong>Question from {revisionSource}</strong>
              <p className="revision-question">{revision.question}</p>

              <button
                className="secondary"
                type="button"
                onClick={() => setShowAnswer(!showAnswer)}
                aria-expanded={showAnswer}
              >
                {showAnswer ? "Hide answer" : "Reveal answer"}
              </button>

              {showAnswer && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="revision-answer">
                  <p>{revision.answer}</p>
                  {revision.codeExample && (
                    <pre className="revision-code">
                      <code>{revision.codeExample}</code>
                    </pre>
                  )}
                  <div className="badge revision-tip-chip">TIP: {revision.tip}</div>
                </motion.div>
              )}
            </div>
          )}
        </motion.section>

        <motion.section
          id="win-log"
          className="card journal-stage"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
        >
          <div className="section-head">
            <div className="eyebrow-row">
              <span className="eyebrow">Evidence file</span>
              {entries.length > 0 && <span className="badge">{entries.length} logged</span>}
            </div>
            <h2>Build your case against imposter syndrome</h2>
            <p className="section-copy">Every entry is proof. Tap what you did, add details if you want, and log it.</p>
          </div>

          <div className="evidence-tags">
            {evidenceTags.map((tag) => (
              <button
                key={tag.label}
                className={selectedTag?.label === tag.label ? "evidence-tag active" : "evidence-tag"}
                type="button"
                onClick={() => setSelectedTag(selectedTag?.label === tag.label ? null : tag)}
              >
                <span className="evidence-tag-emoji">{tag.emoji}</span>
                {tag.label}
              </button>
            ))}
          </div>

          <label className="sr-only" htmlFor="journal-input">
            Add details (optional)
          </label>
          <textarea
            id="journal-input"
            className="journal-input"
            placeholder={selectedTag ? `What happened? (optional — "${selectedTag.label}" is enough)` : "What did you do today that a fake person couldn't?"}
            value={journalText}
            onChange={(event) => setJournalText(event.target.value)}
          />

          <div className="cta-row">
            <button className="primary" type="button" onClick={saveJournal} disabled={!journalText.trim() && !selectedTag}>
              Log evidence
            </button>
            {entries.length > 0 && (
              <button className="secondary" type="button" onClick={clearJournalHistory}>
                Clear all
              </button>
            )}
          </div>

          {entries.length > 0 && (
            <div className="evidence-history">
              <div className="evidence-count-bar">
                <span className="eyebrow">{entries.length} piece{entries.length === 1 ? "" : "s"} of evidence</span>
                <p className="evidence-reframe">{journalAffirmation}</p>
              </div>
              <div className="evidence-entries">
                {entries.map((entry) => (
                  <article key={`${entry.createdAt}-${entry.text}`} className="evidence-entry">
                    {entry.emoji && <span className="evidence-entry-emoji">{entry.emoji}</span>}
                    <div className="evidence-entry-content">
                      <p>{entry.text}</p>
                      <span className="evidence-entry-date">{entry.createdAt}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </motion.section>

        <motion.section
          id="inspiration"
          className="card inspiration-stage chapter-unlocks"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
        >
          <div className="section-head">
            <span className="eyebrow">What this unlocks</span>
            <h2>Ways to use the skills you&apos;re building</h2>
          </div>
          <div className="archive-grid inspiration-grid">
            {displayInspirationIdeas.map((idea) => (
              <article key={idea.title} className="archive-card inspiration-card">
                <span className="badge">{idea.label}</span>
                <p>{idea.title}</p>
                <span className="soft-note inspiration-copy">{idea.description}</span>
              </article>
            ))}
          </div>

          <div className="affirmation-strip">
            <span className="eyebrow">More affirmations</span>
            <div className="affirmation-strip-cards">
              {archiveCards.map((entry) => (
                <div key={`${entry.topic}-${entry.mantra}`} className="affirmation-strip-card">
                  <span className="badge">{entry.topic}</span>
                  <p>{entry.mantra}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          id="bug-spray"
          className="card bug-spray-stage"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
        >
          <div className="section-head">
            <span className="eyebrow">Emergency Bug Spray</span>
            <h2>Spray away your technical annoyances</h2>
          </div>

          <p className="section-copy">
            Having a rough day? Type what&apos;s bothering you and hit spray. Watch it disappear (metaphorically).
          </p>

          <form
            className="spray-input-row"
            onSubmit={(event) => {
              event.preventDefault();
              handleBugSpray();
            }}
          >
            <label className="sr-only" htmlFor="spray-input">
              Type the annoyance you want to spray away
            </label>
            <input
              id="spray-input"
              type="text"
              className="spray-input"
              placeholder="meetings, tech debt, bugs..."
              value={sprayInput}
              onChange={(e) => setSprayInput(e.target.value)}
            />
            <button className="primary spray-btn" type="submit">
              Spray it away
            </button>
          </form>

          {sprayResult && (
            <motion.div
              className="spray-result"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="spray-emoji" aria-hidden="true">
                💨
              </span>
              <p>{sprayResult}</p>
            </motion.div>
          )}
        </motion.section>

        <motion.section
          id="palette"
          className="card settings-stage"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
        >
          <div className="section-head compact">
            <div>
              <span className="eyebrow">Personalize it</span>
              <h2>Choose your palette and app mode</h2>
            </div>
          </div>

          <div className="theme-stage-layout">
            <aside className="theme-feature-card">
              <span className="eyebrow">Current palette</span>
              <h3>{themes[theme].name}</h3>
              <p className="theme-feature-description">{themes[theme].description}</p>
              <div className="theme-feature-meta">
                <span className="badge">{activeThemeCapability}</span>
                <span className="eyebrow eyebrow-wrap">{themeModeNote}</span>
              </div>
              <p className="theme-mode-copy">{activeThemeSupportCopy}</p>
            </aside>

            <div className="theme-grid">
              {themeOrder.map((themeKey) => (
                <button
                  key={themeKey}
                  className={themeKey === theme ? "theme-tile active" : "theme-tile"}
                  type="button"
                  onClick={() => setTheme(themeKey)}
                >
                  <strong>{themes[themeKey].name}</strong>
                  <span>{themes[themeKey].description}</span>
                  <small>{themeKey === "midnight-coder" ? "Built-in dark theme" : "Light and dark modes"}</small>
                </button>
              ))}
            </div>
          </div>
        </motion.section>

      </main>

      <footer className="app-footer">
        <p>{footerMessage}</p>
        <div className="footer-link-row">
          <a href="https://www.pgofcode.co.za/" target="_blank" rel="noopener noreferrer">
            Pg of Code
          </a>
          <a href="https://github.com/Nadia-JSch/that-tech-girl-app" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
        <p className="footer-privacy">All data stored locally in your browser. AI-generated content is for inspiration only.</p>
      </footer>
    </div>
  );
};

export default App;
