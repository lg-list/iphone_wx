import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const config = JSON.parse(await readFile(path.join(root, "site.config.json"), "utf8"));
const siteUrl = config.siteUrl.replace(/\/$/, "");
const publisherId = config.adsensePublisherId;

const repairTypes = {
  screen: {
    title: "Screen replacement guides",
    prefix: "iPhone screen repair"
  },
  battery: {
    title: "Battery replacement guides",
    prefix: "iPhone battery replacement"
  },
  backglass: {
    title: "Back glass repair guides",
    prefix: "iPhone back glass repair"
  }
};

const staticPages = [
  { title: "FixMob home", href: "/" },
  { title: "Screen repair guide collection", href: "/screen-repair-guides.html" },
  { title: "Battery replacement guide collection", href: "/battery-replacement-guides.html" },
  { title: "Back glass repair guide collection", href: "/back-glass-repair-guides.html" },
  { title: "Screw location photo library", href: "/screw-location-photos.html" },
  { title: "About FixMob", href: "/about.html" },
  { title: "Privacy policy", href: "/privacy.html" }
];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function modelName(file) {
  return file
    .replace(/\.html$/, "")
    .split("-")
    .map((part) => {
      if (part === "iphone") return "iPhone";
      if (part === "xs") return "XS";
      if (part === "xr") return "XR";
      if (part === "pro") return "Pro";
      if (part === "max") return "Max";
      if (part === "mini") return "mini";
      if (part === "air") return "Air";
      return part;
    })
    .join(" ");
}

function modelSort(a, b) {
  return a.title.localeCompare(b.title, "en", {
    numeric: true,
    sensitivity: "base"
  });
}

async function repairLinks(type, prefix) {
  const dir = path.join(root, "repairs", type);
  const links = [];

  for (const file of await readdir(dir)) {
    if (!file.endsWith(".html")) continue;
    const html = await readFile(path.join(dir, file), "utf8");
    if (html.includes('name="robots" content="noindex')) continue;
    const title = html.match(/<title>(.*?)<\/title>/s)?.[1]?.trim() ?? `${prefix} guide for ${modelName(file)}`;
    const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1]?.trim() ?? "";
    links.push({
      title,
      description,
      href: `/repairs/${type}/${file}`
    });
  }

  return links.sort(modelSort);
}

const sections = [];
sections.push({
  title: "Core pages",
  links: staticPages
});

for (const [type, repairType] of Object.entries(repairTypes)) {
  sections.push({
    title: repairType.title,
    links: await repairLinks(type, repairType.prefix)
  });
}

const itemList = sections.flatMap((section) => section.links).map((link, index) => ({
  "@type": "ListItem",
  position: index + 1,
  name: link.title,
  url: `${siteUrl}${link.href}`
}));

const sectionHtml = sections.map((section) => `      <section class="site-map-section" aria-labelledby="${section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}">
        <div class="section-heading">
          <p class="eyebrow">${section.links.length} links</p>
          <h2 id="${section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}">${escapeHtml(section.title)}</h2>
        </div>
        <div class="site-map-grid">
${section.links.map((link) => `          <a class="site-map-link" href="${escapeHtml(link.href === "/" ? "index.html" : link.href.replace(/^\//, ""))}">
            <strong>${escapeHtml(link.title)}</strong>
            ${link.description ? `<span>${escapeHtml(link.description)}</span>` : ""}
          </a>`).join("\n")}
        </div>
      </section>`).join("\n");

const description = "Browse every public FixMob iPhone repair guide, screw photo page, and repair category page from one crawlable site map.";
const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#ffffff">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}" crossorigin="anonymous"></script>
  <title>FixMob Site Map | iPhone Repair Guide Index</title>
  <meta name="description" content="${description}">
  <meta name="author" content="FixMob">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${siteUrl}/site-map.html">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="FixMob">
  <meta property="og:title" content="FixMob Site Map | iPhone Repair Guide Index">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${siteUrl}/site-map.html">
  <meta property="og:image" content="${siteUrl}/assets/home/iphone-repair-tutorial-banner.png">
  <meta property="og:image:width" content="1774">
  <meta property="og:image:height" content="887">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="FixMob Site Map | iPhone Repair Guide Index">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${siteUrl}/assets/home/iphone-repair-tutorial-banner.png">
  <link rel="icon" href="favicon.ico" sizes="any">
  <link rel="icon" type="image/svg+xml" href="assets/fixmob-mark.svg">
  <link rel="stylesheet" href="styles.css">
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "FixMob Site Map",
    description,
    url: `${siteUrl}/site-map.html`,
    inLanguage: "en",
    publisher: {
      "@type": "Organization",
      name: "FixMob",
      url: `${siteUrl}/`
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: itemList.length,
      itemListElement: itemList
    }
  })}</script>
</head>
<body>
  <header class="category-header">
    <nav class="brandbar" aria-label="Main navigation">
      <a class="brand" href="index.html" aria-label="FixMob home">
        <img class="brand-logo" src="assets/fixmob-mark.svg" alt="" aria-hidden="true">
        <span class="brand-text">FixMob</span>
      </a>
      <div class="quick-links">
        <a href="screen-repair-guides.html">Screens</a>
        <a href="battery-replacement-guides.html">Batteries</a>
        <a href="back-glass-repair-guides.html">Back Glass</a>
        <a href="screw-location-photos.html">Screw Photos</a>
      </div>
    </nav>
    <div class="category-intro">
      <p class="eyebrow">Crawlable Guide Index</p>
      <h1>FixMob iPhone repair site map</h1>
      <p>Use this page to open every public iPhone repair guide, repair category, screw photo library, and policy page currently available on FixMob.</p>
    </div>
  </header>
  <main class="category-main site-map-main">
${sectionHtml}
  </main>
</body>
</html>
`;

await writeFile(path.join(root, "site-map.html"), html, "utf8");
console.log(`Generated site-map.html with ${itemList.length} links.`);
