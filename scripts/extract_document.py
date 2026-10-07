#!/usr/bin/env python3
"""Turn the source HTML roadmap into a document tree, images, and scoped CSS."""

from __future__ import annotations

import json
import re
from pathlib import Path

from bs4 import BeautifulSoup, Comment, NavigableString, Tag

ROOT = Path(__file__).resolve().parents[1]
HTML_PATH = ROOT / "uploads" / "Frontier_Healthcare_DTR_2026-27_fc5e.html"
MEDIA = ROOT / "public" / "media"

VARS = [
    "surface-2",
    "accent-soft",
    "teal-soft",
    "amber-soft",
    "violet-soft",
    "mast-ink",
    "mast-muted",
    "f-display",
    "f-body",
    "f-mono",
    "surface",
    "accent",
    "muted",
    "violet",
    "amber",
    "teal",
    "mast",
    "line",
    "text",
    "link",
    "ink",
    "maxw",
    "gut",
    "bg",
    "r",
]


def rename_vars(value: str) -> str:
    for name in VARS:
        value = value.replace(f"--{name}", f"--dtr-{name}")
    return value


def extract_block(css: str, open_index: int) -> tuple[str, int]:
    depth = 0
    i = open_index
    n = len(css)
    while i < n:
        if css.startswith("/*", i):
            j = css.find("*/", i + 2)
            i = n if j < 0 else j + 2
            continue
        char = css[i]
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return css[open_index + 1 : i], i + 1
        i += 1
    raise SystemExit("Unbalanced CSS")


def split_selectors(selector: str) -> list[str]:
    parts: list[str] = []
    buf: list[str] = []
    depth = 0
    for char in selector:
        if char == "(":
            depth += 1
        elif char == ")":
            depth -= 1
        if char == "," and depth == 0:
            parts.append("".join(buf).strip())
            buf = []
        else:
            buf.append(char)
    if buf:
        parts.append("".join(buf).strip())
    return [part for part in parts if part]


def prefix_one(selector: str) -> str:
    selector = selector.strip()
    if selector.startswith(".dtr") or selector.startswith("html"):
        return selector
    if selector in {"html", "body", ":root"}:
        return ".dtr"
    if selector.startswith(":root"):
        return ".dtr" + selector[5:]
    if selector.startswith("html"):
        return ".dtr" + selector[4:]
    return f".dtr {selector}"


def prefix_css(css: str) -> str:
    out: list[str] = []
    i = 0
    n = len(css)
    while i < n:
        if css.startswith("/*", i):
            j = css.find("*/", i + 2)
            end = n if j < 0 else j + 2
            out.append(css[i:end])
            i = end
            continue
        if css[i].isspace():
            out.append(css[i])
            i += 1
            continue
        if css.startswith("@media", i) or css.startswith("@supports", i):
            brace = css.find("{", i)
            header = css[i : brace + 1]
            body, end = extract_block(css, brace)
            out.append(header)
            out.append(prefix_css(body))
            out.append("}")
            i = end
            continue
        brace = css.find("{", i)
        if brace < 0:
            out.append(css[i:])
            break
        selector = css[i:brace].strip()
        body, end = extract_block(css, brace)
        prefixed = ", ".join(prefix_one(part) for part in split_selectors(selector))
        out.append(prefixed)
        out.append("{")
        out.append(body)
        out.append("}")
        i = end
    return "".join(out)


def build_css(html: str) -> str:
    css = re.search(r"<style>(.*?)</style>", html, re.S).group(1)
    css = rename_vars(css)
    css = css.replace(
        '@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){',
        '@media (prefers-color-scheme: dark){html:not([data-theme="light"]) .dtr{',
    )
    css = css.replace(':root[data-theme="dark"]{', 'html[data-theme="dark"] .dtr{')
    css = css.replace(":root{", ".dtr{", 1)
    css = css.replace(
        "--dtr-f-display:'Source Serif 4', Georgia, 'Times New Roman', serif",
        "--dtr-f-display:var(--font-source-serif), Georgia, 'Times New Roman', serif",
    )
    css = css.replace(
        "--dtr-f-body:'IBM Plex Sans', 'Segoe UI', Arial, sans-serif",
        "--dtr-f-body:var(--font-plex-sans), 'Segoe UI', Arial, sans-serif",
    )
    css = css.replace(
        "--dtr-f-mono:'IBM Plex Mono', ui-monospace, 'Courier New', monospace",
        "--dtr-f-mono:var(--font-plex-mono), ui-monospace, 'Courier New', monospace",
    )
    return prefix_css(css)


ATTRS = [
    "id",
    "href",
    "role",
    "alt",
    "type",
    "placeholder",
    "title",
    "style",
    "src",
    "aria-label",
    "aria-selected",
    "data-filter",
    "data-goto",
    "data-tab",
    "width",
    "height",
    "value",
]


def convert(el: Tag) -> dict:
    counter = 0

    def walk(node):
        nonlocal counter
        if isinstance(node, Comment):
            return None
        if isinstance(node, NavigableString):
            text = str(node)
            if not text.strip():
                return None
            counter += 1
            return {"t": "#", "id": f"t{counter:05d}", "v": text}
        if not isinstance(node, Tag) or node.name in {"script", "style"}:
            return None
        out: dict = {"t": node.name}
        attrs: dict[str, str] = {}
        classes = node.get("class")
        if classes:
            attrs["class"] = " ".join(classes)
        for key in ATTRS:
            if node.has_attr(key):
                raw = node.get(key)
                if raw is None:
                    continue
                value = raw if isinstance(raw, str) else " ".join(raw)
                if key == "style":
                    value = rename_vars(value)
                attrs[key] = value
        for key in ("data-chart", "data-table", "hidden"):
            if node.has_attr(key):
                attrs[key] = ""
        if "for" in node.attrs:
            attrs["for"] = node["for"]
        if attrs:
            out["a"] = attrs
        kids = []
        for child in node.children:
            walked = walk(child)
            if walked:
                kids.append(walked)
        if kids:
            out["k"] = kids
        return out

    tree = walk(el)
    return tree, counter


def main() -> None:
    html = HTML_PATH.read_text(encoding="utf-8")
    MEDIA.mkdir(parents=True, exist_ok=True)

    names = ["logo.webp", "clinic-pages.jpg", "clinic-finder.jpg", "brand-family.jpg"]
    seen: dict[str, str] = {}
    order = 0

    def repl(match: re.Match) -> str:
        nonlocal order
        import base64
        import hashlib

        raw = base64.b64decode(match.group(2))
        digest = hashlib.sha1(raw).hexdigest()[:12]
        if digest not in seen:
            filename = names[order] if order < len(names) else f"image-{order}.bin"
            (MEDIA / filename).write_bytes(raw)
            seen[digest] = f"/media/{filename}"
            order += 1
        return seen[digest]

    html_with_src = re.sub(
        r"data:image/(webp|jpeg|png|gif);base64,([A-Za-z0-9+/=]+)",
        repl,
        html,
    )
    soup = BeautifulSoup(html_with_src, "html.parser")
    for script in soup.find_all("script"):
        script.decompose()
    tree, text_count = convert(soup.body)
    (ROOT / "content").mkdir(exist_ok=True)
    (ROOT / "content" / "document.json").write_text(
        json.dumps(tree, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    (ROOT / "app" / "dtr-base.css").write_text(build_css(html), encoding="utf-8")

    headings = [
        re.sub(r"\s+", " ", node.get_text(" ", strip=True))
        for node in soup.find_all(["h1", "h2", "h3", "h4"])
    ]
    print("text nodes", text_count)
    print("headings", len(headings))
    print("tables", len(soup.find_all("table")))
    print("images", order, list(seen.values()))
    print("document bytes", (ROOT / "content" / "document.json").stat().st_size)
    print("css bytes", (ROOT / "app" / "dtr-base.css").stat().st_size)


if __name__ == "__main__":
    main()
