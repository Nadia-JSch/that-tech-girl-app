# That Tech Girl

A greenfield React + TypeScript PWA scaffold for a pastel affirmation and micro-learning app aimed at women in tech.

## MVP included

- Daily affirmation ritual with deterministic daily rotation
- Paired micro-lesson with copyable snippet
- Local-first journal for small wins
- Theme switching across four visual modes
- PWA manifest and service-worker setup via `vite-plugin-pwa`

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Create a local env file:

```bash
cp .env.example .env
```

3. Open `.env` and set your real Gemini key:

```bash
GEMINI_API_KEY="your_key_here"
```

4. Start the app and the local Gemini route together:

```bash
npm run dev
```

This starts:

- Vite on `http://127.0.0.1:5173`
- the local API route on `http://127.0.0.1:8787`

5. Build for production:

```bash
npm run build
```

## Deployment notes

- The Cloudflare Pages build uses the new `/cloudflare/functions` handlers (`generate-daily.ts` and `revision-note.ts`). They proxy requests to Gemini, so you no longer need the local Node server on production.
- Before deploying, run `npm run generate-notes` so the worker bundles `cloudflare/notes/notes.json` (it caches your blog’s coding notes) and redeploy when you add new files.
- Configure `GEMINI_API_KEY` via the Cloudflare dashboard (and keep it secret); the functions read it via the `env` object.
- You can still run `npm run dev` locally—the Node server provides `/api/generate-daily` and `/api/revision-note` during development while you work on the UI.

## Additional references

- Content lives in `src/data/content.ts`.
- Daily rotation logic lives in `src/lib/daily.ts`.
- The `AI remix` button calls `/api/generate-daily` and falls back to curated content if you skip the AI flow.
