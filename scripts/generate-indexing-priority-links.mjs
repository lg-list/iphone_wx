import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const indexPath = path.join(root, "index.html");
const startMarker = "    <!-- BEGIN indexing-priority-links -->";
const endMarker = "    <!-- END indexing-priority-links -->";

const repairTypes = {
  screen: {
    heading: "Screen replacement guides",
    summary: "Direct links for cracked glass, OLED failure, touch faults, green lines, and display assembly checks."
  },
  battery: {
    heading: "Battery replacement guides",
    summary: "Direct links for low battery health, fast drain, swelling checks, adhesive removal, and charging tests."
  },
  backglass: {
    heading: "Back glass repair guides",
    summary: "Direct links for cracked rear glass, camera ring protection, heat risk, and wireless charging checks."
  }
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function cleanTitle(value) {
  return value
    .replace(/\s*\|\s*FixMob.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
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
      if (part === "plus") return "Plus";
      if (part === "mini") return "mini";
      if (part === "air") return "Air";
      return part;
    })
    .join(" ");
}

function sortLinks(a, b) {
  return a.model.localeCompare(b.model, "en", { numeric: true, sensitivity: "base" });
}

async function repairLinks(type) {
  const dir = path.join(root, "repairs", type);
  const links = [];
  for (const file of await readdir(dir)) {
    if (!file.endsWith(".html")) continue;
    const html = await readFile(path.join(dir, file), "utf8");
    if (html.includes('name="robots" content="noindex')) continue;
    const title = cleanTitle(html.match(/<title>(.*?)<\/title>/s)?.[1] ?? "");
    const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1]?.trim() ?? "";
    links.push({
      model: modelName(file),
      title: title || `${modelName(file)} ${repairTypes[type].heading.replace(" guides", "")}`,
      description,
      href: `repairs/${type}/${file}`
    });
  }
  return links.sort(sortLinks);
}

const groups = {};
for (const type of Object.keys(repairTypes)) {
  groups[type] = await repairLinks(type);
}

const jsonLdItems = Object.values(groups).flat().map((link, index) => ({
  "@type": "ListItem",
  position: index + 1,
  name: link.title,
  url: `https://fixmob.tech/${link.href}`
}));

const groupHtml = Object.entries(repairTypes).map(([type, meta]) => `        <article class="crawl-link-group">
          <h3>${escapeHtml(meta.heading)}</h3>
          <p>${escapeHtml(meta.summary)}</p>
          <ul>
${groups[type].map((link) => `            <li><a href="${escapeHtml(link.href)}">${escapeHtml(link.model)} ${escapeHtml(meta.heading.replace(" guides", ""))}</a></li>`).join("\n")}
          </ul>
        </article>`).join("\n");

const section = `${startMarker}
    <section class="indexing-priority-links" id="repair-index" aria-labelledby="repair-index-title">
      <div class="section-heading">
        <p class="eyebrow">Direct Repair Guide Index</p>
        <h2 id="repair-index-title">Crawlable links to every iPhone repair guide</h2>
        <p>Google Search Console reported several repair URLs as discovered but not yet indexed. This static guide index gives visitors and search crawlers direct HTML links to every model-specific screen, battery, and back glass page.</p>
      </div>
      <div class="crawl-link-grid">
${groupHtml}
      </div>
      <script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "FixMob iPhone Repair Guide Index",
        numberOfItems: jsonLdItems.length,
        itemListElement: jsonLdItems
      })}</script>
    </section>
${endMarker}`;

let html = await readFile(indexPath, "utf8");
const markerPattern = new RegExp(`${startMarker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${endMarker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
if (markerPattern.test(html)) {
  html = html.replace(markerPattern, section);
} else {
  html = html.replace(/(\n    <section class="notice" id="notice")/, `\n${section}\n$1`);
}

await writeFile(indexPath, html, "utf8");
console.log(`Generated homepage crawl index with ${jsonLdItems.length} repair links.`);
