# FixMob

Static English iPhone repair guide site for GitHub Pages or another static host.

## Content policy for this project

This project is designed for original, verified repair content:

- Real teardown photos that you own or are licensed to use commercially.
- Exact screw type, length, quantity, and position notes.
- Model-specific safety notes.
- Clear source references for technical verification.

The current site is assembled as static pages with local image assets. Before public monetized launch, confirm that every photo, measurement, and instruction text is original or commercially licensed.

## Build

```powershell
node scripts/build-site.mjs
node scripts/generate-sitemap.mjs
```

## Local photo assets

`scripts/build-site.mjs` can swap source repair-photo URLs for authorized local assets while it generates tutorial pages and the screw photo library.

1. Put licensed or original images in an `assets/` folder.
2. Copy `photo-assets.example.json` to `photo-assets.json`.
3. Map each source photo URL to a project-relative asset path such as `assets/repair-photos/example.jpg`.
4. Rebuild the site.

To cache the repair photos already referenced by the generated HTML pages and rewrite those pages to use local files, run:

```powershell
node scripts/localize-photos.mjs
```

Repair photos are stored under `assets/repair-photos/local/` and referenced directly from the static pages.
Pass a site subdirectory to rewrite a duplicate generated site with the same shared local images, for example `node scripts/localize-photos.mjs "New project"`.

## SEO launch checklist

1. Set the real domain in `site.config.json`.
2. Rebuild detail pages and regenerate `sitemap.xml` and `robots.txt`.
3. Finalize the privacy policy for analytics, cookies, ads, and target regions.
4. Add verified pages to Search Console and submit the sitemap.
5. Keep thin or unverified pages `noindex,follow` until they contain original repair value.

After publishing, notify IndexNow-supported search engines:

```powershell
node scripts/submit-indexnow.mjs
```

## AdSense launch checklist

1. Add the real AdSense publisher ID only after approval/setup.
2. Create a real `ads.txt` from `ads.txt.example`.
3. Do not place ads where they interrupt safety instructions, hide screw tables, or mimic repair navigation controls.
4. Confirm all commercial-use rights for photos, diagrams, and copied text before enabling ads.
