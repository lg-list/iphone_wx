import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const config = JSON.parse(await readFile(path.join(root, "site.config.json"), "utf8"));
const siteUrl = config.siteUrl.replace(/\/$/, "");

const repairTypes = {
  screen: "Screen Replacement",
  battery: "Battery Replacement",
  backglass: "Back Glass Repair"
};

const staticPages = [
  ["Home", "/"],
  ["Screen repair guides", "/screen-repair-guides.html"],
  ["Battery replacement guides", "/battery-replacement-guides.html"],
  ["Back glass repair guides", "/back-glass-repair-guides.html"],
  ["Screw location photos", "/screw-location-photos.html"],
  ["Site map", "/site-map.html"],
  ["About", "/about.html"],
  ["Contact", "/contact.html"],
  ["Terms", "/terms.html"],
  ["Privacy", "/privacy.html"]
];

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTitle(html) {
  return html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "";
}

function getDescription(html) {
  return html.match(/<meta name="description" content="([^"]*)"/i)?.[1]?.trim() ?? "";
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

async function repairPages() {
  const pages = [];
  for (const [type, label] of Object.entries(repairTypes)) {
    const dir = path.join(root, "repairs", type);
    for (const file of await readdir(dir)) {
      if (!file.endsWith(".html")) continue;
      const html = await readFile(path.join(dir, file), "utf8");
      if (html.includes('name="robots" content="noindex')) continue;
      const title = getTitle(html);
      const description = getDescription(html);
      pages.push({
        title,
        description,
        url: `/repairs/${type}/${file}`,
        model: modelName(file),
        type: label,
        summary: stripTags(html).split(" ").slice(0, 95).join(" ")
      });
    }
  }
  return pages.sort((a, b) => a.title.localeCompare(b.title, "en", { numeric: true }));
}

const repairs = await repairPages();

const llms = `# FixMob

FixMob is a US-focused English iPhone repair guide site. It organizes screen replacement, battery replacement, back glass repair, and screw location photo resources by exact iPhone model.

## What FixMob Covers

- iPhone screen replacement guides for cracked glass, black screen, green lines, ghost touch, and display cable issues.
- iPhone battery replacement guides for weak battery health, fast drain, random shutdowns, swelling risk, and charging instability.
- iPhone back glass repair guides for cracked rear glass, camera ring damage, wireless charging checks, heat risk, and shard cleanup.
- iPhone screw location photos with bracket notes and model-specific screw-length checks.

## Important URLs

${staticPages.map(([title, url]) => `- [${title}](${siteUrl}${url})`).join("\n")}

## Repair Guide Collections

${Object.values(repairTypes).map((label) => {
  const items = repairs.filter((page) => page.type === label);
  return `### ${label}\n\n${items.map((page) => `- [${page.title}](${siteUrl}${page.url}) — ${page.description}`).join("\n")}`;
}).join("\n\n")}

## Entity Notes

- Brand: FixMob
- Website: ${siteUrl}
- Audience: English-speaking visitors in the United States researching iPhone repair preparation.
- Independence: FixMob is independent and is not affiliated with Apple Inc.
- Contact: contact@fixmob.tech
`;

const full = `# FixMob Full AI Context

This file gives AI assistants and search agents a crawl-light overview of FixMob's public repair library.

## Site Summary

FixMob provides model-specific iPhone repair preparation pages for screen replacement, battery replacement, back glass repair, and screw-location checks. The site is written for US English search intent and uses static HTML pages, canonical URLs, local images, sitemap discovery, and structured data.

## Canonical Public Pages

${staticPages.map(([title, url]) => `- ${title}: ${siteUrl}${url}`).join("\n")}

## Public Repair Pages

${repairs.map((page) => `### ${page.title}

- URL: ${siteUrl}${page.url}
- Model: ${page.model}
- Repair type: ${page.type}
- Meta description: ${page.description}
- Extractable summary: ${page.summary}
`).join("\n")}

## Safety and Editorial Notes

FixMob repair information is educational. Visitors should verify the exact iPhone model, discharge batteries before opening the device, keep screw positions mapped, avoid puncturing lithium-ion batteries, protect display and sensor cables, and consider professional help for swollen batteries or difficult back glass repairs.
`;

await writeFile(path.join(root, "llms.txt"), llms, "utf8");
await writeFile(path.join(root, "llms-full.txt"), full, "utf8");

console.log(`Generated llms.txt and llms-full.txt for ${repairs.length} repair pages.`);
