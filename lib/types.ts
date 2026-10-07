export type Role = "editor" | "viewer";

export type DocNode = {
  t: string;
  id?: string;
  v?: string;
  a?: Record<string, string>;
  k?: DocNode[];
};

export type GanttItem = {
  name: string;
  kind: "build" | "run" | "cad";
  start: number;
  end: number;
};

export type GanttStream = {
  ws: string;
  owner: string;
  scope: string;
  items: GanttItem[];
  gates: { week: number; label: string }[];
};

export type WeekBlock = {
  when: string;
  title: string;
  phase: string;
  deliverables: string[];
  live: string[];
  measured: string[];
  gates: string[];
};

export type Schedule = {
  gantt: GanttStream[];
  weeks: WeekBlock[];
};

export type SaveStatus = "idle" | "saving" | "saved" | "error";
