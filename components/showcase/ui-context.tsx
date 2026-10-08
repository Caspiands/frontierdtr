"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import documentTree from "@/content/document-tree";
import { TABS, buildIdIndex } from "@/lib/document";
import type { DocNode } from "@/lib/types";

type Theme = "light" | "dark";

type UiValue = {
  tab: string;
  setTab: (id: string, opts?: { scroll?: boolean; scrollTo?: string }) => void;
  idToTab: Record<string, string>;
  filters: Record<string, string>;
  setFilter: (tableId: string, query: string) => void;
  ganttWs: number | "all";
  ganttOwner: number | "all";
  setGanttWs: (value: number | "all") => void;
  setGanttOwner: (value: number | "all") => void;
  theme: Theme;
  toggleTheme: () => void;
};

const UiContext = createContext<UiValue | null>(null);
const root = documentTree as unknown as DocNode;
const idToTab = buildIdIndex(root);

const tabListeners = new Set<() => void>();
let tabSnapshot = "overview";
let tabReady = false;

const themeListeners = new Set<() => void>();
let themeSnapshot: Theme = "light";
let themeReady = false;

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function computeInitialTab() {
  const hash = window.location.hash.replace(/^#/, "");
  if ((TABS as readonly string[]).includes(hash)) return hash;
  if (hash && idToTab[hash]) return idToTab[hash];
  try {
    const saved = localStorage.getItem("qhs-dtr-tab");
    if (saved && (TABS as readonly string[]).includes(saved)) return saved;
  } catch {
    /* ignore private-mode storage */
  }
  return "overview";
}

function publishTab(next: string) {
  tabSnapshot = next;
  tabReady = true;
  tabListeners.forEach((listener) => listener());
}

function getTab() {
  if (typeof window === "undefined") return "overview";
  if (!tabReady) {
    tabReady = true;
    tabSnapshot = computeInitialTab();
  }
  return tabSnapshot;
}

function subscribeTab(listener: () => void) {
  tabListeners.add(listener);
  return () => tabListeners.delete(listener);
}

function publishTheme(next: Theme) {
  themeSnapshot = next;
  themeReady = true;
  themeListeners.forEach((listener) => listener());
}

function getTheme(): Theme {
  if (typeof window === "undefined") return "light";
  if (!themeReady) {
    themeReady = true;
    const stored = document.documentElement.getAttribute("data-theme");
    if (stored === "dark" || stored === "light") themeSnapshot = stored;
    else themeSnapshot = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return themeSnapshot;
}

function subscribeTheme(listener: () => void) {
  themeListeners.add(listener);
  return () => themeListeners.delete(listener);
}

export function UiProvider({ children }: { children: React.ReactNode }) {
  const tab = useSyncExternalStore(subscribeTab, getTab, () => "overview");
  const theme = useSyncExternalStore(subscribeTheme, getTheme, () => "light" as const);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [ganttWs, setGanttWs] = useState<number | "all">("all");
  const [ganttOwner, setGanttOwner] = useState<number | "all">("all");
  const pending = useRef<string | null>(null);

  const setTab = useCallback((id: string, opts?: { scroll?: boolean; scrollTo?: string }) => {
    pending.current = opts?.scrollTo ?? null;
    try {
      localStorage.setItem("qhs-dtr-tab", id);
    } catch {
      /* ignore */
    }
    const hash = opts?.scrollTo || id;
    if (window.history.replaceState) window.history.replaceState(null, "", `#${hash}`);
    publishTab(id);
    if (!opts?.scrollTo && opts?.scroll !== false) {
      window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
    }
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const target = pending.current || (hash && idToTab[hash] && !(TABS as readonly string[]).includes(hash) ? hash : "");
    pending.current = null;
    if (!target) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(target)?.scrollIntoView({
        behavior: reducedMotion() ? "auto" : "smooth",
        block: "start",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [tab]);

  const toggleTheme = useCallback(() => {
    const next: Theme = getTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("qhs-dtr-theme", next);
    } catch {
      /* ignore */
    }
    publishTheme(next);
  }, []);

  const value = useMemo(
    () => ({
      tab,
      setTab,
      idToTab,
      filters,
      setFilter: (tableId: string, query: string) => setFilters((current) => ({ ...current, [tableId]: query })),
      ganttWs,
      ganttOwner,
      setGanttWs,
      setGanttOwner,
      theme,
      toggleTheme,
    }),
    [tab, setTab, filters, ganttWs, ganttOwner, theme, toggleTheme],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const value = useContext(UiContext);
  if (!value) throw new Error("UI is unavailable.");
  return value;
}
