#!/usr/bin/env python3
"""Fetch Google Search Console data for the weekly FixMob SEO operator."""

from __future__ import annotations

import argparse
import json
import os
from datetime import date, timedelta
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]


def iso_week(d: date) -> str:
    year, week, _ = d.isocalendar()
    return f"{year}-W{week:02d}"


def load_config() -> dict[str, Any]:
    config_path = ROOT / "site.config.json"
    if config_path.exists():
        return json.loads(config_path.read_text(encoding="utf-8"))
    return {"siteUrl": "https://fixmob.tech"}


def output_dir(run_date: date) -> Path:
    path = ROOT / "seo" / "data" / "gsc" / iso_week(run_date)
    path.mkdir(parents=True, exist_ok=True)
    return path


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def error_report(message: str, detail: str = "") -> None:
    report = ROOT / "seo" / "reports" / "gsc-error.md"
    report.parent.mkdir(parents=True, exist_ok=True)
    body = [
        "# Google Search Console Fetch Error",
        "",
        f"- Status: GSC_FETCH_FAILED",
        f"- Reason: {message}",
    ]
    if detail:
        body.extend(["", "```text", detail.strip(), "```"])
    report.write_text("\n".join(body) + "\n", encoding="utf-8")


def service_account_info() -> dict[str, Any] | None:
    raw = os.getenv("GSC_SERVICE_ACCOUNT_JSON", "").strip()
    if not raw:
        return None
    possible_path = Path(raw)
    if possible_path.exists():
        return json.loads(possible_path.read_text(encoding="utf-8"))
    return json.loads(raw)


def build_service() -> Any:
    info = service_account_info()
    if not info:
        raise RuntimeError("GSC_SERVICE_ACCOUNT_JSON is not set")

    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
    except Exception as exc:  # pragma: no cover - depends on runner env
        raise RuntimeError(
            "Missing Google API packages. Install google-api-python-client and google-auth."
        ) from exc

    credentials = service_account.Credentials.from_service_account_info(
        info,
        scopes=["https://www.googleapis.com/auth/webmasters.readonly"],
    )
    return build("searchconsole", "v1", credentials=credentials, cache_discovery=False)


def fetch_rows(service: Any, site_url: str, start: date, end: date, dimensions: list[str]) -> list[dict[str, Any]]:
    response = (
        service.searchanalytics()
        .query(
            siteUrl=site_url,
            body={
                "startDate": start.isoformat(),
                "endDate": end.isoformat(),
                "dimensions": dimensions,
                "rowLimit": 25000,
                "startRow": 0,
            },
        )
        .execute()
    )
    rows = response.get("rows", [])
    normalized = []
    for row in rows:
        item = {
            "keys": row.get("keys", []),
            "clicks": row.get("clicks", 0),
            "impressions": row.get("impressions", 0),
            "ctr": row.get("ctr", 0),
            "position": row.get("position", 0),
        }
        for index, dimension in enumerate(dimensions):
            item[dimension] = item["keys"][index] if index < len(item["keys"]) else ""
        normalized.append(item)
    return normalized


def summarize(rows: list[dict[str, Any]]) -> dict[str, Any]:
    clicks = sum(float(row.get("clicks", 0)) for row in rows)
    impressions = sum(float(row.get("impressions", 0)) for row in rows)
    weighted_position = sum(float(row.get("position", 0)) * float(row.get("impressions", 0)) for row in rows)
    return {
        "clicks": round(clicks, 3),
        "impressions": round(impressions, 3),
        "ctr": round(clicks / impressions, 6) if impressions else 0,
        "average_position": round(weighted_position / impressions, 3) if impressions else 0,
        "rows": len(rows),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--run-date", default=date.today().isoformat())
    parser.add_argument("--property", default=os.getenv("GSC_PROPERTY", ""))
    args = parser.parse_args()

    run_date = date.fromisoformat(args.run_date)
    config = load_config()
    property_id = args.property or config.get("gscProperty") or config.get("siteUrl", "https://fixmob.tech/")

    try:
        service = build_service()
        out = output_dir(run_date)
        windows = {
            "7d": 7,
            "28d": 28,
            "90d": 90,
            "prev_7d": 14,
            "prev_28d": 56,
        }
        summaries: dict[str, Any] = {"property": property_id, "run_date": run_date.isoformat(), "windows": {}}

        for label, days in windows.items():
            if label.startswith("prev_"):
                current_days = int(label.split("_")[1].replace("d", ""))
                end = run_date - timedelta(days=current_days + 1)
                start = end - timedelta(days=current_days - 1)
            else:
                end = run_date - timedelta(days=2)
                start = end - timedelta(days=days - 1)

            query_page = fetch_rows(service, property_id, start, end, ["query", "page", "country", "device", "date"])
            write_json(out / f"{label}-query-page.json", query_page)

            if label in {"7d", "28d", "90d"}:
                write_json(out / f"{label}-queries.json", fetch_rows(service, property_id, start, end, ["query"]))
                write_json(out / f"{label}-pages.json", fetch_rows(service, property_id, start, end, ["page"]))
                write_json(out / f"{label}-countries.json", fetch_rows(service, property_id, start, end, ["country"]))
                write_json(out / f"{label}-devices.json", fetch_rows(service, property_id, start, end, ["device"]))

            summaries["windows"][label] = {
                "start": start.isoformat(),
                "end": end.isoformat(),
                **summarize(query_page),
            }

        write_json(out / "summary.json", summaries)

        history_path = ROOT / "seo" / "data" / "gsc-history.json"
        history = []
        if history_path.exists():
            history = json.loads(history_path.read_text(encoding="utf-8"))
        history.append(summaries)
        write_json(history_path, history[-104:])
        print(json.dumps({"status": "ok", "output": str(out), "property": property_id}, ensure_ascii=False))
        return 0
    except Exception as exc:
        error_report(str(exc), repr(exc))
        print(json.dumps({"status": "error", "reason": str(exc)}, ensure_ascii=False))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
