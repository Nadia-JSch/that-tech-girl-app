const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });

const buildPrompt = ({ theme, topic, experienceLevel }: Record<string, string>) => `You are writing content for a beginner women-in-tech PWA.

Brand voice:
- confident, professional, empowering
- grounded and authentic, not over-the-top
- technically credible and useful
- never generic, patronizing, or try-hard
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
- affirmation: 1-2 sentences, genuine and specific
- mantra: short, memorable, not generic
- lesson: practical, technically correct, and educational; it should explain one specific idea, not just say what the user should learn
- lessonTitle: name the concrete concept or move being taught, not a vague aspiration
- lessonSummary: 1-2 sentences that explain what the concept is, why it matters, and when to use it
- bullets: exactly 3, actionable; each bullet should teach a real point, step, distinction, or debugging insight
- ritualSteps: exactly 3, specific actions
- archiveAffirmations: exactly 3 distinct extra affirmations that fit the same app voice and can draw from any supported topic, including visibility, pacing, imposter syndrome, mistakes, comparison, and communication
- inspirationIdeas: exactly 4 concrete, inspiring ideas tied to building with CRUD, APIs, async JS, Git, workplace communication, AI workflows, vibe coding, MCPs, or adjacent emergent tooling
- snippet: either a short code snippet or a short workplace phrase that directly matches the lesson and demonstrates the concept
- align the lesson to the same topic as the affirmation
- keep the tone warm, a little witty, and emotionally honest; this app is for someone who doubts themselves more than they should, so avoid motivational-poster language`;

interface CFContext {
  request: Request;
  env: { GROQ_API_KEY?: string };
}

export const onRequestPost = async (context: CFContext) => {
  const { request, env } = context;

  const apiKey = env.GROQ_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: "Missing GROQ_API_KEY" }, 500);
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
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: buildPrompt(body) }],
      temperature: 0.9,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    return jsonResponse({ error: "Groq request failed", details: errorText }, response.status);
  }

  try {
    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    return jsonResponse({ content });
  } catch (error) {
    return jsonResponse({ error: "Failed to parse Groq response", details: (error as Error).message }, 500);
  }
};
