"use client";

import { createContext, useContext, useState } from "react";
import documentTree from "@/content/document.json";
import { Button } from "@/components/ui/button";
import { useContent } from "@/components/showcase/content-context";
import { Editable } from "@/components/showcase/editable";
import { GanttChart, GanttSelect } from "@/components/showcase/gantt-chart";
import { useUi } from "@/components/showcase/ui-context";
import { WeekList } from "@/components/showcase/week-list";
import { TABS, cellAt, cellVal, collectText, hasClass, parseStyle } from "@/lib/document";
import type { DocNode } from "@/lib/types";

const root = documentTree as unknown as DocNode;

const ChartContext = createContext<{ showTable: boolean; toggle: () => void } | null>(null);
const SortContext = createContext<{
  tableId: string;
  sort: { col: number; dir: "ascending" | "descending" } | null;
  setSort: (col: number) => void;
} | null>(null);

function SaveBanner() {
  const { role, status, error, retry } = useContent();
  if (role !== "editor" || status !== "error") return null;
  return (
    <div className="save-banner" role="alert">
      <div className="save-banner-in">
        <p>{error || "Could not save your edits. Nothing new was written."}</p>
        <Button type="button" variant="outline" onClick={retry}>
          Try again
        </Button>
      </div>
    </div>
  );
}

function SessionTools() {
  const { role, status, logout, loggingOut, logoutError } = useContent();
  const label =
    status === "saving" ? "Saving…" : status === "saved" ? "Saved" : status === "error" ? "Not saved" : role === "editor" ? "Click any text to edit" : "Read only";
  return (
    <div className="session-tools">
      <span className="role-pill">{role === "editor" ? "Editor" : "Viewer"}</span>
      <span className="save-status" data-state={status} aria-live="polite">
        {label}
      </span>
      {logoutError ? <span className="logout-error">{logoutError}</span> : null}
      <button className="theme-btn" type="button" onClick={logout} disabled={loggingOut}>
        {loggingOut ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
