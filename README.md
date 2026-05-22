# Apple iPhone Repair Guides

Static English iPhone repair guide site for GitHub Pages or another static host.

## Content policy for this project

This project is designed for original, verified repair content:

- Real teardown photos that you own or are licensed to use commercially.
- Exact screw type, length, quantity, and position notes.
- Model-specific safety notes.
- Clear source references for technical verification.

The current build pipeline can create research pages from iFixit guide data while the site is being assembled. Do not assume those external photos or copied step text are cleared for an ad-supported commercial site. Replace external guide photos and source text with original or commercially licensed content before public monetized launch.

## Build

```powershell
node scripts/build-site.mjs
node scripts/generate-sitemap.mjs
```

## SEO launch checklist

1. Set the real domain in `site.config.json`.
2. Rebuild detail pages and regenerate `sitemap.xml` and `robots.txt`.
3. Replace the placeholder contact email in `contact.html`.
4. Finalize the privacy policy for analytics, cookies, ads, and target regions.
5. Add verified pages to Search Console and submit the sitemap.
6. Keep thin or unverified pages `noindex,follow` until they contain original repair value.

## AdSense launch checklist

1. Add the real AdSense publisher ID only after approval/setup.
2. Create a real `ads.txt` from `ads.txt.example`.
3. Do not place ads where they interrupt safety instructions, hide screw tables, or mimic repair navigation controls.
4. Confirm all commercial-use rights for photos, diagrams, and copied text before enabling ads.
