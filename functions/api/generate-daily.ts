const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });

const buildPrompt = ({ theme, topic, experienceLevel }: Record<string, string>) => `You are writing content for a hyper-feminine but smart women-in-tech PWA.

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

interface CFContext {
  request: Request;
  env: { GEMINI_API_KEY?: string };
}

export const onRequestPost = async (context: CFContext) => {
  const { request, env } = context;

  // Robustly find the API key even if it has sneaky trailing spaces in the dashboard
  const apiKey = env.GEMINI_API_KEY || (env as any)["GEMINI_API_KEY "];

  if (!apiKey) {
    return jsonResponse({ 
      error: "Missing GEMINI_API_KEY", 
      message: "Please ensure GEMINI_API_KEY is set in Settings > Build & deployments > Variables and Secrets > Production (check for trailing spaces in the name!)"
    }, 500);
  }

  const payload = await request.json().catch(() => ({}));
  const body = {
    theme: typeof payload.theme === "string" ? payload.theme : "coquette-compiler",
    topic: typeof payload.topic === "string" ? payload.topic : "confidence",
    experienceLevel: typeof payload.experienceLevel === "string" ? payload.experienceLevel : "early-career"
  };

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent",
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
            parts: [{ text: buildPrompt(body) }]
          }
        ],
        generation_config: {
          temperature: 0.9,
          response_mime_type: "application/json"
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    return jsonResponse({ error: "Gemini request failed", details: errorText }, response.status);
  }

  try {
    const content = await parseJsonResponse(response);
    return jsonResponse({ content });
  } catch (error) {
    return jsonResponse({ error: "Failed to parse Gemini response", details: (error as Error).message }, 500);
  }
};
