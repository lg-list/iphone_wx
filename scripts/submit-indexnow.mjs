import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const config = JSON.parse(
  await readFile(path.join(root, "site.config.json"), "utf8")
);
const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
const siteUrl = config.siteUrl.replace(/\/$/, "");
const key = "57c316b80c871d67c430f3b641da480b";
const urlList = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
  ([, url]) => url
);

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8"
  },
  body: JSON.stringify({
    host: new URL(siteUrl).hostname,
    key,
    keyLocation: `${siteUrl}/${key}.txt`,
    urlList
  })
});

if (!response.ok) {
  const body = await response.text();
  throw new Error(`IndexNow submission failed (${response.status}): ${body}`);
}

console.log(`Submitted ${urlList.length} URLs to IndexNow (${response.status}).`);
