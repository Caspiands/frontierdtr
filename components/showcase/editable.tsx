"use client";

import { useContent } from "@/components/showcase/content-context";
import { escapeHtml } from "@/lib/document";

export function Editable({ id, fallback }: { id: string; fallback: string }) {
  const { role, texts, setText } = useContent();
  const value = texts[id] ?? fallback;
  if (role !== "editor") return <>{value}</>;

  return (
    <span
      data-edit={id}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      role="textbox"
      aria-label="Editable text"
      dangerouslySetInnerHTML={{ __html: escapeHtml(value) }}
      onFocus={(event) => {
        const current = event.currentTarget.textContent ?? "";
        if (current.length > 80) return;
        const range = document.createRange();
        range.selectNodeContents(event.currentTarget);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        }
        if (event.key === "Escape") {
          event.currentTarget.textContent = value;
          event.currentTarget.blur();
        }
      }}
      onBlur={(event) => {
        const next = event.currentTarget.textContent ?? "";
        if (next !== value) setText(id, next);
      }}
    />
  );
}
