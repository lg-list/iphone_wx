import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const config = JSON.parse(await readFile(path.join(root, "site.config.json"), "utf8"));
const siteUrl = config.siteUrl.replace(/\/$/, "");

const staticPages = [
  "index.html",
  "screen-repair-guides.html",
  "battery-replacement-guides.html",
  "back-glass-repair-guides.html",
  "screw-location-photos.html",
  "site-map.html",
  "about.html",
  "privacy.html"
];
const urls = [...staticPages.map(file => file === "index.html" ? "/" : `/${file}`)];
const highPriorityPages = new Set([
  "/screen-repair-guides.html",
  "/battery-replacement-guides.html",
  "/back-glass-repair-guides.html",
  "/screw-location-photos.html",
  "/site-map.html"
]);

for (const repair of ["screen", "battery", "backglass"]) {
  const dir = path.join(root, "repairs", repair);
  for (const file of await readdir(dir)) {
    if (!file.endsWith(".html")) continue;
    const html = await readFile(path.join(dir, file), "utf8");
    if (!html.includes('name="robots" content="noindex')) urls.push(`/repairs/${repair}/${file}`);
  }
}

const now = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
}).format(new Date());
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${siteUrl}${url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${url === "/" ? "weekly" : "monthly"}</changefreq>
    <priority>${url === "/" ? "1.0" : highPriorityPages.has(url) ? "0.8" : url.startsWith("/repairs/") ? "0.6" : "0.7"}</priority>
  </url>`).join("\n")}
</urlset>
`;

await writeFile(path.join(root, "sitemap.xml"), xml, "utf8");
await writeFile(path.join(root, "robots.txt"), `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`, "utf8");

console.log(`Generated sitemap.xml with ${urls.length} URLs.`);
