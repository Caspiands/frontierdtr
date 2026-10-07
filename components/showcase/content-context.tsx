"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Role, SaveStatus } from "@/lib/types";

type ContentValue = {
  role: Role;
  email: string;
  texts: Record<string, string>;
  setText: (id: string, value: string) => void;
  status: SaveStatus;
  error: string | null;
  retry: () => void;
  logout: () => void;
  loggingOut: boolean;
  logoutError: string | null;
};

const ContentContext = createContext<ContentValue | null>(null);

export function ContentProvider({
  role,
  email,
  initialTexts,
  children,
}: {
  role: Role;
  email: string;
  initialTexts: Record<string, string>;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [texts, setTexts] = useState(initialTexts);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const textsRef = useRef(initialTexts);
  const timer = useRef<number | null>(null);
  const seq = useRef(0);

  const persist = useCallback(async () => {
    if (role !== "editor") return;
    const mine = ++seq.current;
    setStatus("saving");
    setError(null);
    try {
      const response = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: textsRef.current }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (mine !== seq.current) return;
      if (response.status === 401) {
        throw new Error("Your session has ended. Sign in again as the editor.");
      }
      if (!response.ok) {
        throw new Error(payload?.error || "Could not save your edits.");
      }
      setStatus("saved");
    } catch (caught) {
      if (mine !== seq.current) return;
      setStatus("error");
      setError(caught instanceof Error ? caught.message : "Could not save your edits.");
    }
  }, [role]);

  const setText = useCallback(
    (id: string, value: string) => {
      if (role !== "editor") return;
      const next = { ...textsRef.current, [id]: value };
      textsRef.current = next;
      setTexts(next);
      setStatus("saving");
      setError(null);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        void persist();
      }, 450);
    },
    [persist, role],
  );

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const logout = useCallback(async () => {
    setLoggingOut(true);
    setLogoutError(null);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Could not sign out.");
      router.refresh();
      router.push("/login");
    } catch {
      setLoggingOut(false);
      setLogoutError("Could not sign out. Try again.");
    }
  }, [router]);

  const value = useMemo(
    () => ({
      role,
      email,
      texts,
      setText,
      status,
      error,
      retry: () => void persist(),
      logout,
      loggingOut,
      logoutError,
    }),
    [role, email, texts, setText, status, error, persist, logout, loggingOut, logoutError],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const value = useContext(ContentContext);
  if (!value) throw new Error("Content is unavailable.");
  return value;
}
