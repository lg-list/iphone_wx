#!/usr/bin/env python3
"""Analyze stored GSC data and score FixMob repair opportunities."""

from __future__ import annotations

import argparse
import json
import re
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
REPAIR_TYPES = {
    "screen": ["screen", "display", "glass", "green line", "ghost touch", "black screen"],
    "battery": ["battery", "charging", "drain", "health", "shutdown"],
    "backglass": ["back glass", "backglass", "rear glass", "camera ring"],
    "screw": ["screw", "screws", "screw location", "screw map", "screw diagram"],
}


def iso_week(d: date) -> str:
    year, week, _ = d.isocalendar()
    return f"{year}-W{week:02d}"


def read_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def slug_to_model(slug: str) -> str:
    parts = slug.replace(".html", "").split("-")
    return " ".join(
        "iPhone" if p == "iphone" else
        "XS" if p == "xs" else
        "XR" if p == "xr" else
        "Pro" if p == "pro" else
        "Max" if p == "max" else
        "Air" if p == "air" else
        p
        for p in parts
    )


def extract_model(text: str, page: str = "") -> str:
    combined = f"{text} {page}".lower()
    match = re.search(r"iphone(?:\s|-)(?:x|xr|xs(?:\s|-)?max|xs|air|1[1-7](?:\s|-)?(?:pro(?:\s|-)?max|pro|plus|mini|e)?)", combined)
    if match:
        return slug_to_model(match.group(0).replace(" ", "-"))
    page_match = re.search(r"/iphone-[a-z0-9-]+\.html", page)
    if page_match:
        return slug_to_model(page_match.group(0).split("/")[-1])
    return ""


def infer_repair_type(query: str, page: str) -> str:
    haystack = f"{query} {page}".lower()
    for repair_type, terms in REPAIR_TYPES.items():
        if any(term in haystack for term in terms):
            return repair_type
    if "/repairs/screen/" in page:
        return "screen"
    if "/repairs/battery/" in page:
        return "battery"
    if "/repairs/backglass/" in page:
        return "backglass"
    return "unknown"


def opportunity_action(position: float, ctr: float, impressions: float, page: str) -> str:
    if 4 <= position <= 10:
        return "Improve on-page answer clarity, internal links, and SERP snippet to push into Top 3."
    if 10 < position <= 20:
        return "Strengthen page depth and related links to enter Top 10."
    if impressions >= 20 and ctr < 0.02:
        return "Test title/meta description after confirming the page matches the query intent."
    if not page:
        return "Map the query to an existing FixMob page; create a new page only if real repair assets exist."
    return "Monitor."


def score_row(row: dict[str, Any], growth: float = 0) -> float:
    impressions = float(row.get("impressions", 0))
    clicks = float(row.get("clicks", 0))
    position = float(row.get("position", 99))
    ctr = float(row.get("ctr", 0))
    striking = 40 if 4 <= position <= 10 else 25 if 10 < position <= 20 else 8
    low_ctr = 15 if impressions >= 20 and ctr < 0.02 else 0
    growth_score = min(max(growth, 0), 50)
    return round(min(100, impressions * 0.25 + clicks * 4 + striking + low_ctr + growth_score), 2)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--week", default=iso_week(date.today()))
    args = parser.parse_args()

    data_dir = ROOT / "seo" / "data" / "gsc" / args.week
    rows = read_json(data_dir / "28d-query-page.json", [])
    previous_rows = read_json(data_dir / "prev_28d-query-page.json", [])
    previous_by_key = {tuple(row.get("keys", [])[:2]): row for row in previous_rows}

    opportunities = []
    for row in rows:
        query = row.get("query") or (row.get("keys") or [""])[0]
        page = row.get("page") or ((row.get("keys") or ["", ""])[1] if len(row.get("keys", [])) > 1 else "")
        impressions = float(row.get("impressions", 0))
        position = float(row.get("position", 99))
        if impressions < 5:
            continue
        previous = previous_by_key.get(tuple(row.get("keys", [])[:2]), {})
        growth = impressions - float(previous.get("impressions", 0))
        repair_type = infer_repair_type(query, page)
        model = extract_model(query, page)
        score = score_row(row, growth)
        if score < 25 and not (4 <= position <= 20):
            continue
        opportunities.append({
            "model": model,
            "repair_type": repair_type,
            "query": query,
            "page": page,
            "clicks": row.get("clicks", 0),
            "impressions": row.get("impressions", 0),
            "ctr": row.get("ctr", 0),
            "position": row.get("position", 0),
            "growth": growth,
            "score": score,
            "reason": f"{impressions:.0f} impressions, average position {position:.1f}, growth {growth:.0f}.",
            "recommended_action": opportunity_action(position, float(row.get("ctr", 0)), impressions, page),
        })

    opportunities.sort(key=lambda item: item["score"], reverse=True)
    out_path = ROOT / "seo" / "data" / "repair-opportunities.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(opportunities[:100], indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps({"status": "ok", "opportunities": len(opportunities), "output": str(out_path)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
