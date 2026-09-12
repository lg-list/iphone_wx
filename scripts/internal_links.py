#!/usr/bin/env python3
"""Audit internal links for the static FixMob site."""

from __future__ import annotations

import json
import posixpath
import re
from collections import defaultdict, deque
from pathlib import Path
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "seo" / "reports" / "internal-link-report.md"


def html_files() -> list[Path]:
    excluded = {"node_modules", "tmp", ".agents", "playwright-report", "test-results"}
    files = []
    for path in ROOT.rglob("*.html"):
        rel = path.relative_to(ROOT)
        if any(part in excluded for part in rel.parts):
            continue
        if len(rel.parts) == 1 or rel.parts[0] == "repairs":
            files.append(path)
    return sorted(files)


def public_path(path: Path) -> str:
    rel = path.relative_to(ROOT).as_posix()
    return "/" if rel == "index.html" else f"/{rel}"


def normalize_href(href: str, source: str) -> str | None:
    href = href.strip()
    if not href or href.startswith(("#", "mailto:", "tel:", "javascript:")):
        return None
    parsed = urlsplit(href)
    if parsed.scheme and parsed.netloc and "fixmob.tech" not in parsed.netloc:
        return None
    if parsed.path.startswith("/"):
        path = parsed.path
    else:
        base = "/" if source == "/" else "/" + "/".join(source.strip("/").split("/")[:-1])
        path = posixpath.normpath(f"{base.rstrip('/')}/{parsed.path}")
        if not path.startswith("/"):
            path = f"/{path}"
    if path.endswith("/"):
        path += "index.html"
    if path == "/index.html":
        return "/"
    return path


def main() -> int:
    pages = {public_path(path): path for path in html_files()}
    links: dict[str, set[str]] = defaultdict(set)
    incoming: dict[str, set[str]] = defaultdict(set)
    broken: list[tuple[str, str]] = []

    for url, path in pages.items():
        html = path.read_text(encoding="utf-8", errors="ignore")
        for href in re.findall(r"<a\b[^>]*\bhref=[\"']([^\"']+)[\"']", html, flags=re.I):
            target = normalize_href(href, url)
            if not target:
                continue
            target_no_anchor = target.split("#", 1)[0]
            links[url].add(target_no_anchor)
            if target_no_anchor in pages:
                incoming[target_no_anchor].add(url)
            else:
                broken.append((url, target))

    depths = {"/": 0}
    queue = deque(["/"])
    while queue:
        current = queue.popleft()
        for target in links.get(current, set()):
            if target in pages and target not in depths:
                depths[target] = depths[current] + 1
                queue.append(target)

    orphans = sorted(url for url in pages if url != "/" and not incoming.get(url))
    deep_pages = sorted((url, depth) for url, depth in depths.items() if depth > 3)
    unreachable = sorted(url for url in pages if url not in depths)

    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(
        "\n".join([
            "# FixMob Internal Link Report",
            "",
            f"- Public HTML pages checked: {len(pages)}",
            f"- Broken internal links: {len(broken)}",
            f"- Orphan pages: {len(orphans)}",
            f"- Pages deeper than 3 clicks: {len(deep_pages)}",
            f"- Unreachable from home: {len(unreachable)}",
            "",
            "## Broken Internal Links",
            *(f"- `{src}` -> `{target}`" for src, target in broken[:50]),
            "",
            "## Orphan Pages",
            *(f"- `{url}`" for url in orphans[:80]),
            "",
            "## Deep Pages",
            *(f"- `{url}` depth {depth}" for url, depth in deep_pages[:80]),
        ]) + "\n",
        encoding="utf-8",
    )

    data_path = ROOT / "seo" / "data" / "internal-links.json"
    data_path.parent.mkdir(parents=True, exist_ok=True)
    data_path.write_text(json.dumps({
        "pages": len(pages),
        "broken": broken,
        "orphans": orphans,
        "deep_pages": deep_pages,
        "unreachable": unreachable,
    }, indent=2), encoding="utf-8")
    print(json.dumps({"status": "ok", "report": str(REPORT), "broken": len(broken), "orphans": len(orphans)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
