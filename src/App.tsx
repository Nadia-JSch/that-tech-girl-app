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
};

type RevisionNote = {
  topic: string;
  question: string;
  answer: string;
  codeExample: string | null;
  tip: string;
};

const themeOrder = Object.keys(themes) as ThemeKey[];
const storageKeys = {
  theme: "that-tech-girl.theme",
  journal: "that-tech-girl.journal",
  claimed: "that-tech-girl.claimed-day",
  dark: "that-tech-girl.dark-mode"
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
  ]
} as const;

const formatDate = (dayKey: string) =>
  new Date(`${dayKey}T00:00:00`).toLocaleDateString("en-ZA", {
    weekday: "long",
    month: "long",
    day: "numeric"
  });

const renderInlineMarkdown = (text: string) => {
  const segments = text.split(/(\*\*.*?\*\*)/g).filter(Boolean);

  return segments.map((segment, index) => {
    if (segment.startsWith("**") && segment.endsWith("**")) {
      return <strong key={`${segment}-${index}`}>{segment.slice(2, -2)}</strong>;
    }

    return <span key={`${segment}-${index}`}>{segment}</span>;
  });
};

const App = () => {
  const dailyPair = useMemo(() => getDailyPair(), []);
  const [theme, setTheme] = useState<ThemeKey>("coquette-compiler");
  const [darkMode, setDarkMode] = useState(false);
  const [journalText, setJournalText] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [claimedDay, setClaimedDay] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedMantra, setCopiedMantra] = useState(false);
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [revision, setRevision] = useState<RevisionNote | null>(null);
  const [revisionSource, setRevisionSource] = useState("");
  const [isLoadingRevision, setIsLoadingRevision] = useState(false);
  const [revisionError, setRevisionError] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(storageKeys.theme) as ThemeKey | null;
    const savedJournal = window.localStorage.getItem(storageKeys.journal);
    const savedClaimed = window.localStorage.getItem(storageKeys.claimed);
    const savedDark = window.localStorage.getItem(storageKeys.dark);

    if (savedTheme && themeOrder.includes(savedTheme)) {
      setTheme(savedTheme);
    }
    if (savedJournal) {
      try {
        setEntries(JSON.parse(savedJournal) as JournalEntry[]);
      } catch {
        window.localStorage.removeItem(storageKeys.journal);
      }
    }
    if (savedClaimed) {
      setClaimedDay(savedClaimed);
    }
    if (savedDark) {
      setDarkMode(savedDark === "true");
    }
  }, []);

  useEffect(() => {
    const classes = [themes[theme].surfaceClass, darkMode ? "dark-mode" : ""].filter(Boolean);
    document.body.className = classes.join(" ");
    window.localStorage.setItem(storageKeys.theme, theme);
    window.localStorage.setItem(storageKeys.dark, String(darkMode));
  }, [theme, darkMode]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.journal, JSON.stringify(entries));
  }, [entries]);

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

  const archiveCards = affirmations
    .filter((entry) => entry.id !== dailyPair.affirmation.id)
    .slice(0, 3);
  const displayAffirmation = generated?.affirmation ?? dailyPair.affirmation.text;
  const displayMantra = generated?.mantra ?? dailyPair.affirmation.mantra;
  const displayLessonTitle = generated?.lessonTitle ?? dailyPair.lesson.title;
  const displayLessonSummary = generated?.lessonSummary ?? dailyPair.lesson.summary;
  const displayLessonBullets = generated?.bullets ?? dailyPair.lesson.bullets;
  const displaySnippet = generated?.snippet ?? dailyPair.lesson.snippet ?? "";
  const displayRitualSteps = generated?.ritualSteps ?? ritualSteps;

  const claimRitual = () => {
    window.localStorage.setItem(storageKeys.claimed, dailyPair.dayKey);
    setClaimedDay(dailyPair.dayKey);
    setShareMessage("Ritual claimed. Keep that energy for your next task.");
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

  const copyMantra = async () => {
    try {
      await navigator.clipboard.writeText(displayMantra);
      setCopiedMantra(true);
      window.setTimeout(() => setCopiedMantra(false), 1600);
    } catch {
      setCopiedMantra(false);
    }
  };

  const usePrompt = (prompt: string) => {
    setJournalText((current) => (current ? `${current}\n${prompt} ` : `${prompt} `));
  };

  const fetchRevisionNote = async () => {
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

  const generateWithGemini = async () => {
    setIsGenerating(true);
    setGenerationError("");

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
      setShareMessage("AI ritual generated for today.");
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app-shell">
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
            A pocket ritual for women in tech: one hype-up, one practical move, one reminder
            that your work is real.
          </p>
          <div className="hero-actions">
            <button className={isClaimed ? "primary claimed" : "primary"} type="button" onClick={claimRitual}>
              {isClaimed ? "Claimed for today" : "Start the ritual"}
            </button>
            <button className="secondary" type="button" onClick={shareDailyCard}>
              Share today&apos;s card
            </button>
            <button className="secondary" type="button" onClick={copyMantra}>
              {copiedMantra ? "Mantra copied" : "Copy mantra"}
            </button>
          </div>
          {shareMessage && <span className="eyebrow" style={{ wordBreak: 'break-word', maxWidth: '100%' }}>{shareMessage}</span>}
        </motion.section>

        <motion.aside
          className="mood-panel"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span className="eyebrow">Daily moodboard</span>
            <button
              className="secondary tiny"
              type="button"
              onClick={() => setDarkMode((value) => !value)}
              aria-pressed={darkMode}
              style={{ flexShrink: 0 }}
            >
              {darkMode ? "Glow softly" : "Midnight mode"}
            </button>
          </div>
          
          <img
            className="mood-img"
            src="/incredible-suggestion.jpg"
            alt="A cat surrounded by pointing hands with the text 'incredible suggestion'"
          />
          
          <div className="mood-stat">
            <strong>{dailyPair.lesson.category} focus</strong>
            <span>{displayLessonTitle}</span>
          </div>
          
          <div className="mood-quote">
            <strong>Current mantra</strong>
            <p>"{displayMantra}"</p>
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
              <span className="eyebrow">Today&apos;s ritual</span>
              <span className="eyebrow">{dailyPair.affirmation.topic}</span>
            </div>
            <h2>{displayAffirmation}</h2>
            <p className="ritual-caption">Curated, glittery rituals with optional AI help.</p>
          </div>

          <div className="cta-row">
            <button className="secondary" type="button" onClick={generateWithGemini} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "✦ AI remix"}
            </button>
            {generationError && <span className="eyebrow" style={{ color: 'var(--accent-strong)' }}>{generationError}</span>}
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
              <button className="secondary" type="button" onClick={copySnippet} style={{ marginTop: '10px' }}>
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
              onClick={fetchRevisionNote}
              disabled={isLoadingRevision}
            >
              {isLoadingRevision ? "Loading..." : revision ? "Draw new card" : "Start recall session"}
            </button>
          </div>

          {revisionError && <p className="eyebrow" style={{ color: 'red' }}>{revisionError}</p>}

          {revision && (
            <div className="mood-stat">
              <strong>Question from {revisionSource}</strong>
              <p style={{ fontSize: '1.2rem', fontWeight: '600', margin: '10px 0' }}>{revision.question}</p>
              
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
                  style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed var(--line)' }}
                >
                  <p>{revision.answer}</p>
                  {revision.codeExample && (
                    <pre style={{ marginTop: '15px' }}><code>{revision.codeExample}</code></pre>
                  )}
                  <div className="badge" style={{ marginTop: '15px' }}>
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

          <div className="mood-quote" style={{ marginTop: '20px' }}>
            <strong>Your logic is solid</strong>
            <p>{journalAffirmation}</p>
          </div>

          <div className="ritual-steps" style={{ marginTop: '20px' }}>
            {entries.slice(0, 3).map((entry) => (
              <article key={`${entry.createdAt}-${entry.text}`} className="step-card">
                <span className="eyebrow">{entry.createdAt}</span>
                <p>{entry.text}</p>
              </article>
            ))}
          </div>
        </motion.section>
        <motion.section
          className="card archive-stage"
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
          <div className="archive-grid">
            {archiveCards.map((entry) => (
              <article key={entry.id} className="archive-card">
                <span className="badge">{entry.topic}</span>
                <p>{entry.mantra}</p>
              </article>
            ))}
          </div>
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
              </button>
            ))}
          </div>
        </motion.section>
      </main>

      <footer className="app-footer">
        <p>/* build version 1.0.42 -- successfully deployed -- bestie energy active */</p>
        <p style={{ marginTop: '10px' }}>
          <a href="https://www.pgofcode.co.za/" target="_blank" rel="noopener noreferrer">୨୧ pg of code ୨୧</a>
        </p>
      </footer>
    </div>
  );
};

export default App;
