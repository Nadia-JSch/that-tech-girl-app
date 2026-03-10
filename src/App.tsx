import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { affirmations, themes, type ThemeKey } from "./data/content";
import { getDailyPair } from "./lib/daily";

type JournalEntry = {
  text: string;
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
  dayKey: string;
  content: GeneratedContent;
};

type CachedRevisionCard = {
  dayKey: string;
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
  dailyRevision: "that-tech-girl.daily-revision"
};

const miniAffirmationTemplates = [
  "You showed range today. Shipping counts, even when it felt messy.",
  "That win was not luck. It was skill, judgment, and follow-through.",
  "Your consistency is building technical confidence in real time.",
  "You made progress today, and progress is what compounds.",
  "You handled that technical ambiguity with serious poise.",
  "Your perspective added value to the discussion today.",
  "You are navigating your career with intention and style.",
  "Small technical wins are the bricks that build great careers."
];

const loadingMessages = [
  "Consulting the cosmos...",
  "Channeling goddess energy...",
  "Aligning your stars...",
  "The universe is listening...",
  "Manifesting your success...",
  "The compile gods are pondering...",
  "Aligning your vibes..."
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
  "The algorithm is shook."
];

const footerMessages = [
  "/* running on caffeine and good intentions */",
  "/* built with sparkle motion and chaos */",
  "/* vibes: immaculate, code: questionable */",
  "/* this app is giving main character */",
  "/* don't let the console logs bite */",
  "/* literally vibrating with potential */",
  "/* bestie energy: ACTIVE */",
  "/* the documentation said no but we did it anyway */"
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
  "Cosmic approval: granted."
];

const bugSprayResponses: Record<string, string> = {
  "meeting": "MEETING ELIMINATED. The docs said no but we did it anyway.",
  "meetings": "MEETINGS: GONE. Your calendar is now pristine. You're welcome.",
  "slack": "SLACK NOTIFICATIONS: OBLITERATED. Peace has been restored to your mental state.",
  "slack notifications": "NOTIFICATIONS: VAPORIZED. Your phone can sleep now.",
  "tech debt": "TECH DEBT: SPRAYED INTO OBLIVION. The code gods are shook.",
  "bugs": "BUGS: EXTERMINATED. Another one bites the dust.",
  "bug": "BUG: TERMINATED. Your code is now 100% less buggy.",
  "imposter syndrome": "IMPOSTER SYNDROME: INVALIDATED. You belong here. That's final.",
  "procrastination": "PROCRASTINATION: GONE. Your productivity just leveled up.",
  "burnout": "BURNOUT: SPRAYED AWAY. Self-care has entered the chat.",
  "friday": "FRIDAY FEELINGS: ACTIVATED. The weekend is near.",
  "monday": "MONDAY MOODS: ELIMINATED. You're built for this.",
  "pull request": "PR REVIEW: COMPLETED. The merge is imminent.",
  "merge conflict": "MERGE CONFLICT: DISSOLVED. Git is now your servant.",
  "deployment": "DEPLOYMENT: SUCCESS. Ship it and dip.",
  "debugging": "DEBUGGING: DONE. The bug never stood a chance.",
  "deadline": "DEADLINE: EXTENDED (mentally). You've got this.",
  "performance issue": "PERFORMANCE: OPTIMIZED. It goes brrrrr now.",
  "memory leak": "MEMORY LEAK: PATCHED. Your RAM can finally rest.",
  "null pointer": "NULL POINTER: HANDLED. The undefined is now defined.",
  "default": "SPRAYED AND DISMISSED. That thing doesn't stand a chance."
};

const journalPrompts = [
  "I explained my thinking clearly when...",
  "I stayed calm and debugged...",
  "Something I learned faster today was...",
  "A moment I should give myself credit for is...",
  "I advocated for my technical approach by...",
  "I helped a teammate unblock themselves when...",
  "A complex concept that finally clicked today was...",
  "I prioritized my deep work today by..."
];

const ritualByTopic = {
  confidence: [
    "Read the affirmation out loud once.",
    "Pick one moment today where you will speak first.",
    "Carry the lesson phrasing into your next meeting.",
    "Write down one technical thing you explained well today.",
    "Strike a power pose before your next high-stakes call.",
    "Recall a time you fixed a 'unfixable' bug.",
    "Compliment a teammate on their technical logic today."
  ],
  learning: [
    "Read the affirmation and underline the skill word that fits today.",
    "Choose one tiny concept to practice for ten focused minutes.",
    "Save the lesson snippet somewhere you will reuse it.",
    "Explain a new concept to a 'rubber duck' or a non-tech friend.",
    "Read one page of documentation for a tool you use every day.",
    "Identify one 'magic' part of your stack and look under the hood.",
    "Write a 3-sentence summary of one thing you learned today."
  ],
  feedback: [
    "Take a breath before attaching meaning to critique.",
    "Turn the note into one clear follow-up question.",
    "Write down the exact improvement you want to make next.",
    "Celebrate the fact that someone cared enough to review your work.",
    "Find one positive piece of feedback and save it in your brag doc.",
    "Ask for feedback on a specific part of your code you're unsure about.",
    "Give someone else high-quality, supportive feedback today."
  ],
  debugging: [
    "Read the affirmation slowly and commit to staying methodical.",
    "Reduce the bug to one reproducible case.",
    "Use the lesson trick before you escalate the problem.",
    "Take a 5-minute screen break if the logic isn't flowing.",
    "Explain the bug out loud to see if the gap becomes obvious.",
    "Check your assumptions—is the server actually running?",
    "Check the logs for one specific keyword you usually ignore."
  ],
  career: [
    "Read the affirmation and picture one room you belong in.",
    "Choose one action that makes your work more visible.",
    "Use the lesson to remove friction from your workflow.",
    "Reach out to one person whose work you admire for a 15-min chat.",
    "Update your LinkedIn or portfolio with one recent win.",
    "Block out 'focus time' on your calendar for deep technical work.",
    "Read back through your brag document to remind yourself of your range."
  ],
  visibility: [
    "Write down one task you completed this week that required real skill.",
    "Share one small progress update in a place your team already looks.",
    "Add one useful sentence to a doc, ticket, or handover note.",
    "Name one quiet contribution you made that kept work moving.",
    "Finish one task in a way that leaves a clearer trail for the next person.",
    "Notice where your work is already visible without forcing a performance.",
    "Pick one low-pressure way to let your work be seen today."
  ],
  pacing: [
    "Name one thing you're understanding more deeply because you did not rush it.",
    "Break today's work into the smallest step that still counts as real progress.",
    "Replace one 'I should be faster' thought with a concrete next action.",
    "Give yourself twenty focused minutes without checking how other people are moving.",
    "Write down one place where slowing down prevented a bigger mess.",
    "Choose depth over speed for one part of today's work on purpose.",
    "End the day by noting what became clearer because you stayed with it."
  ],
  "imposter syndrome": [
    "Open your brag doc, commits, or shipped work and read three pieces of evidence out loud.",
    "Name one hard thing you handled recently that a newer version of you could not have done.",
    "Write down one reason you are still trusted with real work here.",
    "Notice where your brain is making feelings sound like facts and separate the two.",
    "Ask yourself what proof you would accept from a friend in your exact position.",
    "List one thing you learned this month that proves you are still growing, not faking it.",
    "Keep one visible reminder of your own evidence nearby for the rest of the day."
  ],
  mistakes: [
    "Name one mistake from this week in neutral language, without turning it into a personality trait.",
    "Write what the mistake taught you or clarified, even if the lesson is simply 'slow down here.'",
    "Decide on one tiny prevention step instead of replaying the whole moment.",
    "Notice how much energy goes into shame, then redirect some of it into repair.",
    "Treat one misstep like debugging data: what happened, why, and what changes next time?",
    "Remember one time you recovered well after getting something wrong.",
    "Say the sentence 'I made a mistake, and I am still a competent person' once without arguing with it."
  ],
  comparison: [
    "Catch one comparison thought and rewrite it as information, not a verdict.",
    "Name one metric that actually matters in your life right now.",
    "Write down one thing you are building that would not show up on someone else's highlight reel.",
    "Unfollow, mute, or step away from one input that reliably makes you feel behind.",
    "List two ways your path already fits your real circumstances better than a copied timeline would.",
    "Pick one personal measure of progress for today and ignore the rest.",
    "Read back your last three journal entries as if a friend wrote them."
  ],
  communication: [
    "Ask one clarifying question earlier than you usually would.",
    "Rewrite one vague message so it says what you tried, what you need, and what happens next.",
    "Practice saying 'I need one more piece of context before I move' without apologizing.",
    "Notice one moment today where clarity saved time or confusion.",
    "Write down one question you are avoiding and ask it in the lowest-stakes channel available.",
    "Name one communication habit that makes your work easier for other people to follow.",
    "End one update with a direct next step instead of leaving it open-ended."
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
  const dailyPair = useMemo(() => getDailyPair(), []);
  const [theme, setTheme] = useState<ThemeKey>("clean-girl-coder");
  const [darkMode, setDarkMode] = useState(false);
  const [journalText, setJournalText] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [claimedDay, setClaimedDay] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [revision, setRevision] = useState<RevisionNote | null>(null);
  const [revisionSource, setRevisionSource] = useState("");
  const [isLoadingRevision, setIsLoadingRevision] = useState(false);
  const [revisionError, setRevisionError] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [vibeMessage, setVibeMessage] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");
  const [sprayInput, setSprayInput] = useState("");
  const [sprayResult, setSprayResult] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(storageKeys.theme) as ThemeKey | null;
    const savedJournal = readJsonStorage<JournalEntry[]>(storageKeys.journal);
    const savedClaimed = window.localStorage.getItem(storageKeys.claimed);
    const savedDark = window.localStorage.getItem(storageKeys.dark);
    const savedDailyAi = readJsonStorage<CachedDailyContent>(storageKeys.dailyAi);
    const savedRevision = readJsonStorage<CachedRevisionCard>(storageKeys.dailyRevision);

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
    if (savedDailyAi?.dayKey === dailyPair.dayKey) {
      setGenerated(savedDailyAi.content);
    }
    if (savedRevision?.dayKey === dailyPair.dayKey) {
      setRevision(savedRevision.content);
      setRevisionSource(savedRevision.sourceFile);
    }
    setIsHydrated(true);
  }, []);

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

  useEffect(() => {
    if (generated) {
      const payload: CachedDailyContent = {
        dayKey: dailyPair.dayKey,
        content: generated
      };
      window.localStorage.setItem(storageKeys.dailyAi, JSON.stringify(payload));
    }
  }, [dailyPair.dayKey, generated]);

  useEffect(() => {
    if (revision && revisionSource) {
      const payload: CachedRevisionCard = {
        dayKey: dailyPair.dayKey,
        content: revision,
        sourceFile: revisionSource
      };
      window.localStorage.setItem(storageKeys.dailyRevision, JSON.stringify(payload));
    }
  }, [dailyPair.dayKey, revision, revisionSource]);

  const isClaimed = claimedDay === dailyPair.dayKey;
  const journalAffirmation =
    miniAffirmationTemplates[entries.length % miniAffirmationTemplates.length];
  
  const ritualSteps = useMemo(() => {
    const allSteps = ritualByTopic[dailyPair.affirmation.topic];
    const dayHash = dailyPair.dayKey.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Pick 3 steps deterministically based on the date
    return [
      allSteps[dayHash % allSteps.length],
      allSteps[(dayHash + 1) % allSteps.length],
      allSteps[(dayHash + 2) % allSteps.length]
    ];
  }, [dailyPair.affirmation.topic, dailyPair.dayKey]);

  const archiveCards = generated?.archiveAffirmations ?? affirmations
    .filter((entry) => entry.id !== dailyPair.affirmation.id)
    .slice(0, 3)
    .map((entry) => ({ topic: entry.topic, mantra: entry.mantra }));
  const displayAffirmation = generated?.affirmation ?? dailyPair.affirmation.text;
  const displayMantra = generated?.mantra ?? dailyPair.affirmation.mantra;
  const displayLessonTitle = generated?.lessonTitle ?? dailyPair.lesson.title;
  const displayLessonSummary = generated?.lessonSummary ?? dailyPair.lesson.summary;
  const displayLessonBullets = generated?.bullets ?? dailyPair.lesson.bullets;
  const displaySnippet = generated?.snippet ?? dailyPair.lesson.snippet ?? "";
  const displayRitualSteps = generated?.ritualSteps ?? ritualSteps;
  const displayInspirationIdeas = generated?.inspirationIdeas ?? buildIdeas;
  const aiStatusLabel = isGenerating
    ? loadingMessage || "Loading today's AI ritual..."
    : generated
      ? `AI ritual cached for ${formatDate(dailyPair.dayKey)}`
      : "Preparing today's AI ritual";
  const aiStatusNote = generated
    ? "Regenerate ritual overwrites today's cached ideas, lesson, and affirmations."
    : "The app generates one AI ritual per day and keeps it in local storage.";
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
    if (!journalText.trim()) return;

    setEntries([
      {
        text: journalText.trim(),
        createdAt: new Date().toLocaleDateString("en-ZA", {
          month: "short",
          day: "numeric"
        })
      },
      ...entries
    ]);
    setJournalText("");
    const compliment = journalCompliments[Math.floor(Math.random() * journalCompliments.length)];
    setShareMessage(compliment);
  };

  const shareDailyCard = async () => {
    const text = `${displayMantra}\n${displayAffirmation}\n\nGlow-up tip: ${displayLessonTitle}\n${displayLessonSummary}`;

    if (navigator.share) {
      await navigator.share({
        title: "That Tech Girl",
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
    const response = bugSprayResponses[normalized] || bugSprayResponses["default"];
    setSprayResult(response);
    setSprayInput("");
  };

  const usePrompt = (prompt: string) => {
    setJournalText((current) => (current ? `${current}\n${prompt} ` : `${prompt} `));
  };

  const fetchRevisionNote = async (force = false) => {
    if (!force) {
      const cachedRevision = readJsonStorage<CachedRevisionCard>(storageKeys.dailyRevision);
      if (cachedRevision?.dayKey === dailyPair.dayKey) {
        setRevision(cachedRevision.content);
        setRevisionSource(cachedRevision.sourceFile);
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
    } catch (error) {
      setRevisionError(error instanceof Error ? error.message : "Failed to load revision note.");
    } finally {
      setIsLoadingRevision(false);
    }
  };

  const generateWithGemini = async (force = false) => {
    if (!force) {
      const cachedDailyAi = readJsonStorage<CachedDailyContent>(storageKeys.dailyAi);
      if (cachedDailyAi?.dayKey === dailyPair.dayKey) {
        setGenerated(cachedDailyAi.content);
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
          topic: dailyPair.affirmation.topic,
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
      setShareMessage("Your new ritual has been manifested.");
    } catch (error) {
      setShareMessage(error instanceof Error ? error.message : "The universe said no.");
    } finally {
      setIsGenerating(false);
      setLoadingMessage("");
    }
  };

  useEffect(() => {
    if (!isHydrated) return;

    const cachedDailyAi = readJsonStorage<CachedDailyContent>(storageKeys.dailyAi);
    if (cachedDailyAi?.dayKey !== dailyPair.dayKey && !isGenerating) {
      void generateWithGemini();
    }

    const cachedRevision = readJsonStorage<CachedRevisionCard>(storageKeys.dailyRevision);
    if (cachedRevision?.dayKey !== dailyPair.dayKey && !isLoadingRevision) {
      void fetchRevisionNote();
    }
  }, [dailyPair.dayKey, isHydrated]);

  return (
    <div className="app-shell">
      <span className="sticker sticker-1">✨</span>
      <span className="sticker sticker-2">💖</span>
      <span className="sticker sticker-3">⭐</span>
      <span className="sticker sticker-4">🦄</span>
      <div className="marquee marquee-top" aria-hidden="true">
        <span>bows, bugs, brilliance, backups, boundaries, binaries, bestie energy</span>
      </div>

      <header className="hero-shell">
        <motion.section
          className="hero-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="hero-kicker-row">
            <div className="eyebrow-row">
              <span className="hero-ribbon">Pink Debug Diary</span>
              <span className="eyebrow">୨୧ soft launch</span>
              <span className="eyebrow">✦ browser princess ✦</span>
            </div>
            <span className="hero-date">{formatDate(dailyPair.dayKey)}</span>
          </div>
          
          <h1>That Tech Girl</h1>
          <p className="hero-copy">
            {getGreeting()} A daily uplift page for chaotic techies trying to make it. Blends mini lessons,
            bug spray, and AI-powered revision cards from <a href="https://www.pgofcode.co.za/coding-notes/" target="_blank" rel="noopener noreferrer">these coding notes</a>.
          </p>

          <div className="hero-affirmation">
            <span className="badge">{dailyPair.affirmation.topic}</span>
            <blockquote className="hero-affirmation-quote">
              {displayAffirmation}
            </blockquote>
          </div>

          <div className="hero-actions hero-actions-spaced">
            <button className={isClaimed ? "primary claimed" : "primary"} type="button" onClick={claimRitual}>
              {isClaimed ? "Claimed for today" : "Start the ritual"}
            </button>
            <button className="secondary" type="button" onClick={shareDailyCard}>
              Share today&apos;s card
            </button>
            <button className="secondary" type="button" onClick={() => void generateWithGemini(true)} disabled={isGenerating}>
              {isGenerating ? (loadingMessage || "Consulting the cosmos...") : "Regenerate ritual"}
            </button>
          </div>

          <div className="hero-foot">
            <div className="hero-status">
              <span className="eyebrow eyebrow-wrap hero-status-chip">{aiStatusLabel}</span>
              <p className="hero-status-note">{aiStatusNote}</p>
            </div>
            <div className="hero-status">
              <span className="eyebrow eyebrow-wrap hero-status-chip">{themeModeNote}</span>
              {shareMessage && <p className="hero-status-note hero-status-feedback">{shareMessage}</p>}
            </div>
          </div>
        </motion.section>

        <motion.aside
          className="mood-panel"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
        >
          <div className="moodboard-head">
            <span className="eyebrow">Daily moodboard</span>
            {isMidnightTheme ? (
              <span className="eyebrow mood-toggle mood-toggle-static">{activeThemeCapability}</span>
            ) : (
              <button
                className="secondary tiny mood-toggle"
                type="button"
                onClick={() => {
                  setDarkMode((value) => !value);
                }}
                aria-pressed={effectiveDarkMode}
              >
                {effectiveDarkMode ? "Switch to light" : "Switch to dark"}
              </button>
            )}
          </div>
          
          <img
            className="mood-img"
            src="/incredible-suggestion.jpg"
            alt="A cat surrounded by pointing hands with the text 'incredible suggestion'"
          />


          
          <div
            className="mood-stat mood-stat-link"
            onClick={() => document.getElementById("glow-up-lesson")?.scrollIntoView({ behavior: "smooth", block: "start" })}
          >
            <strong>{dailyPair.lesson.category} focus</strong>
            <span>{displayLessonTitle}</span>
          </div>

          <div className="mood-quote">
            <span className="eyebrow">Mantra</span>
            <p>{displayMantra}</p>
          </div>

          <button
            className="mood-vibe-card"
            type="button"
            onClick={() => {
              setVibeMessage(vibeCheckResponses[Math.floor(Math.random() * vibeCheckResponses.length)]);
            }}
          >
            <span className="eyebrow">Vibe check</span>
            <p className="mood-vibe-prompt">Check my vibe</p>
            <p className="mood-vibe-result" aria-live="polite">
              {vibeMessage || "Tap for today's energy read."}
            </p>
          </button>
          <div className="hero-support-card mood-support-compact">
            <div className="hero-support-copy">
              <span className="eyebrow">Support familiar</span>
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
        </motion.aside>
      </header>

      <main className="main-grid">
        <motion.section
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

        <motion.aside
          id="glow-up-lesson"
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
            <div className="mood-stat">
              <strong>Code Snippet</strong>
              <pre>
                <code>{displaySnippet}</code>
              </pre>
              <button className="secondary snippet-action" type="button" onClick={copySnippet}>
                {copiedSnippet ? "Copied" : "Copy snippet"}
              </button>
            </div>
          )}
        </motion.aside>

        <motion.section
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
              >
                {showAnswer ? "Hide answer" : "Reveal answer"}
              </button>
              
              {showAnswer && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="revision-answer"
                >
                  <p>{revision.answer}</p>
                  {revision.codeExample && (
                    <pre className="revision-code"><code>{revision.codeExample}</code></pre>
                  )}
                  <div className="badge revision-tip-chip">
                    TIP: {revision.tip}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </motion.section>

        <motion.section
          className="card journal-stage"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
        >
          <div className="section-head">
            <span className="eyebrow">Log a win</span>
            <h2>What moved because you showed up?</h2>
          </div>

          <div className="prompt-row">
            {journalPrompts.map((prompt) => (
              <button key={prompt} className="prompt-chip" type="button" onClick={() => usePrompt(prompt)}>
                {prompt}
              </button>
            ))}
          </div>

          <textarea
            className="journal-input"
            placeholder="Deployed my first feature, fixed a weird CSS issue..."
            value={journalText}
            onChange={(event) => setJournalText(event.target.value)}
          />

          <div className="cta-row">
            <button className="primary" type="button" onClick={saveJournal}>
              Save technical win
            </button>
            <span className="soft-note">Local-first storage active</span>
          </div>

          <div className="mood-quote journal-affirmation">
            <strong>Your logic is solid</strong>
            <p>{journalAffirmation}</p>
          </div>

          <div className="ritual-steps journal-entries">
            {entries.slice(0, 3).map((entry) => (
              <article key={`${entry.createdAt}-${entry.text}`} className="step-card">
                <span className="eyebrow">{entry.createdAt}</span>
                <p>{entry.text}</p>
              </article>
            ))}
          </div>
        </motion.section>
        <motion.section
          className="card archive-stage chapter-energy"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
        >
          <div className="section-head compact">
            <div>
              <span className="eyebrow">More energy</span>
              <h2>Other affirmations in the rotation</h2>
            </div>
          </div>
          <div className="archive-grid archive-energy-grid">
            {archiveCards.map((entry) => (
              <article key={`${entry.topic}-${entry.mantra}`} className="archive-card archive-energy-card">
                <span className="badge">{entry.topic}</span>
                <p>{entry.mantra}</p>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="card inspiration-stage chapter-unlocks"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
        >
          <div className="section-head compact">
            <div>
              <span className="eyebrow">What this unlocks</span>
              <h2>Ways to use the skills you're building</h2>
            </div>
          </div>
          <p className="section-copy">
            These lessons are not just for getting through tickets. They are the foundation for building useful apps,
            sharper AI workflows, and more ambitious technical experiments.
          </p>
          <div className="archive-grid inspiration-grid">
            {displayInspirationIdeas.map((idea) => (
              <article key={idea.title} className="archive-card inspiration-card">
                <span className="badge">{idea.label}</span>
                <p>{idea.title}</p>
                <span className="soft-note inspiration-copy">
                  {idea.description}
                </span>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section
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
            Having a rough day? Type what's bothering you and hit spray. Watch it disappear (metaphorically).
          </p>

          <div className="spray-input-row">
            <input
              type="text"
              className="spray-input"
              placeholder="meetings, tech debt, bugs..."
              value={sprayInput}
              onChange={(e) => setSprayInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleBugSpray()}
            />
            <button className="primary spray-btn" type="button" onClick={handleBugSpray}>
              🦋 spray
            </button>
          </div>

          {sprayResult && (
            <motion.div
              className="spray-result"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="spray-emoji">💨</span>
              <p>{sprayResult}</p>
            </motion.div>
          )}
        </motion.section>

        <motion.section
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
        <p>{footerMessages[Math.floor(Math.random() * footerMessages.length)]}</p>
        <p className="footer-link-row">
          <a href="https://www.pgofcode.co.za/" target="_blank" rel="noopener noreferrer">୨୧ pg of code ୨୧</a>
        </p>
      </footer>
    </div>
  );
};

export default App;
