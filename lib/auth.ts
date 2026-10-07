import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { findAccount } from "@/lib/accounts";
import type { Role } from "@/lib/types";

export const SESSION_COOKIE = "dtr_session";
const SECRET = process.env.DTR_SESSION_SECRET || "frontier-dtr-demo-secret";
const MAX_AGE = 60 * 60 * 24 * 7;

export type Session = {
  role: Role;
  email: string;
  exp: number;
};

function sign(body: string) {
  return createHmac("sha256", SECRET).update(body).digest("base64url");
}

export function encodeSession(session: Omit<Session, "exp">) {
  const payload: Session = { ...session, exp: Date.now() + MAX_AGE * 1000 };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function decodeSession(token: string | undefined | null): Session | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Session;
    if ((parsed.role !== "editor" && parsed.role !== "viewer") || typeof parsed.email !== "string") {
      return null;
    }
    if (!parsed.exp || parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getSession() {
  const jar = await cookies();
  return decodeSession(jar.get(SESSION_COOKIE)?.value);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  };
}

export function authenticate(email: string, password: string) {
  const account = findAccount(email, password);
  if (!account) return null;
  return { role: account.role, email: account.email };
}
