import { promises as fs } from "fs";
import path from "path";

const file = path.join(process.cwd(), "data", "overrides.json");

export type Overrides = { texts: Record<string, string> };

const KEY = /^[A-Za-z0-9:_-]{1,80}$/;

export async function readOverrides(): Promise<Overrides> {
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw) as Partial<Overrides>;
    if (!parsed || typeof parsed.texts !== "object" || parsed.texts === null || Array.isArray(parsed.texts)) {
      return { texts: {} };
    }
    return { texts: sanitise(parsed.texts) };
  } catch {
    return { texts: {} };
  }
}

export function sanitise(input: unknown): Record<string, string> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Edits must be a map of text fields.");
  }
  const texts: Record<string, string> = {};
  const entries = Object.entries(input as Record<string, unknown>);
  if (entries.length > 8000) throw new Error("Too many edited fields.");
  for (const [key, value] of entries) {
    if (!KEY.test(key)) throw new Error("An edit could not be saved.");
    if (typeof value !== "string") throw new Error("An edit could not be saved.");
    if (value.length > 10000) throw new Error("One field is too long to save.");
    texts[key] = value;
  }
  return texts;
}

export async function writeOverrides(texts: Record<string, string>) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const payload = JSON.stringify({ texts }, null, 2);
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, payload, "utf8");
  await fs.rename(tmp, file);
}
