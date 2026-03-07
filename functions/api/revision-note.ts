





import notesList from "../../notes/notes.json";

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });

type NoteEntry = {
  filename: string;
  content: string;
};

const buildRevisionPrompt = (noteContent: string, noteFilename: string) => `You are a study buddy for a women-in-tech learning app.

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

const parseJsonResponse = (text: string) => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Groq did not return parseable JSON.");
  return JSON.parse(match[0]);
};

interface CFContext {
  request: Request;
  env: { GROQ_API_KEY?: string };
}

export const onRequestGet = async (context: CFContext) => {
  const { env } = context;

  const apiKey = env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    return jsonResponse({
      error: "Missing GROQ_API_KEY",
      message: "Please ensure GROQ_API_KEY is set in Settings > Environment Variables > Production"
    }, 500);
  }

  const notes = notesList as NoteEntry[];
  if (notes.length === 0) {
    return jsonResponse({ error: "No coding notes available" }, 500);
  }

  const chosen = notes[Math.floor(Math.random() * notes.length)];

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      messages: [{ role: "user", content: buildRevisionPrompt(chosen.content, chosen.filename) }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    return jsonResponse({ error: "Groq request failed", details: errorText }, response.status);
  }

  try {
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    const content = parseJsonResponse(text);
    return jsonResponse({ content, sourceFile: chosen.filename });
  } catch (error) {
    return jsonResponse({ error: "Failed to parse Groq response", details: (error as Error).message }, 500);
  }
};
