import { getSession } from "@/lib/auth";
import { readOverrides, sanitise, writeOverrides } from "@/lib/content-store";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in to read the roadmap." }, { status: 401 });
  const overrides = await readOverrides();
  return Response.json(overrides);
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Your session has ended. Sign in again." }, { status: 401 });
  if (session.role !== "editor") {
    return Response.json({ error: "This account can only read the roadmap." }, { status: 403 });
  }
  let body: { texts?: unknown };
  try {
    body = (await request.json()) as { texts?: unknown };
  } catch {
    return Response.json({ error: "The edits could not be read." }, { status: 400 });
  }
  try {
    const texts = sanitise(body.texts);
    await writeOverrides(texts);
    return Response.json({ ok: true, savedAt: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save your edits.";
    return Response.json({ error: message }, { status: 400 });
  }
}
