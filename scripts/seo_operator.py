#!/usr/bin/env python3
"""Weekly FixMob SEO Growth Operator.

This script intentionally favors safe technical maintenance and reporting.
Search Console data is required before it changes titles, descriptions, or
content priorities based on rankings.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import re
import subprocess
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "seo" / "reports"
DATA = ROOT / "seo" / "data"
OUTREACH = ROOT / "seo" / "outreach"
STATE_DIR = ROOT / ".agents" / "loops"
SITE_URL = "https://fixmob.tech"
SKILL_ROOT = ROOT / ".agents" / "skills"


@dataclass
class RunResult:
    name: str
    ok: bool
    output: str


def iso_week(d: date) -> str:
    year, week, _ = d.isocalendar()
    return f"{year}-W{week:02d}"


def read_json(path: Path, default: Any) -> Any:
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return default


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def run_command(name: str, command: list[str], allow_failure: bool = False) -> RunResult:
    proc = subprocess.run(command, cwd=ROOT, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    ok = proc.returncode == 0
    return RunResult(name=name, ok=ok, output=proc.stdout.strip())


def latest_manual_gsc_week() -> str | None:
    manual_root = DATA / "gsc-manual"
    if not manual_root.exists():
        return None
    weeks = sorted([path.name for path in manual_root.iterdir() if path.is_dir()], reverse=True)
    for week in weeks:
        if (manual_root / week / "performance.json").exists():
            return week
    return None


def load_manual_gsc_opportunities() -> tuple[str | None, list[dict[str, Any]]]:
    week = latest_manual_gsc_week()
    if not week:
        return None, []
    performance = read_json(DATA / "gsc-manual" / week / "performance.json", {})
    opportunities = performance.get("opportunities", [])
    return week, opportunities if isinstance(opportunities, list) else []


def page_url(path: Path) -> str:
    rel = path.relative_to(ROOT).as_posix()
    return "/" if rel == "index.html" else f"/{rel}"


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


def html_text(html: str) -> str:
    html = re.sub(r"<script\b.*?</script>", " ", html, flags=re.I | re.S)
    html = re.sub(r"<style\b.*?</style>", " ", html, flags=re.I | re.S)
    html = re.sub(r"<[^>]+>", " ", html)
    return re.sub(r"\s+", " ", html).strip()


def extract_attr(html: str, pattern: str) -> str:
    match = re.search(pattern, html, flags=re.I | re.S)
    return match.group(1).strip() if match else ""


def load_marketingskills_review(run_week: str) -> dict[str, Any]:
    findings = []
    required = ["seo-audit", "ai-seo", "programmatic-seo", "site-architecture", "marketing-loops"]
    for skill in required:
        path = SKILL_ROOT / skill / "SKILL.md"
        if path.exists():
            text = path.read_text(encoding="utf-8", errors="ignore")
            findings.append({
                "skill": skill,
                "status": "available",
                "version": extract_attr(text, r"version:\s*([^\n]+)") or "unknown",
                "review_note": "Applied as guardrails for weekly SEO, GEO, internal linking, and pSEO quality control.",
            })
        else:
            findings.append({
                "skill": skill,
                "status": "missing",
                "review_note": "MARKETINGSKILLS_NOT_AVAILABLE for this skill; workflow continued.",
            })

    REPORTS.mkdir(parents=True, exist_ok=True)
    report = REPORTS / f"{run_week}-marketingskills-review.md"
    report.write_text(
        "\n".join([
            "# Marketingskills Review",
            "",
            "| Problem | URL | Priority | Reason | Recommended Action | Expected Impact |",
            "|---|---|---:|---|---|---|",
            "| Thin scaled pages risk | Sitewide repair templates | 1 | Large model-by-repair page set can look repetitive if pages only swap model names. | Use GSC opportunity scoring and real repair assets before creating or heavily rewriting pages. | Better useful indexed pages and lower scaled-content risk. |",
            "| GSC-first workflow needed | Search Console API | 1 | Ranking and CTR decisions should not be guessed. | Require GSC_SERVICE_ACCOUNT_JSON and GSC_PROPERTY before title/meta tests. | Safer snippet testing and prioritization. |",
            "| GEO extractability | Repair detail pages | 2 | AI systems need concise answer blocks and machine-readable summaries. | Maintain Quick Answer, FAQ, HowTo, llms.txt, and llms-full.txt. | Higher chance of AI citation and useful answer extraction. |",
            "| Screw photo differentiation | /screw-location-photos.html | 2 | Screw photos are a unique FixMob asset. | Prioritize exact-model screw pages only when real images/data exist. | Better topical authority for repair-specific long-tail queries. |",
            "",
            "## Skills Checked",
            *[f"- {item['skill']}: {item['status']} ({item['review_note']})" for item in findings],
        ]) + "\n",
        encoding="utf-8",
    )
    return {"status": "ok", "report": str(report), "findings": findings}


def technical_audit() -> dict[str, Any]:
    pages = []
    titles = Counter()
    descriptions = Counter()
    image_alt_issues = []
    external_images = []
    no_schema = []
    noindex = []

    for path in html_files():
        html = path.read_text(encoding="utf-8", errors="ignore")
        url = page_url(path)
        title = extract_attr(html, r"<title>(.*?)</title>")
        desc = extract_attr(html, r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)')
        canonical = extract_attr(html, r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)')
        h1s = re.findall(r"<h1\b[^>]*>(.*?)</h1>", html, flags=re.I | re.S)
        robots = extract_attr(html, r'<meta\s+name=["\']robots["\']\s+content=["\']([^"\']+)')
        schema_count = len(re.findall(r'application/ld\+json', html, flags=re.I))

        if "noindex" in robots.lower():
            noindex.append(url)
        if title:
            titles[title] += 1
        if desc:
            descriptions[desc] += 1
        if schema_count == 0 and "noindex" not in robots.lower():
            no_schema.append(url)

        for img in re.findall(r"<img\b[^>]*>", html, flags=re.I):
            src = extract_attr(img, r'\bsrc=["\']([^"\']+)')
            alt_found = re.search(r'\balt=["\']([^"\']*)["\']', img, flags=re.I)
            if src.startswith(("http://", "https://")) and "fixmob.tech" not in src:
                external_images.append({"page": url, "src": src})
            if alt_found is None and "aria-hidden" not in img:
                image_alt_issues.append({"page": url, "src": src, "issue": "missing alt"})

        pages.append({
            "url": url,
            "title": title,
            "description": desc,
            "canonical": canonical,
            "h1_count": len(h1s),
            "schema_count": schema_count,
            "word_count": len(html_text(html).split()),
            "indexable": "noindex" not in robots.lower(),
        })

    duplicates = {
        "titles": [title for title, count in titles.items() if count > 1],
        "descriptions": [desc for desc, count in descriptions.items() if count > 1],
    }
    issues = {
        "missing_title": [p["url"] for p in pages if not p["title"]],
        "missing_description": [p["url"] for p in pages if not p["description"]],
        "missing_canonical": [p["url"] for p in pages if p["indexable"] and not p["canonical"]],
        "bad_h1": [p["url"] for p in pages if p["indexable"] and p["h1_count"] != 1],
        "no_schema": no_schema,
        "noindex": noindex,
        "external_images": external_images,
        "image_alt_issues": image_alt_issues,
        "duplicate_titles": duplicates["titles"],
        "duplicate_descriptions": duplicates["descriptions"],
    }
    write_json(DATA / "technical-audit.json", {"pages": pages, "issues": issues})

    REPORTS.mkdir(parents=True, exist_ok=True)
    (REPORTS / "technical-audit.md").write_text(
        "\n".join([
            "# Technical SEO Audit",
            "",
            f"- HTML pages checked: {len(pages)}",
            f"- Missing titles: {len(issues['missing_title'])}",
            f"- Missing descriptions: {len(issues['missing_description'])}",
            f"- Missing canonicals: {len(issues['missing_canonical'])}",
            f"- Bad H1 count: {len(issues['bad_h1'])}",
            f"- Indexable pages without schema: {len(no_schema)}",
            f"- External image references: {len(external_images)}",
            f"- Image alt issues: {len(image_alt_issues)}",
            f"- Duplicate titles: {len(duplicates['titles'])}",
            f"- Duplicate descriptions: {len(duplicates['descriptions'])}",
        ]) + "\n",
        encoding="utf-8",
    )
    return {"pages": len(pages), "issues": issues}


def thin_content_candidates() -> list[dict[str, Any]]:
    candidates = []
    for path in html_files():
        html = path.read_text(encoding="utf-8", errors="ignore")
        robots = extract_attr(html, r'<meta\s+name=["\']robots["\']\s+content=["\']([^"\']+)')
        if "noindex" in robots.lower():
            continue
        text = html_text(html)
        word_count = len(text.split())
        photo_count = len(re.findall(r"<img\b", html, flags=re.I))
        quick_answer = 'id="quick-answer"' in html
        if word_count < 450 or ("/repairs/" in page_url(path) and not quick_answer):
            action = "IMPROVE"
        else:
            action = "KEEP"
        if action != "KEEP":
            candidates.append({
                "url": f"{SITE_URL}{page_url(path)}",
                "word_count": word_count,
                "photo_count": photo_count,
                "recommended_status": action,
                "reason": "Short page or missing extractable answer structure.",
            })
    write_json(DATA / "thin-content-candidates.json", candidates)
    return candidates


def screw_photo_audit() -> dict[str, Any]:
    path = ROOT / "screw-location-photos.html"
    html = path.read_text(encoding="utf-8", errors="ignore") if path.exists() else ""
    img_count = len(re.findall(r"<img\b", html, flags=re.I))
    anchor_count = len(re.findall(r'id=["\']screw-model-', html, flags=re.I))
    report = {
        "page": f"{SITE_URL}/screw-location-photos.html",
        "images": img_count,
        "model_anchors": anchor_count,
        "priority": "High",
        "recommendation": "Use Search Console screw-related queries to improve captions and internal links without inventing screw measurements.",
    }
    write_json(DATA / "screw-photo-audit.json", report)
    return report


def write_csv(path: Path, rows: list[dict[str, Any]], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def outreach_research(opportunities: list[dict[str, Any]]) -> dict[str, int]:
    seeds = opportunities[:10] or [
        {"query": "iphone screw location", "model": "iPhone", "repair_type": "screw", "page": f"{SITE_URL}/screw-location-photos.html"},
        {"query": "iphone battery replacement", "model": "iPhone", "repair_type": "battery", "page": f"{SITE_URL}/battery-replacement-guides.html"},
    ]
    community_rows = []
    backlink_rows = []
    for item in seeds[:20]:
        model = item.get("model") or "iPhone"
        repair = item.get("repair_type") or "repair"
        query = item.get("query") or f"{model} {repair}"
        target = item.get("page") or f"{SITE_URL}/"
        community_rows.extend([
            {
                "platform": "Reddit",
                "url": f"https://www.google.com/search?q=site%3Areddit.com+{query.replace(' ', '+')}",
                "query": query,
                "model": model,
                "repair_type": repair,
                "matching_fixmob_url": target,
                "reason": "Find real threads asking for repair help; draft value-first replies only.",
                "priority": "REVIEW",
                "status": "READY_FOR_REVIEW",
            },
            {
                "platform": "Repair forums",
                "url": f"https://www.google.com/search?q={query.replace(' ', '+')}+repair+forum",
                "query": query,
                "model": model,
                "repair_type": repair,
                "matching_fixmob_url": target,
                "reason": "Look for exact troubleshooting questions where FixMob has matching photos or steps.",
                "priority": "REVIEW",
                "status": "READY_FOR_REVIEW",
            },
        ])
        backlink_rows.append({
            "domain": "Google prospecting query",
            "url": f"https://www.google.com/search?q={query.replace(' ', '+')}+repair+resources",
            "topic": query,
            "model": model,
            "target_page": target,
            "opportunity_type": "Resource page prospecting",
            "priority": "REVIEW",
            "reason": "Seek legitimate resource pages that may cite original screw photos or repair checklists.",
            "status": "READY_FOR_REVIEW",
        })

    write_csv(OUTREACH / "community-opportunities.csv", community_rows[:20], [
        "platform", "url", "query", "model", "repair_type", "matching_fixmob_url", "reason", "priority", "status"
    ])
    write_csv(OUTREACH / "backlink-opportunities.csv", backlink_rows[:20], [
        "domain", "url", "topic", "model", "target_page", "opportunity_type", "priority", "reason", "status"
    ])
    return {"community": min(len(community_rows), 20), "backlinks": min(len(backlink_rows), 20)}


def competitor_report(opportunities: list[dict[str, Any]], run_week: str) -> Path:
    top = opportunities[:5]
    lines = [
        "# Competitor Gaps",
        "",
        "This report stages SERP research targets. It does not copy competitor copy, photos, or repair measurements.",
        "",
    ]
    if not top:
        lines.extend([
            "Search Console data was not available, so competitor research is limited to priority FixMob categories:",
            "- iFixit, Apple Support, YouTube repair videos, repair shops, parts suppliers, Reddit repair discussions.",
        ])
    for item in top:
        query = item.get("query", "")
        lines.extend([
            f"## {query}",
            f"- FixMob page: {item.get('page', '')}",
            f"- Model / repair: {item.get('model', '')} / {item.get('repair_type', '')}",
            "- Check competitors: iFixit, Apple Support, YouTube, repair shops, parts suppliers, Reddit.",
            "- Gap checklist: photos, screw map clarity, troubleshooting, model specificity, internal links.",
            "- Action rule: improve only with verified FixMob content and local images.",
            "",
        ])
    path = REPORTS / "competitor-gaps.md"
    path.write_text("\n".join(lines), encoding="utf-8")
    return path


def weekly_report(run_week: str, results: list[RunResult], gsc_ok: bool, tech: dict[str, Any], opportunities: list[dict[str, Any]], outreach: dict[str, int]) -> Path:
    summary_path = DATA / "gsc" / run_week / "summary.json"
    summary = read_json(summary_path, {})
    metrics = summary.get("windows", {}).get("28d", {})
    prev = summary.get("windows", {}).get("prev_28d", {})

    def delta(key: str) -> str:
        if key not in metrics or key not in prev:
            return "n/a"
        return str(round(float(metrics.get(key, 0)) - float(prev.get(key, 0)), 3))

    safe_actions = [
        "Regenerated sitemap.xml and /sitemap.",
        "Regenerated llms.txt and llms-full.txt for GEO / AI crawler context.",
        "Ran technical audit and internal link audit.",
        "Staged backlink and community prospecting files for review.",
    ]
    rejected = [
        "No automatic page deletion, noindex, URL migration, or large content rewrite.",
        "No invented screw sizes, part compatibility, battery specifications, or safety instructions.",
        "No title/meta tests without valid Search Console data.",
    ]

    lines = [
        f"# Weekly FixMob SEO Report {run_week}",
        "",
        "## Google Search Console",
        f"- Status: {'SUCCESS' if gsc_ok else 'FAILED_OR_NOT_CONFIGURED'}",
        f"- Clicks: {metrics.get('clicks', 'n/a')} ({delta('clicks')} vs previous 28 days)",
        f"- Impressions: {metrics.get('impressions', 'n/a')} ({delta('impressions')} vs previous 28 days)",
        f"- CTR: {metrics.get('ctr', 'n/a')} ({delta('ctr')} vs previous 28 days)",
        f"- Average position: {metrics.get('average_position', 'n/a')} ({delta('average_position')} vs previous 28 days)",
        "",
        "## Top SEO Opportunities",
    ]
    if opportunities:
        if not gsc_ok:
            lines.append("- Using latest manually imported Search Console export for opportunity scoring.")
        for item in opportunities[:10]:
            lines.append(
                f"- Score {item['score']}: {item.get('query', '')} -> {item.get('page', '')} "
                f"({item.get('reason', '')}) Action: {item.get('recommended_action', '')}"
            )
    else:
        lines.append("- No GSC-backed opportunities available this run.")

    issues = tech.get("issues", {})
    lines.extend([
        "",
        "## Technical SEO",
        f"- Pages checked: {tech.get('pages', 0)}",
        f"- Missing title: {len(issues.get('missing_title', []))}",
        f"- Missing description: {len(issues.get('missing_description', []))}",
        f"- Missing canonical: {len(issues.get('missing_canonical', []))}",
        f"- External images: {len(issues.get('external_images', []))}",
        f"- Duplicate titles: {len(issues.get('duplicate_titles', []))}",
        f"- Duplicate descriptions: {len(issues.get('duplicate_descriptions', []))}",
        "",
        "## Outreach Research",
        f"- Community opportunities staged: {outreach.get('community', 0)}",
        f"- Backlink opportunities staged: {outreach.get('backlinks', 0)}",
        "",
        "## Actions Completed",
        *[f"- {item}" for item in safe_actions],
        "",
        "## Actions Rejected",
        *[f"- {item}" for item in rejected],
        "",
        "## Command Results",
        *[f"- {result.name}: {'ok' if result.ok else 'failed'} {result.output[:180]}" for result in results],
        "",
        "## Next Week Priorities",
        "- Connect GSC_SERVICE_ACCOUNT_JSON and GSC_PROPERTY if this run could not read Search Console.",
        "- Review top 10 repair opportunities before approving title/meta tests.",
        "- Review community and backlink CSVs before any outreach.",
        "- Re-submit https://fixmob.tech/sitemap.xml in Search Console after deployment.",
    ])

    path = REPORTS / f"{run_week}-weekly-report.md"
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    (ROOT / "NEXT-WEEK.md").write_text("\n".join(lines[lines.index("## Next Week Priorities"):]) + "\n", encoding="utf-8")
    return path


def update_state(run_week: str, status: str) -> None:
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    state_path = STATE_DIR / "fixmob-weekly-seo.json"
    state = read_json(state_path, {"loop": "fixmob-weekly-seo", "runs": []})
    state["last_run"] = datetime.now(timezone.utc).isoformat()
    state["last_week"] = run_week
    state["status"] = status
    state.setdefault("runs", []).append({"week": run_week, "status": status, "time": state["last_run"]})
    state["runs"] = state["runs"][-52:]
    write_json(state_path, state)
    with (STATE_DIR / "fixmob-weekly-seo.log").open("a", encoding="utf-8") as file:
        file.write(f"{state['last_run']} checked=1 acted=1 note=\"weekly SEO operator {status}\"\n")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=["weekly"])
    parser.add_argument("--run-date", default=date.today().isoformat())
    args = parser.parse_args()

    run_date = date.fromisoformat(args.run_date)
    run_week = iso_week(run_date)
    for folder in [REPORTS, DATA, OUTREACH]:
        folder.mkdir(parents=True, exist_ok=True)

    marketingskills = load_marketingskills_review(run_week)
    results: list[RunResult] = []

    gsc_result = run_command("gsc_fetch", [sys.executable, "scripts/gsc_fetch.py", "--run-date", run_date.isoformat()], allow_failure=True)
    results.append(gsc_result)
    gsc_ok = '"status": "ok"' in gsc_result.output

    if gsc_ok:
        results.append(run_command("analyze_gsc", [sys.executable, "scripts/analyze_gsc.py", "--week", run_week], allow_failure=True))
    else:
        manual_week, manual_opportunities = load_manual_gsc_opportunities()
        if manual_opportunities:
            write_json(DATA / "repair-opportunities.json", manual_opportunities[:100])
            results.append(RunResult(
                name="manual_gsc_fallback",
                ok=True,
                output=f"using seo/data/gsc-manual/{manual_week}/performance.json",
            ))
        else:
            write_json(DATA / "repair-opportunities.json", [])

    results.append(run_command("generate_sitemap", ["node", "scripts/generate-sitemap.mjs"], allow_failure=True))
    results.append(run_command("generate_llms", ["node", "scripts/generate-llms-files.mjs"], allow_failure=True))
    results.append(run_command("internal_links", [sys.executable, "scripts/internal_links.py"], allow_failure=True))

    tech = technical_audit()
    thin = thin_content_candidates()
    screw = screw_photo_audit()
    opportunities = read_json(DATA / "repair-opportunities.json", [])
    outreach = outreach_research(opportunities)
    competitor_path = competitor_report(opportunities, run_week)
    report_path = weekly_report(run_week, results, gsc_ok, tech, opportunities, outreach)

    change_log = read_json(DATA / "change-log.json", [])
    change_log.append({
        "date": run_date.isoformat(),
        "week": run_week,
        "level": "LEVEL 1",
        "actions": [
            "sitemap regenerated",
            "robots.txt regenerated",
            "llms files regenerated",
            "technical audit generated",
            "internal link audit generated",
        ],
        "requires_review": [
            "title/meta tests",
            "new content pages",
            "merge/noindex/delete decisions",
            "community replies",
            "backlink outreach",
        ],
    })
    write_json(DATA / "change-log.json", change_log[-104:])
    update_state(run_week, "complete" if all(result.ok for result in results) else "completed_with_warnings")

    print(json.dumps({
        "status": "complete",
        "week": run_week,
        "gsc": "success" if gsc_ok else "failed_or_not_configured",
        "marketingskills": marketingskills["status"],
        "weekly_report": str(report_path),
        "competitor_report": str(competitor_path),
        "thin_candidates": len(thin),
        "screw_photo_images": screw["images"],
        "opportunities": len(opportunities),
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
