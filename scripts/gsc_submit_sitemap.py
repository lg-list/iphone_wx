#!/usr/bin/env python3
"""Submit the live FixMob sitemap to Google Search Console."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

from gsc_fetch import build_service, load_config, sanitize_error


ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--property", default=os.getenv("GSC_PROPERTY", ""))
    parser.add_argument("--sitemap", default="")
    args = parser.parse_args()

    config = load_config()
    site_url = config.get("siteUrl", "https://fixmob.tech").rstrip("/")
    property_id = args.property or config.get("gscProperty") or site_url
    sitemap_url = args.sitemap or f"{site_url}/sitemap.xml"

    try:
        service = build_service()
        service.sitemaps().submit(siteUrl=property_id, feedpath=sitemap_url).execute()
        print(json.dumps({"status": "ok", "property": property_id, "sitemap": sitemap_url}, ensure_ascii=False))
        return 0
    except Exception as exc:
        print(json.dumps({"status": "error", "reason": sanitize_error(str(exc))}, ensure_ascii=False))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
