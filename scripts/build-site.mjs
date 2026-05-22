import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const config = JSON.parse(await readFile(path.join(root, "site.config.json"), "utf8"));
const siteUrl = config.siteUrl.replace(/\/$/, "");

const models = [
  ["iPhone X", "X", "2017", "5.8-inch", "Lightning", "#d7dde4"],
  ["iPhone XR", "X", "2018", "6.1-inch", "Lightning", "#f0d05b"],
  ["iPhone XS", "X", "2018", "5.8-inch", "Lightning", "#d8c4a5"],
  ["iPhone XS Max", "X", "2018", "6.5-inch", "Lightning", "#d8c4a5"],
  ["iPhone 11", "11", "2019", "6.1-inch", "Lightning", "#b9d7c7"],
  ["iPhone 11 Pro", "11", "2019", "5.8-inch", "Lightning", "#9eb2a5"],
  ["iPhone 11 Pro Max", "11", "2019", "6.5-inch", "Lightning", "#9eb2a5"],
  ["iPhone 12 mini", "12", "2020", "5.4-inch", "Lightning", "#aac4df"],
  ["iPhone 12", "12", "2020", "6.1-inch", "Lightning", "#aac4df"],
  ["iPhone 12 Pro", "12", "2020", "6.1-inch", "Lightning", "#b9c3c9"],
  ["iPhone 12 Pro Max", "12", "2020", "6.7-inch", "Lightning", "#b9c3c9"],
  ["iPhone 13 mini", "13", "2021", "5.4-inch", "Lightning", "#e6b8c9"],
  ["iPhone 13", "13", "2021", "6.1-inch", "Lightning", "#e6b8c9"],
  ["iPhone 13 Pro", "13", "2021", "6.1-inch", "Lightning", "#a8b8c6"],
  ["iPhone 13 Pro Max", "13", "2021", "6.7-inch", "Lightning", "#a8b8c6"],
  ["iPhone 14", "14", "2022", "6.1-inch", "Lightning", "#e4d5b7"],
  ["iPhone 14 Plus", "14", "2022", "6.7-inch", "Lightning", "#e4d5b7"],
  ["iPhone 14 Pro", "14", "2022", "6.1-inch", "Lightning", "#b5a68e"],
  ["iPhone 14 Pro Max", "14", "2022", "6.7-inch", "Lightning", "#b5a68e"],
  ["iPhone 15", "15", "2023", "6.1-inch", "USB-C", "#d7dfd2"],
  ["iPhone 15 Plus", "15", "2023", "6.7-inch", "USB-C", "#d7dfd2"],
  ["iPhone 15 Pro", "15", "2023", "6.1-inch", "USB-C", "#a49d92"],
  ["iPhone 15 Pro Max", "15", "2023", "6.7-inch", "USB-C", "#a49d92"],
  ["iPhone 16e", "16", "2025", "6.1-inch", "USB-C", "#f1f1f1"],
  ["iPhone 16", "16", "2024", "6.1-inch", "USB-C", "#cbd8c9"],
  ["iPhone 16 Plus", "16", "2024", "6.7-inch", "USB-C", "#cbd8c9"],
  ["iPhone 16 Pro", "16", "2024", "6.3-inch", "USB-C", "#b8aea1"],
  ["iPhone 16 Pro Max", "16", "2024", "6.9-inch", "USB-C", "#b8aea1"],
  ["iPhone 17e", "17", "2026", "6.1-inch", "USB-C", "#f2f3f4"],
  ["iPhone 17", "17", "2025", "6.3-inch", "USB-C", "#d7e4f1"],
  ["iPhone Air", "17", "2025", "6.5-inch", "USB-C", "#e7e2d7"],
  ["iPhone 17 Pro", "17", "2025", "6.3-inch", "USB-C", "#d0b08e"],
  ["iPhone 17 Pro Max", "17", "2025", "6.9-inch", "USB-C", "#d0b08e"]
].map(([name, series, year, size, port, color]) => ({ name, series, year, size, port, color }));

const repairLabels = {
  screen: "Screen Replacement",
  battery: "Battery Replacement",
  backglass: "Back Glass Repair"
};

const guideIds = {
  "screen/iphone-x": 102423,
  "battery/iphone-x": 103390,
  "backglass/iphone-x": 125861,
  "screen/iphone-xr": 116036,
  "battery/iphone-xr": 116553,
  "backglass/iphone-xr": 132169,
  "screen/iphone-xs": 113862,
  "battery/iphone-xs": 117346,
  "screen/iphone-xs-max": 113866,
  "battery/iphone-xs-max": 117345,
  "screen/iphone-11": 135705,
  "battery/iphone-11": 127450,
  "screen/iphone-11-pro": 127512,
  "battery/iphone-11-pro": 127686,
  "screen/iphone-11-pro-max": 127817,
  "battery/iphone-11-pro-max": 128034,
  "screen/iphone-12-mini": 140482,
  "battery/iphone-12-mini": 139693,
  "screen/iphone-12": 140572,
  "battery/iphone-12": 140588,
  "backglass/iphone-12": 138893,
  "screen/iphone-12-pro": 140593,
  "battery/iphone-12-pro": 140611,
  "screen/iphone-12-pro-max": 141654,
  "battery/iphone-12-pro-max": 141661,
  "screen/iphone-13-mini": 145630,
  "battery/iphone-13-mini": 145508,
  "screen/iphone-13": 145897,
  "battery/iphone-13": 145896,
  "screen/iphone-13-pro": 146552,
  "battery/iphone-13-pro": 146608,
  "screen/iphone-13-pro-max": 146566,
  "battery/iphone-13-pro-max": 146610,
  "screen/iphone-14": 152975,
  "battery/iphone-14": 152966,
  "backglass/iphone-14": 153210,
  "screen/iphone-14-plus": 153338,
  "battery/iphone-14-plus": 153339,
  "backglass/iphone-14-plus": 153340,
  "screen/iphone-14-pro": 152972,
  "battery/iphone-14-pro": 152973,
  "screen/iphone-14-pro-max": 153003,
  "battery/iphone-14-pro-max": 153006,
  "screen/iphone-15": 165669,
  "battery/iphone-15": 165733,
  "backglass/iphone-15": 165686,
  "screen/iphone-15-plus": 166783,
  "battery/iphone-15-plus": 166864,
  "backglass/iphone-15-plus": 166834,
  "screen/iphone-15-pro": 166303,
  "battery/iphone-15-pro": 166394,
  "backglass/iphone-15-pro": 166397,
  "screen/iphone-15-pro-max": 166233,
  "battery/iphone-15-pro-max": 166239,
  "backglass/iphone-15-pro-max": 166226,
  "screen/iphone-16e": 186614,
  "battery/iphone-16e": 186615,
  "backglass/iphone-16e": 186613,
  "screen/iphone-16": 177288,
  "battery/iphone-16": 177286,
  "backglass/iphone-16": 177281,
  "screen/iphone-16-plus": 177847,
  "battery/iphone-16-plus": 177854,
  "backglass/iphone-16-plus": 177496,
  "screen/iphone-16-pro": 180298,
  "battery/iphone-16-pro": 180299,
  "backglass/iphone-16-pro": 179754,
  "screen/iphone-16-pro-max": 178634,
  "battery/iphone-16-pro-max": 178831,
  "backglass/iphone-16-pro-max": 178619,
  "screen/iphone-17e": 212404,
  "battery/iphone-17e": 212408,
  "backglass/iphone-17e": 212406,
  "screen/iphone-17": 196400,
  "battery/iphone-17": 196398,
  "backglass/iphone-17": 196399,
  "screen/iphone-air": 196410,
  "battery/iphone-air": 196436,
  "backglass/iphone-air": 196411,
  "screen/iphone-17-pro": 199459,
  "battery/iphone-17-pro": 199458,
  "backglass/iphone-17-pro": 199457,
  "screen/iphone-17-pro-max": 198145,
  "battery/iphone-17-pro-max": 198146,
  "backglass/iphone-17-pro-max": 198148
};

function slug(text) {
  return text.toLowerCase().replaceAll(" ", "-");
}

function clean(text = "") {
  return text
    .replace(/\[link\|([^\]|]+)\|([^\]|]+)(?:\|[^\]]+)?\]/g, "$2")
    .replace(/\[([^\]]+)\]/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function mediaUrl(step) {
  if (!step) return "";
  const image = step.media?.data?.[0];
  return image?.huge || image?.large || image?.standard || image?.medium || image?.original || "";
}

function stepText(step) {
  return (step.lines || [])
    .map(line => clean(line.text_raw))
    .filter(Boolean)
    .join(" ");
}

function screwRows(guide) {
  const rows = [];
  for (const step of guide.steps || []) {
    for (const line of step.lines || []) {
      const text = clean(line.text_raw);
      if (!/screw|screws/i.test(text)) continue;
      if (!/mm|millimeter/i.test(text)) continue;
      rows.push({
        step: clean(step.title || `Step ${step.stepid}`),
        color: line.bullet || "black",
        text
      });
    }
  }
  return rows;
}

function chosenSteps(guide) {
  const all = (guide.steps || []).filter(step => mediaUrl(step) && stepText(step));
  const important = all.filter(step => {
    const text = `${step.title} ${stepText(step)}`;
    return /screw|battery|display|screen|connector|bracket|adhesive|speaker|taptic|glass|rear|camera|logic board|pentalobe|sensor/i.test(text);
  });
  const merged = [];
  for (const step of [...important, ...all]) {
    if (!merged.find(item => item.stepid === step.stepid)) merged.push(step);
    if (merged.length >= 10) break;
  }
  return merged;
}

function pageShell({ title, description, model, canonicalPath, robots = "index,follow,max-image-preview:large", body }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="robots" content="${robots}">
  <link rel="canonical" href="${siteUrl}${canonicalPath}">
  <link rel="stylesheet" href="../../detail.css">
</head>
<body style="--phone-color: ${model.color}">
  <nav class="topbar">
    <a href="../../index.html">Apple iPhone Repair Guides</a>
    <div class="topbar__links">
      <a href="#steps">Photos</a>
      <a href="#screws">Screws</a>
      <a href="#sources">Sources</a>
    </div>
  </nav>
  ${body}
</body>
</html>`;
}

function verifiedPage({ model, repair, guide }) {
  const title = `${model.name} ${repairLabels[repair]} Guide`;
  const description = `${model.name} ${repairLabels[repair]} guide with real teardown photos, source links, and screw-length records from iFixit.`;
  const rows = screwRows(guide);
  const steps = chosenSteps(guide);
  const source = guide.url || `https://www.ifixit.com/Guide/${guide.guideid}`;
  const hero = mediaUrl(steps[0]) || guide.image?.large || guide.image?.standard || "";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": title,
    "description": description,
    "image": hero,
    "inLanguage": "en",
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": clean(step.title),
      "text": stepText(step),
      "image": mediaUrl(step)
    }))
  };
  const body = `<header class="hero">
    <div>
      <span class="verified-badge">Verified: real teardown photos</span>
      <p class="eyebrow">Repair Guide</p>
      <h1>${title}</h1>
      <p>This page is generated from traceable iFixit guide data and includes real teardown photos, original step text, source links, and screw-length records when the guide provides millimeter measurements.</p>
    </div>
    <figure>
      <img src="${hero}" alt="${title} real teardown photo">
      <figcaption>Real teardown photo. Source: iFixit.</figcaption>
    </figure>
  </header>
  <main>
    <section class="section">
      <div class="spec-grid">
        <div class="spec"><span>Model</span><strong>${model.name}</strong></div>
        <div class="spec"><span>Year / size</span><strong>${model.year} / ${model.size}</strong></div>
        <div class="spec"><span>Port</span><strong>${model.port}</strong></div>
        <div class="spec"><span>iFixit guide ID</span><strong>${guide.guideid}</strong></div>
      </div>
    </section>
    <section class="section" id="steps">
      <div class="section-heading"><p class="eyebrow">Real Photos</p><h2>Teardown photo steps</h2></div>
      <div class="steps">
        ${steps.length ? steps.map((step, index) => `<article class="step">
          <figure>
            <img src="${mediaUrl(step)}" alt="${model.name} ${repairLabels[repair]}: ${clean(step.title)}">
            <figcaption>${clean(step.title)}</figcaption>
          </figure>
          <div>
            <span class="step-number">${String(index + 1).padStart(2, "0")}</span>
            <h3>${clean(step.title)}</h3>
            <p>${stepText(step)}</p>
            <p class="warning">Repair note: keep every screw mapped to its original position. Original English source text is preserved to avoid changing measurements or locations during translation.</p>
          </div>
        </article>`).join("") : `<div class="status-note">This source guide does not expose step-by-step photos through the API. Add authorized local photos before treating the page as a complete tutorial.</div>`}
      </div>
    </section>
    <section class="section" id="screws">
      <div class="section-heading"><p class="eyebrow">Exact Screws</p><h2>Screw-length table</h2></div>
      ${rows.length ? `<div class="table-wrap">
        <table>
          <thead><tr><th>Step</th><th>Color / marker</th><th>Original screw note</th></tr></thead>
          <tbody>${rows.map(row => `<tr><td>${row.step}</td><td>${row.color}</td><td>${row.text}</td></tr>`).join("")}</tbody>
        </table>
      </div>` : `<div class="status-note">This source guide does not include screw notes with millimeter measurements. The page keeps the photo source, but exact screw lengths must be added from an official manual or an in-house teardown record.</div>`}
    </section>
    <section class="section" id="sources">
      <div class="section-heading"><p class="eyebrow">Sources</p><h2>Source links</h2></div>
      <ul class="source-list">
        <li><a href="${source}">${clean(guide.title)}</a></li>
        <li><a href="https://support.apple.com/en-mz/108044">Apple Support: Identify your iPhone model</a></li>
      </ul>
    </section>
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    <div class="footer-nav">
      <a href="../../index.html">Back to model index</a>
      <a href="../screen/${slug(model.name)}.html">Screen</a>
      <a href="../battery/${slug(model.name)}.html">Battery</a>
      <a href="../backglass/${slug(model.name)}.html">Back Glass</a>
    </div>
  </main>`;
  const robots = rows.length ? "index,follow,max-image-preview:large" : "noindex,follow";
  return pageShell({ title, description, model, canonicalPath: `/repairs/${repair}/${slug(model.name)}.html`, robots, body });
}

function pendingPage({ model, repair }) {
  const title = `${model.name} ${repairLabels[repair]} Guide`;
  const description = `${model.name} ${repairLabels[repair]} page pending verified teardown photos and exact screw-length records.`;
  const body = `<header class="hero">
    <div>
      <span class="pending-badge">Pending verified repair data</span>
      <p class="eyebrow">Research Needed</p>
      <h1>${title}</h1>
      <p>This page is live as a structured placeholder, but it is not presented as a complete repair tutorial yet. Real teardown photos and exact screw-length records must be added before publication as a verified guide.</p>
    </div>
    <div class="hero-phone" aria-label="${model.name} phone illustration"></div>
  </header>
  <main>
    <section class="section">
      <div class="status-note"><strong>Editorial rule:</strong> publish a verified guide only after the model and repair type have traceable teardown photos, screw type, screw length, quantity, and location notes.</div>
    </section>
    <section class="section" id="sources">
      <div class="section-heading"><p class="eyebrow">Needed</p><h2>Data required before verification</h2></div>
      <ul class="source-list">
        <li>Real teardown photos for opening, connector covers, the target part, and reassembly checks.</li>
        <li>Exact screw table with location, type, length, quantity, and photo marker.</li>
        <li>Traceable source link, official manual reference, or in-house teardown photo set.</li>
      </ul>
    </section>
    <div class="footer-nav"><a href="../../index.html">Back to model index</a></div>
  </main>`;
  return pageShell({ title, description, model, canonicalPath: `/repairs/${repair}/${slug(model.name)}.html`, robots: "noindex,follow", body });
}

async function build() {
  for (const repair of Object.keys(repairLabels)) {
    await mkdir(path.join(root, "repairs", repair), { recursive: true });
  }

  for (const model of models) {
    for (const repair of Object.keys(repairLabels)) {
      const key = `${repair}/${slug(model.name)}`;
      let html;
      if (guideIds[key]) {
        const res = await fetch(`https://www.ifixit.com/api/2.0/guides/${guideIds[key]}`);
        if (!res.ok) throw new Error(`Failed to fetch iFixit guide ${guideIds[key]}: ${res.status}`);
        html = verifiedPage({ model, repair, guide: await res.json() });
      } else {
        html = pendingPage({ model, repair });
      }
      await writeFile(path.join(root, "repairs", repair, `${slug(model.name)}.html`), html, "utf8");
    }
  }

  console.log(`Built ${models.length * Object.keys(repairLabels).length} English repair pages.`);
}

await build();
