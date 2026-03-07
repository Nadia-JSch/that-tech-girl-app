import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const notesDir = join(process.cwd(), "../blog-app/src/content/coding-notes");
const targetDir = join(process.cwd(), "notes");

mkdirSync(targetDir, { recursive: true });

const files = readdirSync(notesDir).filter((file) => file.endsWith(".md"));
const notes = files.map((filename) => ({
  filename,
  content: readFileSync(join(notesDir, filename), "utf-8")
}));

writeFileSync(join(targetDir, "notes.json"), JSON.stringify(notes, null, 2));
console.log(`Generated ${notes.length} note(s) for Cloudflare Workers.`);
