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

const parseJsonResponse = (text: string) => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Groq did not return parseable JSON.");
  return JSON.parse(match[0]);
};

interface CFContext {
  request: Request;
  env: { GROQ_API_KEY?: string };
}

export const onRequestPost = async (context: CFContext) => {
  const { request, env } = context;

  const apiKey = env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    return jsonResponse({
      error: "Missing GROQ_API_KEY",
      message: "Please ensure GROQ_API_KEY is set in Settings > Environment Variables > Production"
    }, 500);
  }

  const payload = await request.json().catch(() => ({}));
  const body = {
    theme: typeof payload.theme === "string" ? payload.theme : "coquette-compiler",
    topic: typeof payload.topic === "string" ? payload.topic : "confidence",
    experienceLevel: typeof payload.experienceLevel === "string" ? payload.experienceLevel : "early-career"
  };

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.9,
      messages: [{ role: "user", content: buildPrompt(body) }]
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
    return jsonResponse({ content });
  } catch (error) {
    return jsonResponse({ error: "Failed to parse Groq response", details: (error as Error).message }, 500);
  }
};
