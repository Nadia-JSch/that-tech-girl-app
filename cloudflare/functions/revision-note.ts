import notesList from "../notes/notes.json" assert { type: "json" };

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

const parseJsonResponse = async (response: Response) => {
  const data = await response.json();
  const rawText =
    data.candidates?.[0]?.content?.parts?.map((part: Record<string, any>) => part.text || "").join("") ?? "";
  const match = rawText.match(/\{[\s\S]*\}/);

  if (!match) {
    throw new Error("Gemini did not return parseable JSON.");
  }

  return JSON.parse(match[0]);
};

export const config = {
  runtime: "edge"
};

export default async function onRequest(context: { request: Request; env: { GEMINI_API_KEY?: string } }) {
  const { request, env } = context;

  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing GEMINI_API_KEY" }), { status: 500 });
  }

  const notes = notesList as NoteEntry[];
  if (notes.length === 0) {
    return new Response(JSON.stringify({ error: "No coding notes available" }), { status: 500 });
  }

  const chosen = notes[Math.floor(Math.random() * notes.length)];

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
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
            parts: [{ text: buildRevisionPrompt(chosen.content, chosen.filename) }]
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
    return new Response(JSON.stringify({ error: "Gemini request failed", details: errorText }), {
      status: response.status
    });
  }

  try {
    const content = await parseJsonResponse(response);
    return new Response(JSON.stringify({ content, sourceFile: chosen.filename }), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to parse Gemini response", details: (error as Error).message }),
      { status: 500 }
    );
  }
}
