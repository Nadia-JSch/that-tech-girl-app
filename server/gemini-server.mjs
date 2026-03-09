import { createServer } from "node:http";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import "dotenv/config";

const port = Number(process.env.API_PORT || 8787);
const apiKey = process.env.GROQ_API_KEY;
const notesDir = process.env.NOTES_DIR || join(import.meta.dirname, "../../blog-app/src/content/coding-notes");

const sendJson = (res, status, body) => {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(body));
};

const groqChat = async (prompt, temperature = 0.9) => {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
};

const buildPrompt = ({ theme, topic, experienceLevel }) => `You are writing content for a hyper-feminine but smart women-in-tech PWA.

Brand voice:
- playful, glossy, over-the-top, coquette, a little ironic
- still technically credible and useful
- never patronizing, vague, or cringe
- keep output concise

Task:
Generate one daily affirmation ritual and one matching micro-lesson.

The lesson must actually teach something small and concrete.
Do not write vague encouragement about learning.
Pick one specific concept, workflow, or communication move and explain it clearly enough that a beginner could use it today.

Inputs:
- theme: ${theme}
- topic: ${topic}
- experience level: ${experienceLevel}

Preferred lesson focus:
- CRUD flows
- working with APIs
- async JavaScript patterns
- Git workflows
- communication at work

Prefer JavaScript-oriented examples unless the topic is clearly communication-focused.

Supported affirmation topics:
- confidence
- learning
- feedback
- debugging
- career
- visibility
- pacing
- imposter syndrome
- mistakes
- comparison
- communication

Topic guidance:
- visibility: Generate content about quiet, consistent contribution. Do not frame value as being loud or performative. Ritual steps should focus on low-pressure visibility like sharing a small win in standup, leaving a useful note in a doc, or making work easier to find later.
- pacing: Generate content that validates working at a thoughtful pace. Reframe slowness as depth-building and sustainable, not falling behind. Include practical steps for working without guilt.
- imposter syndrome: Ground the content in evidence, not vague reassurance. Point to proof like still being employed, still shipping, still learning, or still being trusted with real work. Ritual steps should include concrete evidence-gathering like checking a brag doc or recent wins.
- mistakes: Treat mistakes as professional data, not character evidence. Use debugging-minded framing for self-perception. Ritual steps should involve naming one specific mistake neutrally and deciding on one repair or prevention step.
- comparison: Gently interrupt timeline comparison spirals. Focus on the difference between inspiration and measurement. Ritual steps should redirect attention to personal metrics, current season of life, and actual priorities.
- communication: Reframe asking questions and seeking clarification as a professional strength. Mention that strong engineers and writers ask good questions early. Ritual steps should include one low-stakes communication practice for the day.

Return JSON only with this exact shape:
{
  "affirmation": "string",
  "mantra": "string",
  "lessonTitle": "string",
  "lessonSummary": "string",
  "bullets": ["string", "string", "string"],
  "snippet": "string",
  "ritualSteps": ["string", "string", "string"],
  "archiveAffirmations": [
    { "topic": "string", "mantra": "string" },
    { "topic": "string", "mantra": "string" },
    { "topic": "string", "mantra": "string" }
  ],
  "inspirationIdeas": [
    { "label": "string", "title": "string", "description": "string" },
    { "label": "string", "title": "string", "description": "string" },
    { "label": "string", "title": "string", "description": "string" },
    { "label": "string", "title": "string", "description": "string" }
  ]
}

Rules:
- affirmation: 1-2 sentences
- mantra: short and punchy
- lesson: practical, technically correct, and educational; it should explain one specific idea, not just say what the user should learn
- lessonTitle: name the concrete concept or move being taught, not a vague aspiration
- lessonSummary: 1-2 sentences that explain what the concept is, why it matters, and when to use it
- bullets: exactly 3; each bullet should teach a real point, step, distinction, or debugging insight
- ritualSteps: exactly 3
- archiveAffirmations: exactly 3 distinct extra affirmations that fit the app voice and can draw from any supported topic, including visibility, pacing, imposter syndrome, mistakes, comparison, and communication
- inspirationIdeas: exactly 4 concrete, inspiring ideas tied to building with CRUD, APIs, async JS, Git, workplace communication, AI workflows, vibe coding, MCPs, or adjacent emergent tooling
- snippet: either a short code snippet or a short workplace phrase that directly matches the lesson and demonstrates the concept
- align the lesson to the same topic as the affirmation
- keep the tone warm, a little witty, and emotionally honest; this app is for someone who doubts themselves more than they should, so avoid motivational-poster language`;

const pickRandomNote = async () => {
  const files = (await readdir(notesDir)).filter((f) => f.endsWith(".md"));

  if (files.length === 0) {
    throw new Error("No coding notes found in notes directory.");
  }

  const file = files[Math.floor(Math.random() * files.length)];
  const content = await readFile(join(notesDir, file), "utf-8");
  return { filename: file, content };
};

const buildRevisionPrompt = (noteContent, noteFilename) => `You are a study buddy for a women-in-tech learning app.

You have been given the student's own coding notes. Pick ONE specific concept from these notes and create a bite-sized revision flashcard.

Brand voice:
- supportive, clear, encouraging
- technically accurate
- keep it short and useful

Notes file: ${noteFilename}
---
${noteContent}
---

Return JSON only with this exact shape:
{
  "topic": "string (the specific concept picked, e.g. 'SVG viewBox attribute')",
  "question": "string (a short question to test recall)",
  "answer": "string (a concise 1-3 sentence answer)",
  "codeExample": "string or null (a short code snippet if relevant)",
  "tip": "string (a memorable one-liner to help remember this)"
}

Rules:
- Pick something specific, not a broad topic
- The question should test understanding, not just memory
- The code example should be short (3 lines max) or null if not applicable
- Make the tip catchy and sticky`;

createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.url === "/api/revision-note" && req.method === "GET") {
    if (!apiKey) {
      sendJson(res, 500, { error: "Missing GROQ_API_KEY on the server." });
      return;
    }

    try {
      const note = await pickRandomNote();
      const content = await groqChat(buildRevisionPrompt(note.content, note.filename), 0.7);
      sendJson(res, 200, { content, sourceFile: note.filename });
    } catch (error) {
      sendJson(res, 500, {
        error: "Failed to generate revision note.",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
    return;
  }

  if (req.url !== "/api/generate-daily" || req.method !== "POST") {
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  if (!apiKey) {
    sendJson(res, 500, { error: "Missing GROQ_API_KEY on the server." });
    return;
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const body = JSON.parse(Buffer.concat(chunks).toString() || "{}");
    const payload = {
      theme: body.theme || "coquette-compiler",
      topic: body.topic || "confidence",
      experienceLevel: body.experienceLevel || "early-career"
    };

    const content = await groqChat(buildPrompt(payload), 0.9);
    sendJson(res, 200, { content });
  } catch (error) {
    sendJson(res, 500, {
      error: "Failed to generate content.",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}).listen(port, () => {
  console.log(`Groq API server listening on http://127.0.0.1:${port}`);
});
