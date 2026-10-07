import type { CSSProperties } from "react";
import type { DocNode } from "@/lib/types";

export const TABS = [
  "overview",
  "today",
  "audiences",
  "websites",
  "search",
  "corporate",
  "video",
  "roadmap",
] as const;

export function hasClass(node: DocNode, name: string) {
  return (node.a?.class ?? "").split(/\s+/).includes(name);
}

export function parseStyle(style?: string): CSSProperties | undefined {
  if (!style) return undefined;
  const out: Record<string, string> = {};
  for (const part of style.split(";")) {
    const idx = part.indexOf(":");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (!key || !val) continue;
    const camel = key.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
    out[camel] = val;
  }
  return out;
}

export function collectText(node: DocNode, texts: Record<string, string>): string {
  if (node.t === "#") return texts[node.id ?? ""] ?? node.v ?? "";
  return (node.k ?? []).map((child) => collectText(child, texts)).join("");
}

export function cellAt(row: DocNode, col: number) {
  const cells = (row.k ?? []).filter((child) => child.t === "td" || child.t === "th");
  return cells[col];
}

export function cellVal(text: string): number | string {
  const match = text
    .trim()
    .replace(/,/g, "")
    .match(/^[≥≤<>~≈+\s]*(-?\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : text.trim().toLowerCase();
}

export function buildIdIndex(root: DocNode) {
  const map: Record<string, string> = {};
  const walk = (node: DocNode, tab: string) => {
    const id = node.a?.id;
    let next = tab;
    if (id?.startsWith("tab-")) next = id.slice(4);
    else if (id) map[id] = next;
    node.k?.forEach((child) => walk(child, next));
  };
  walk(root, "overview");
  return map;
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
