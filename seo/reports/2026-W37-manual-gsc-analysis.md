# Manual GSC Export Analysis 2026-W37

## Executive Summary
- Source performance export: `C:\Users\Administrator\Downloads\fixmob.tech-Performance-on-Search-2026-09-11.xlsx`
- Source coverage export: `C:\Users\Administrator\Downloads\fixmob.tech-Coverage-Drilldown-2026-09-11.xlsx`
- Total query clicks in export: 3
- Total query impressions in export: 54
- Average CTR: 5.56%
- Average position: 35.59
- Coverage issue URLs: 98
- Repair URLs in coverage issue: 90

## Why Performance Is Weak
- The site is barely indexed and has very little query data, so Google has not built enough trust or query-page history yet.
- Most impressions are coming from a tiny set of queries/pages, not a broad repair-guide footprint.
- Several pages appear in Search Console as discovered but not indexed, which usually means Google knows the URLs but has not decided they are worth crawling/indexing yet.
- Current priority should be indexability, crawl demand, unique useful page signals, internal links, and sitemap freshness before aggressive title testing.

## Top Queries
| Query | Clicks | Impressions | CTR | Position |
|---|---:|---:|---:|---:|
| iphone 17 pro screen replacement | 0 | 24 | 0.00% | 58.79 |
| fixmob | 3 | 22 | 13.64% | 6.50 |
| fix mob | 0 | 2 | 0.00% | 14.00 |
| iphone 17 screen replacement | 0 | 2 | 0.00% | 55.00 |
| fixmobil | 0 | 2 | 0.00% | 79.00 |
| apple iphone 17 pro screen replacement | 0 | 1 | 0.00% | 36.00 |
| can you replace the battery in an iphone 13 mini | 0 | 1 | 0.00% | 36.00 |

## High-Impression / Zero-Click Queries
| Query | Impressions | Position | Recommended Action |
|---|---:|---:|---|
| iphone 17 pro screen replacement | 24 | 58.79 | Map to the exact repair URL, then improve title/meta only if the page truly satisfies the intent. |
| fix mob | 2 | 14.00 | Map to the exact repair URL, then improve title/meta only if the page truly satisfies the intent. |
| iphone 17 screen replacement | 2 | 55.00 | Map to the exact repair URL, then improve title/meta only if the page truly satisfies the intent. |
| fixmobil | 2 | 79.00 | Map to the exact repair URL, then improve title/meta only if the page truly satisfies the intent. |

## Top Pages
| Page | Clicks | Impressions | CTR | Position |
|---|---:|---:|---:|---:|
| https://fixmob.tech/ | 3 | 44 | 6.82% | 12.52 |
| https://fixmob.tech/repairs/screen/iphone-17-pro.html | 0 | 28 | 0.00% | 55.68 |
| https://fixmob.tech/repairs/backglass/iphone-xs-max.html | 0 | 17 | 0.00% | 20.53 |
| https://fixmob.tech/repairs/screen/iphone-15-pro-max.html | 0 | 15 | 0.00% | 13.27 |
| https://fixmob.tech/repairs/battery/iphone-13-mini.html | 0 | 14 | 0.00% | 12.86 |
| https://fixmob.tech/repairs/screen/iphone-14.html | 0 | 10 | 0.00% | 13.00 |

## Coverage: Discovered But Not Indexed
- Affected URLs in export: 98
- First 20 affected URLs:
  - https://fixmob.tech/about.html (last crawl: 1970-01-01 00:00:00)
  - https://fixmob.tech/back-glass-repair-guides.html (last crawl: 1970-01-01 00:00:00)
  - https://fixmob.tech/battery-replacement-guides.html (last crawl: 1970-01-01 00:00:00)
  - https://fixmob.tech/contact.html (last crawl: 1970-01-01 00:00:00)
  - https://fixmob.tech/privacy.html (last crawl: 1970-01-01 00:00:00)
  - https://fixmob.tech/repairs/backglass/iphone-11-pro-max.html (last crawl: 1970-01-01 00:00:00)
  - https://fixmob.tech/repairs/backglass/iphone-11-pro.html (last crawl: 1970-01-01 00:00:00)
  - https://fixmob.tech/repairs/backglass/iphone-11.html (last crawl: 1970-01-01 00:00:00)
  - https://fixmob.tech/repairs/backglass/iphone-12-mini.html (last crawl: 1970-01-01 00:00:00)
  - https://fixmob.tech/repairs/backglass/iphone-12-pro-max.html (last crawl: 1970-01-01 00:00:00)
  - https://fixmob.tech/repairs/backglass/iphone-12-pro.html (last crawl: 1970-01-01 00:00:00)
  - https://fixmob.tech/repairs/backglass/iphone-12.html (last crawl: 1970-01-01 00:00:00)
  - https://fixmob.tech/repairs/backglass/iphone-13-mini.html (last crawl: 1970-01-01 00:00:00)
  - https://fixmob.tech/repairs/backglass/iphone-13-pro-max.html (last crawl: 1970-01-01 00:00:00)
  - https://fixmob.tech/repairs/backglass/iphone-13-pro.html (last crawl: 1970-01-01 00:00:00)
  - https://fixmob.tech/repairs/backglass/iphone-13.html (last crawl: 1970-01-01 00:00:00)
  - https://fixmob.tech/repairs/backglass/iphone-14-plus.html (last crawl: 1970-01-01 00:00:00)
  - https://fixmob.tech/repairs/backglass/iphone-14-pro-max.html (last crawl: 1970-01-01 00:00:00)
  - https://fixmob.tech/repairs/backglass/iphone-14-pro.html (last crawl: 1970-01-01 00:00:00)
  - https://fixmob.tech/repairs/backglass/iphone-14.html (last crawl: 1970-01-01 00:00:00)

## Actions To Prioritize
1. Deploy the latest local SEO build so live sitemap lastmod, robots.txt, llms.txt, and repair page schema match local code.
2. Disable Cloudflare Managed robots rules that block GPTBot, ClaudeBot, and Google-Extended if GEO/AI citation is desired.
3. Re-submit `https://fixmob.tech/sitemap.xml` in Google Search Console after deployment.
4. Use internal links from homepage/category/site-map/screw photo sections into the pages with impressions.
5. Do not create bulk new repair pages from this dataset; the export shows early crawl/indexing weakness, not enough demand evidence for expansion.
