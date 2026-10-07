import { cookies } from "next/headers";
import { authenticate, encodeSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = (await request.json()) as { email?: unknown; password?: unknown };
  } catch {
    return Response.json({ error: "Sign-in could not be read. Try again." }, { status: 400 });
  }
  if (typeof body.email !== "string" || typeof body.password !== "string" || !body.email.trim() || !body.password.trim()) {
    return Response.json({ error: "Enter the email and password." }, { status: 400 });
  }
  const account = authenticate(body.email, body.password);
  if (!account) {
    return Response.json(
      { error: "Those credentials are not recognised. Use one of the demo accounts on this page." },
      { status: 401 },
    );
  }
  const jar = await cookies();
  jar.set(SESSION_COOKIE, encodeSession(account), sessionCookieOptions());
  return Response.json({ ok: true, role: account.role });
}
