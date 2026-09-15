#!/usr/bin/env python3
"""Import a Google Search Console coverage drilldown export."""

from __future__ import annotations

import argparse
import json
import re
from datetime import date
from pathlib import Path
from typing import Any

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]


def iso_week(d: date) -> str:
    year, week, _ = d.isocalendar()
    return f"{year}-W{week:02d}"


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def model_name_from_url(url: str) -> str:
    slug = Path(url.split("?", 1)[0]).stem
    return " ".join(
        "iPhone" if part == "iphone" else
        "XS" if part == "xs" else
        "XR" if part == "xr" else
        "Pro" if part == "pro" else
        "Max" if part == "max" else
        "mini" if part == "mini" else
        "Air" if part == "air" else
        part
        for part in slug.split("-")
    )


def classify_url(url: str) -> dict[str, str]:
    match = re.search(r"/repairs/(screen|battery|backglass)/([^/?#]+\.html)", url)
    if match:
        repair_type = match.group(1)
        return {
            "kind": "repair",
            "repair_type": repair_type,
            "model": model_name_from_url(match.group(2)),
        }

    if url.endswith("screen-repair-guides.html"):
        return {"kind": "category", "repair_type": "screen", "model": ""}
    if url.endswith("battery-replacement-guides.html"):
        return {"kind": "category", "repair_type": "battery", "model": ""}
    if url.endswith("back-glass-repair-guides.html"):
        return {"kind": "category", "repair_type": "backglass", "model": ""}
    if url.endswith("screw-location-photos.html"):
        return {"kind": "screw-library", "repair_type": "", "model": ""}
    return {"kind": "support", "repair_type": "", "model": ""}


def extract_pages(workbook: Path) -> list[dict[str, Any]]:
    excel = pd.ExcelFile(workbook)
    pages: list[dict[str, Any]] = []

    for sheet in excel.sheet_names:
        frame = pd.read_excel(excel, sheet_name=sheet)
        if frame.empty:
            continue

        url_column = None
        for column in frame.columns:
            values = frame[column].dropna().astype(str)
            if values.str.startswith(("http://", "https://")).any():
                url_column = column
                break
        if url_column is None:
            continue

        date_column = next((column for column in frame.columns if column != url_column), None)
        for _, row in frame.iterrows():
            url = str(row.get(url_column, "")).strip()
            if not url.startswith(("http://", "https://")):
                continue
            item = {
                "url": url,
                "last_crawl": str(row.get(date_column, "")).strip() if date_column is not None else "",
                **classify_url(url),
            }
            pages.append(item)

    deduped = {item["url"]: item for item in pages}
    return sorted(deduped.values(), key=lambda item: item["url"])


def report(run_date: date, pages: list[dict[str, Any]], output: Path) -> None:
    counts: dict[str, int] = {}
    for page in pages:
        key = page["kind"] if page["kind"] != "repair" else f"repair:{page['repair_type']}"
        counts[key] = counts.get(key, 0) + 1

    lines = [
        "# GSC Discovered Not Indexed Coverage",
        "",
        f"- Run date: {run_date.isoformat()}",
        f"- Affected URLs: {len(pages)}",
        "",
        "## URL Groups",
    ]
    for key in sorted(counts):
        lines.append(f"- {key}: {counts[key]}")

    lines.extend([
        "",
        "## Fix Plan Applied",
        "- Add static homepage links to every affected repair guide and core category page.",
        "- Refresh sitemap lastmod values during the SEO build.",
        "- Keep repair pages indexable with canonical HTTPS URLs and direct internal links.",
        "",
        "## Affected URLs",
    ])
    lines.extend(f"- {page['url']}" for page in pages)

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--coverage", required=True, help="Path to the GSC coverage drilldown .xlsx export.")
    parser.add_argument("--run-date", default=date.today().isoformat())
    args = parser.parse_args()

    run_date = date.fromisoformat(args.run_date)
    pages = extract_pages(Path(args.coverage))
    week = iso_week(run_date)
    out_dir = ROOT / "seo" / "data" / "gsc-manual" / week
    write_json(out_dir / "coverage.json", {"run_date": run_date.isoformat(), "issue": "Discovered - currently not indexed", "pages": pages})
    report(run_date, pages, ROOT / "seo" / "reports" / f"{week}-indexing-coverage.md")
    print(json.dumps({"status": "ok", "week": week, "pages": len(pages)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
