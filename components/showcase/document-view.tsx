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

function ThemeButton() {
  const { theme, toggleTheme } = useUi();
  return (
    <button className="theme-btn" id="themeBtn" type="button" onClick={toggleTheme} suppressHydrationWarning>
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}

function FilterInput({ node }: { node: DocNode }) {
  const tableId = node.a?.["data-filter"] ?? "";
  const { texts, role } = useContent();
  const { setFilter } = useUi();
  const fallback = node.a?.placeholder ?? "";
  const id = `ph-${tableId}`;
  const label = texts[id] ?? fallback;
  return (
    <span className="filter-field">
      {role === "editor" ? (
        <span className="filter-ph">
          Field hint <Editable id={id} fallback={fallback} />
        </span>
      ) : null}
      <input
        id={node.a?.id}
        type={node.a?.type || "search"}
        aria-label={label}
        placeholder={label}
        onChange={(event) => setFilter(tableId, event.target.value)}
      />
    </span>
  );
}

function ChartBlock({ node, path }: { node: DocNode; path: string }) {
  const [showTable, setShowTable] = useState(false);
  return (
    <ChartContext.Provider value={{ showTable, toggle: () => setShowTable((current) => !current) }}>
      <div className={node.a?.class}>
        {(node.k ?? []).map((child, index) => (
          <NodeView key={`${path}.${index}`} node={child} path={`${path}.${index}`} index={index} />
        ))}
      </div>
    </ChartContext.Provider>
  );
}

function SmartTable({ node, path }: { node: DocNode; path: string }) {
  const sortable = hasClass(node, "sortable");
  const [sort, setSortState] = useState<{ col: number; dir: "ascending" | "descending" } | null>(null);
  const setSort = (col: number) => {
    setSortState((current) => {
      if (current?.col === col && current.dir === "ascending") return { col, dir: "descending" };
      return { col, dir: "ascending" };
    });
  };
  return (
    <SortContext.Provider value={{ tableId: node.a?.id ?? "", sort: sortable ? sort : null, setSort }}>
      <table className={node.a?.class} id={node.a?.id}>
        {(node.k ?? []).map((child, index) => (
          <NodeView key={`${path}.${index}`} node={child} path={`${path}.${index}`} index={index} />
        ))}
      </table>
    </SortContext.Provider>
  );
}

function NodeView({ node, path, index = 0 }: { node: DocNode; path: string; index?: number }) {
  const ui = useUi();
  const { role, texts } = useContent();
  const chart = useContext(ChartContext);
  const sort = useContext(SortContext);

  if (node.t === "#") return <Editable id={node.id ?? path} fallback={node.v ?? ""} />;
  if (node.a?.id === "themeBtn") return <ThemeButton />;
  if (node.a?.id === "gantt") {
    return (
      <div className="g-in" id="gantt">
        <GanttChart />
      </div>
    );
  }
  if (node.a?.id === "weeks") {
    return (
      <div id="weeks">
        <WeekList />
      </div>
    );
  }
  if (node.a?.id === "gWs" || node.a?.id === "gOwner") return <GanttSelect node={node} />;
  if (node.a?.["data-filter"]) return <FilterInput node={node} />;
  if (hasClass(node, "mast-in")) {
    return (
      <div className="mast-in">
        {(node.k ?? []).map((child, childIndex) => (
          <NodeView key={`${path}.${childIndex}`} node={child} path={`${path}.${childIndex}`} index={childIndex} />
        ))}
        <SessionTools />
      </div>
    );
  }
  if (node.t === "main") {
    return (
      <main id={node.a?.id}>
        <SaveBanner />
        {(node.k ?? []).map((child, childIndex) => (
          <NodeView key={`${path}.${childIndex}`} node={child} path={`${path}.${childIndex}`} index={childIndex} />
        ))}
      </main>
    );
  }
  if (hasClass(node, "tabpanel")) {
    const id = (node.a?.id ?? "").replace(/^tab-/, "");
    if (id !== ui.tab) return null;
  }
  if ("data-chart" in (node.a ?? {})) return <ChartBlock node={node} path={path} />;
  if (hasClass(node, "toggle-data")) {
    const show = chart?.showTable ?? false;
    return (
      <button className="toggle-data" type="button" onClick={() => chart?.toggle()}>
        {show ? "Show chart" : "Show data table"}
      </button>
    );
  }
  if (node.t === "table") return <SmartTable node={node} path={path} />;

  if (node.t === "tbody" && sort?.sort) {
    const { col, dir } = sort.sort;
    const entries = (node.k ?? []).map((child, childIndex) => ({ child, childIndex }));
    entries.sort((left, right) => {
      const leftCell = cellAt(left.child, col);
      const rightCell = cellAt(right.child, col);
      const av = cellVal(leftCell ? collectText(leftCell, texts) : "");
      const bv = cellVal(rightCell ? collectText(rightCell, texts) : "");
      let cmp = 0;
      if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
      else if (typeof av === "number") cmp = -1;
      else if (typeof bv === "number") cmp = 1;
      else cmp = String(av).localeCompare(String(bv));
      return dir === "ascending" ? cmp : -cmp;
    });
    return (
      <tbody>
        {entries.map(({ child, childIndex }) => (
          <NodeView key={`${path}.${childIndex}`} node={child} path={`${path}.${childIndex}`} index={childIndex} />
        ))}
      </tbody>
    );
  }

  const kids = (node.k ?? []).map((child, childIndex) => (
    <NodeView key={`${path}.${childIndex}`} node={child} path={`${path}.${childIndex}`} index={childIndex} />
  ));
  const className = node.a?.class;
  const style = parseStyle(node.a?.style);

  if (node.a?.["data-tab"]) {
    const id = node.a["data-tab"];
    return (
      <button
        className={className}
        type="button"
        role="tab"
        aria-selected={ui.tab === id}
        onClick={() => ui.setTab(id)}
      >
        {kids}
      </button>
    );
  }

  if (node.a?.["data-goto"]) {
    const id = node.a["data-goto"];
    return (
      <button
        className={className}
        type="button"
        onClick={(event) => {
          if (role === "editor" && (event.target as HTMLElement).closest("[data-edit]")) return;
          ui.setTab(id);
        }}
      >
        {kids}
      </button>
    );
  }

  if (node.t === "a") {
    const href = node.a?.href ?? "";
    return (
      <a
        className={className}
        href={href || undefined}
        aria-label={node.a?.["aria-label"]}
        onClick={(event) => {
          if (!href.startsWith("#")) return;
          const id = href.slice(1);
          if ((TABS as readonly string[]).includes(id)) {
            event.preventDefault();
            ui.setTab(id);
            return;
          }
          const owner = ui.idToTab[id];
          if (owner && owner !== ui.tab) {
            event.preventDefault();
            ui.setTab(owner, { scrollTo: id });
            return;
          }
          const target = document.getElementById(id);
          if (target) {
            event.preventDefault();
            if (window.history.replaceState) window.history.replaceState(null, "", `#${id}`);
            target.scrollIntoView({
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
              block: "start",
            });
          }
        }}
      >
        {kids}
      </a>
    );
  }

  if (node.t === "img") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={node.a?.src} alt={node.a?.alt ?? ""} width={node.a?.width} height={node.a?.height} className={className} style={style} />
    );
  }

  if (node.t === "th") {
    const sortable = hasClass(node, "sortable");
    const active = sort?.sort?.col === index;
    return (
      <th
        className={className}
        style={style}
        aria-sort={active ? sort?.sort?.dir : undefined}
        tabIndex={sortable ? 0 : undefined}
        onClick={(event) => {
          if (!sortable) return;
          if (role === "editor" && !event.altKey && (event.target as HTMLElement).closest("[data-edit]")) return;
          sort?.setSort(index);
        }}
        onKeyDown={(event) => {
          if (!sortable) return;
          if (event.key === "Enter" || event.key === " ") {
            if (event.target !== event.currentTarget) return;
            event.preventDefault();
            sort?.setSort(index);
          }
        }}
      >
        {kids}
      </th>
    );
  }

  if (node.t === "tr") {
    const query = sort?.tableId ? (ui.filters[sort.tableId] ?? "") : "";
    const header = (node.k ?? []).some((child) => child.t === "th");
    const hidden = Boolean(query && !header && !collectText(node, texts).toLowerCase().includes(query.toLowerCase()));
    return (
      <tr className={className} hidden={hidden || undefined}>
        {kids}
      </tr>
    );
  }

  if (hasClass(node, "bars")) {
    return (
      <div className={className} hidden={chart?.showTable || undefined}>
        {kids}
      </div>
    );
  }

  if ("data-table" in (node.a ?? {})) {
    return (
      <div className={className} hidden={!chart?.showTable || undefined}>
        {kids}
      </div>
    );
  }

  if (node.t === "input") {
    return (
      <input
        className={className}
        id={node.a?.id}
        type={node.a?.type}
        placeholder={node.a?.placeholder}
        aria-label={node.a?.["aria-label"]}
        defaultValue={node.a?.value}
      />
    );
  }

  if (node.t === "br") return <br />;

  const Tag = node.t as keyof React.JSX.IntrinsicElements;
  const hidden = node.a?.hidden === "" && !hasClass(node, "tabpanel");
  return (
    <Tag
      className={className}
      id={node.a?.id}
      role={node.a?.role}
      style={style}
      title={node.a?.title}
      aria-label={node.a?.["aria-label"]}
      htmlFor={node.t === "label" ? node.a?.for : undefined}
      hidden={hidden || undefined}
    >
      {kids}
    </Tag>
  );
}

export function DocumentView() {
  return (
    <>
      {(root.k ?? []).map((node, index) => (
        <NodeView key={index} node={node} path={String(index)} />
      ))}
    </>
  );
}
