import { createServer } from "node:http";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import "dotenv/config";

const port = Number(process.env.API_PORT || 8787);
const apiKey = process.env.GEMINI_API_KEY;
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

const buildPrompt = ({ theme, topic, experienceLevel }) => `You are writing content for a hyper-feminine but smart women-in-tech PWA.

Brand voice:
- playful, glossy, over-the-top, coquette, a little ironic
- still technically credible and useful
- never patronizing, vague, or cringe
- keep output concise

Task:
Generate one daily affirmation ritual and one matching micro-lesson.

Inputs:
- theme: ${theme}
- topic: ${topic}
- experience level: ${experienceLevel}

Return JSON only with this exact shape:
{
  "affirmation": "string",
  "mantra": "string",
  "lessonTitle": "string",
  "lessonSummary": "string",
  "bullets": ["string", "string", "string"],
  "snippet": "string",
  "ritualSteps": ["string", "string", "string"]
}

Rules:
- affirmation: 1-2 sentences
- mantra: short and punchy
- lesson: practical and technically correct
- bullets: exactly 3
- ritualSteps: exactly 3
- snippet: either a short code snippet or a short workplace phrase
- align the lesson to the same topic as the affirmation`;

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

const parseJsonResponse = async (response) => {
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
  const match = text.match(/\{[\s\S]*\}/);

  if (!match) {
    throw new Error("Gemini did not return parseable JSON.");
  }

  return JSON.parse(match[0]);
};

createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.url === "/api/revision-note" && req.method === "GET") {
    if (!apiKey) {
      sendJson(res, 500, { error: "Missing GEMINI_API_KEY on the server." });
      return;
    }

    try {
      const note = await pickRandomNote();

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: buildRevisionPrompt(note.content, note.filename) }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: "application/json"
            }
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        sendJson(res, response.status, { error: "Gemini request failed.", details: errorText });
        return;
      }

      const content = await parseJsonResponse(response);
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
    sendJson(res, 500, { error: "Missing GEMINI_API_KEY on the server." });
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

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: buildPrompt(payload) }]
            }
          ],
          generationConfig: {
            temperature: 0.9,
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      sendJson(res, response.status, {
        error: "Gemini request failed.",
        details: errorText
      });
      return;
    }

    const content = await parseJsonResponse(response);
    sendJson(res, 200, { content });
  } catch (error) {
    sendJson(res, 500, {
      error: "Failed to generate content.",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}).listen(port, () => {
  console.log(`Gemini API server listening on http://127.0.0.1:${port}`);
});
