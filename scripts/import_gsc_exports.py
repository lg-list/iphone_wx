#!/usr/bin/env python3
"""Import manually downloaded Google Search Console Excel exports.

The Search Console UI sometimes exports localized workbooks with mojibake sheet
names. This importer relies on workbook order and metric column order instead of
localized labels, then writes normalized SEO data and a practical report.
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import date
from pathlib import Path
from typing import Any

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
SITE_URL = "https://fixmob.tech"


def iso_week(d: date) -> str:
    year, week, _ = d.isocalendar()
    return f"{year}-W{week:02d}"


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def num(value: Any) -> float:
    if pd.isna(value) or value == "":
        return 0.0
    try:
        return float(value)
    except Exception:
        return 0.0


def normalize_metric_frame(df: pd.DataFrame, dimension_name: str) -> list[dict[str, Any]]:
    rows = []
    for _, row in df.iterrows():
        dimension = "" if pd.isna(row.iloc[0]) else str(row.iloc[0]).strip()
        if not dimension:
            continue
        rows.append({
            dimension_name: dimension,
            "clicks": num(row.iloc[1]) if len(row) > 1 else 0,
            "impressions": num(row.iloc[2]) if len(row) > 2 else 0,
            "ctr": num(row.iloc[3]) if len(row) > 3 else 0,
            "position": num(row.iloc[4]) if len(row) > 4 else 0,
        })
    return rows


def model_from_text(text: str) -> str:
    value = text.lower()
    match = re.search(r"iphone(?:\s|-)(?:x|xr|xs(?:\s|-)?max|xs|air|1[1-7](?:\s|-)?(?:pro(?:\s|-)?max|pro|plus|mini|e)?)", value)
    if not match:
        return ""
    return " ".join(part.capitalize() if part not in {"iphone", "xs", "xr"} else ("iPhone" if part == "iphone" else part.upper()) for part in match.group(0).replace("-", " ").split())


def repair_type_from_text(text: str) -> str:
    value = text.lower()
    if any(term in value for term in ["screen", "display", "green line", "ghost touch", "black screen"]):
        return "screen"
    if any(term in value for term in ["battery", "charging", "drain", "shutdown"]):
        return "battery"
    if any(term in value for term in ["back glass", "backglass", "rear glass"]):
        return "backglass"
    if "screw" in value:
        return "screw"
    return "unknown"


def score(item: dict[str, Any]) -> float:
    impressions = item["impressions"]
    clicks = item["clicks"]
    position = item["position"] or 99
    ctr = item["ctr"]
    striking = 40 if 4 <= position <= 10 else 28 if 10 < position <= 20 else 12 if 20 < position <= 60 else 3
    ctr_gap = 18 if impressions >= 10 and ctr == 0 else 8 if impressions >= 10 and ctr < 0.03 else 0
    return round(min(100, impressions * 0.55 + clicks * 5 + striking + ctr_gap), 2)


def import_performance(path: Path) -> dict[str, Any]:
    workbook = pd.ExcelFile(path)
    # GSC export order: chart, queries, pages, countries, devices, search appearance, filters/metadata.
    queries = normalize_metric_frame(pd.read_excel(path, sheet_name=workbook.sheet_names[1]), "query")
    pages = normalize_metric_frame(pd.read_excel(path, sheet_name=workbook.sheet_names[2]), "page")
    countries = normalize_metric_frame(pd.read_excel(path, sheet_name=workbook.sheet_names[3]), "country")
    devices = normalize_metric_frame(pd.read_excel(path, sheet_name=workbook.sheet_names[4]), "device")

    totals = {
        "clicks": sum(row["clicks"] for row in queries),
        "impressions": sum(row["impressions"] for row in queries),
    }
    totals["ctr"] = round(totals["clicks"] / totals["impressions"], 6) if totals["impressions"] else 0
    totals["average_position"] = round(
        sum(row["position"] * row["impressions"] for row in queries) / totals["impressions"],
        2,
    ) if totals["impressions"] else 0

    opportunities = []
    for row in queries:
        item = {
            "model": model_from_text(row["query"]),
            "repair_type": repair_type_from_text(row["query"]),
            "query": row["query"],
            "page": "",
            "clicks": row["clicks"],
            "impressions": row["impressions"],
            "ctr": row["ctr"],
            "position": row["position"],
            "growth": 0,
            "score": score(row),
            "reason": f"Manual GSC export: {row['impressions']:.0f} impressions, {row['clicks']:.0f} clicks, average position {row['position']:.2f}.",
            "recommended_action": "Review snippet and intent. Apply title/meta changes only after mapping to the exact matching page.",
        }
        opportunities.append(item)

    for page in pages:
        if page["impressions"] < 5:
            continue
        page_item = dict(page)
        page_item["query"] = ""
        page_item["score"] = score(page)
        opportunities.append({
            "model": model_from_text(page["page"]),
            "repair_type": repair_type_from_text(page["page"]),
            "query": "",
            "page": page["page"],
            "clicks": page["clicks"],
            "impressions": page["impressions"],
            "ctr": page["ctr"],
            "position": page["position"],
            "growth": 0,
            "score": page_item["score"],
            "reason": f"Manual GSC export page opportunity: {page['impressions']:.0f} impressions, {page['clicks']:.0f} clicks, average position {page['position']:.2f}.",
            "recommended_action": "Improve internal links and above-the-fold answer clarity for this exact URL.",
        })

    opportunities.sort(key=lambda row: row["score"], reverse=True)
    return {
        "source_file": str(path),
        "queries": queries,
        "pages": pages,
        "countries": countries,
        "devices": devices,
        "summary": totals,
        "opportunities": opportunities,
    }


def import_coverage(path: Path) -> dict[str, Any]:
    workbook = pd.ExcelFile(path)
    pages_df = pd.read_excel(path, sheet_name=workbook.sheet_names[1])
    urls = []
    for _, row in pages_df.iterrows():
        url = "" if pd.isna(row.iloc[0]) else str(row.iloc[0]).strip()
        last_crawl = "" if len(row) < 2 or pd.isna(row.iloc[1]) else str(row.iloc[1]).strip()
        if url.startswith("http"):
            urls.append({"url": url, "last_crawl": last_crawl})
    return {"source_file": str(path), "issue": "Discovered - currently not indexed", "urls": urls}


def write_report(run_week: str, perf: dict[str, Any], coverage: dict[str, Any]) -> Path:
    top_queries = sorted(perf["queries"], key=lambda r: r["impressions"], reverse=True)[:10]
    top_pages = sorted(perf["pages"], key=lambda r: r["impressions"], reverse=True)[:10]
    zero_ctr = [r for r in top_queries if r["impressions"] >= 2 and r["clicks"] == 0]
    unindexed = coverage["urls"]
    repair_unindexed = [u for u in unindexed if "/repairs/" in u["url"]]

    lines = [
        f"# Manual GSC Export Analysis {run_week}",
        "",
        "## Executive Summary",
        f"- Source performance export: `{perf['source_file']}`",
        f"- Source coverage export: `{coverage['source_file']}`",
        f"- Total query clicks in export: {perf['summary']['clicks']:.0f}",
        f"- Total query impressions in export: {perf['summary']['impressions']:.0f}",
        f"- Average CTR: {perf['summary']['ctr']:.2%}",
        f"- Average position: {perf['summary']['average_position']:.2f}",
        f"- Coverage issue URLs: {len(unindexed)}",
        f"- Repair URLs in coverage issue: {len(repair_unindexed)}",
        "",
        "## Why Performance Is Weak",
        "- The site is barely indexed and has very little query data, so Google has not built enough trust or query-page history yet.",
        "- Most impressions are coming from a tiny set of queries/pages, not a broad repair-guide footprint.",
        "- Several pages appear in Search Console as discovered but not indexed, which usually means Google knows the URLs but has not decided they are worth crawling/indexing yet.",
        "- Current priority should be indexability, crawl demand, unique useful page signals, internal links, and sitemap freshness before aggressive title testing.",
        "",
        "## Top Queries",
        "| Query | Clicks | Impressions | CTR | Position |",
        "|---|---:|---:|---:|---:|",
        *[f"| {r['query']} | {r['clicks']:.0f} | {r['impressions']:.0f} | {r['ctr']:.2%} | {r['position']:.2f} |" for r in top_queries],
        "",
        "## High-Impression / Zero-Click Queries",
        "| Query | Impressions | Position | Recommended Action |",
        "|---|---:|---:|---|",
        *[f"| {r['query']} | {r['impressions']:.0f} | {r['position']:.2f} | Map to the exact repair URL, then improve title/meta only if the page truly satisfies the intent. |" for r in zero_ctr],
        "",
        "## Top Pages",
        "| Page | Clicks | Impressions | CTR | Position |",
        "|---|---:|---:|---:|---:|",
        *[f"| {r['page']} | {r['clicks']:.0f} | {r['impressions']:.0f} | {r['ctr']:.2%} | {r['position']:.2f} |" for r in top_pages],
        "",
        "## Coverage: Discovered But Not Indexed",
        f"- Affected URLs in export: {len(unindexed)}",
        f"- First 20 affected URLs:",
        *[f"  - {item['url']} (last crawl: {item['last_crawl']})" for item in unindexed[:20]],
        "",
        "## Actions To Prioritize",
        "1. Deploy the latest local SEO build so live sitemap lastmod, robots.txt, llms.txt, and repair page schema match local code.",
        "2. Disable Cloudflare Managed robots rules that block GPTBot, ClaudeBot, and Google-Extended if GEO/AI citation is desired.",
        "3. Re-submit `https://fixmob.tech/sitemap.xml` in Google Search Console after deployment.",
        "4. Use internal links from homepage/category/site-map/screw photo sections into the pages with impressions.",
        "5. Do not create bulk new repair pages from this dataset; the export shows early crawl/indexing weakness, not enough demand evidence for expansion.",
    ]

    path = ROOT / "seo" / "reports" / f"{run_week}-manual-gsc-analysis.md"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--performance", required=True)
    parser.add_argument("--coverage", required=True)
    parser.add_argument("--run-date", default=date.today().isoformat())
    args = parser.parse_args()

    run_date = date.fromisoformat(args.run_date)
    run_week = iso_week(run_date)
    out_dir = ROOT / "seo" / "data" / "gsc-manual" / run_week

    perf = import_performance(Path(args.performance))
    coverage = import_coverage(Path(args.coverage))
    write_json(out_dir / "performance.json", perf)
    write_json(out_dir / "coverage.json", coverage)
    write_json(ROOT / "seo" / "data" / "repair-opportunities.json", perf["opportunities"][:100])
    report = write_report(run_week, perf, coverage)
    print(json.dumps({
        "status": "ok",
        "week": run_week,
        "queries": len(perf["queries"]),
        "pages": len(perf["pages"]),
        "coverage_urls": len(coverage["urls"]),
        "opportunities": len(perf["opportunities"]),
        "report": str(report),
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
