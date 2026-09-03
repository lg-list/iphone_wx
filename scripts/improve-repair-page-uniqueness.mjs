import { readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteUrl = "https://fixmob.tech";
const buildDate = "2026-09-03";

const models = [
  ["iphone-x", "iPhone X", "2017", "5.8-inch", "Lightning", "first Face ID iPhone with an OLED display and a compact stainless frame", "#d7dde4"],
  ["iphone-xr", "iPhone XR", "2018", "6.1-inch", "Lightning", "single-camera LCD model with a wider display frame and colorful aluminum housing", "#f0d05b"],
  ["iphone-xs", "iPhone XS", "2018", "5.8-inch", "Lightning", "compact OLED model with a dense internal layout around the display connectors", "#d8c4a5"],
  ["iphone-xs-max", "iPhone XS Max", "2018", "6.5-inch", "Lightning", "large OLED model with longer flex routing and more room for bracket handling", "#d8c4a5"],
  ["iphone-11", "iPhone 11", "2019", "6.1-inch", "Lightning", "dual-camera LCD model with a tall battery and broad adhesive perimeter", "#b9d7c7"],
  ["iphone-11-pro", "iPhone 11 Pro", "2019", "5.8-inch", "Lightning", "triple-camera OLED model with tight upper-board connector spacing", "#9eb2a5"],
  ["iphone-11-pro-max", "iPhone 11 Pro Max", "2019", "6.5-inch", "Lightning", "large triple-camera OLED model with a bigger battery footprint", "#9eb2a5"],
  ["iphone-12-mini", "iPhone 12 mini", "2020", "5.4-inch", "Lightning", "small flat-sided model where cable slack and screw sorting matter more than force", "#aac4df"],
  ["iphone-12", "iPhone 12", "2020", "6.1-inch", "Lightning", "flat-sided 5G model with MagSafe hardware behind the rear housing", "#aac4df"],
  ["iphone-12-pro", "iPhone 12 Pro", "2020", "6.1-inch", "Lightning", "flat-sided Pro model with camera and LiDAR hardware close to the rear assembly", "#b9c3c9"],
  ["iphone-12-pro-max", "iPhone 12 Pro Max", "2020", "6.7-inch", "Lightning", "large Pro model with broad display adhesive and more leverage at the corners", "#b9c3c9"],
  ["iphone-13-mini", "iPhone 13 mini", "2021", "5.4-inch", "Lightning", "small diagonal-camera model with limited room around battery and display flexes", "#e6b8c9"],
  ["iphone-13", "iPhone 13", "2021", "6.1-inch", "Lightning", "diagonal-camera model with strong perimeter adhesive and compact connector covers", "#e6b8c9"],
  ["iphone-13-pro", "iPhone 13 Pro", "2021", "6.1-inch", "Lightning", "ProMotion OLED model with dense top sensor and display hardware", "#a8b8c6"],
  ["iphone-13-pro-max", "iPhone 13 Pro Max", "2021", "6.7-inch", "Lightning", "large ProMotion OLED model with heavy glass and a wide battery area", "#a8b8c6"],
  ["iphone-14", "iPhone 14", "2022", "6.1-inch", "Lightning", "repair-friendly rear-opening model with diagonal cameras and easier back access", "#e4d5b7"],
  ["iphone-14-plus", "iPhone 14 Plus", "2022", "6.7-inch", "Lightning", "larger rear-opening model with more glass area and longer adhesive runs", "#e4d5b7"],
  ["iphone-14-pro", "iPhone 14 Pro", "2022", "6.1-inch", "Lightning", "Dynamic Island Pro model with delicate sensor and display connector work", "#b5a68e"],
  ["iphone-14-pro-max", "iPhone 14 Pro Max", "2022", "6.7-inch", "Lightning", "large Dynamic Island Pro model with heavier display and tight top hardware", "#b5a68e"],
  ["iphone-15", "iPhone 15", "2023", "6.1-inch", "USB-C", "USB-C model with rear-opening access and a cleaner midframe service path", "#d7dfd2"],
  ["iphone-15-plus", "iPhone 15 Plus", "2023", "6.7-inch", "USB-C", "larger USB-C model with broad rear glass and longer connector reach", "#d7dfd2"],
  ["iphone-15-pro", "iPhone 15 Pro", "2023", "6.1-inch", "USB-C", "titanium Pro model where camera, display, and rear glass parts sit tightly together", "#a49d92"],
  ["iphone-15-pro-max", "iPhone 15 Pro Max", "2023", "6.7-inch", "USB-C", "large titanium Pro model with a heavy display and sensitive rear-camera zone", "#a49d92"],
  ["iphone-16e", "iPhone 16e", "2025", "6.1-inch", "USB-C", "single-camera USB-C model with a simpler rear camera area but modern adhesive", "#f1f1f1"],
  ["iphone-16", "iPhone 16", "2024", "6.1-inch", "USB-C", "vertical-camera USB-C model with updated button and cable placement", "#cbd8c9"],
  ["iphone-16-plus", "iPhone 16 Plus", "2024", "6.7-inch", "USB-C", "larger vertical-camera model with a wide display and longer adhesive perimeter", "#cbd8c9"],
  ["iphone-16-pro", "iPhone 16 Pro", "2024", "6.3-inch", "USB-C", "Pro model with Camera Control hardware and tight display connector routing", "#b8aea1"],
  ["iphone-16-pro-max", "iPhone 16 Pro Max", "2024", "6.9-inch", "USB-C", "largest Pro model with a heavy panel, long adhesive edges, and dense top hardware", "#b8aea1"],
  ["iphone-17e", "iPhone 17e", "2026", "6.1-inch", "USB-C", "entry 17-series style model where screw tracking and gentle heat control are the priority", "#f2f3f4"],
  ["iphone-17", "iPhone 17", "2025", "6.3-inch", "USB-C", "standard 17-series model with newer internal spacing and updated display hardware", "#d7e4f1"],
  ["iphone-air", "iPhone Air", "2025", "6.5-inch", "USB-C", "thin single-camera model where flex cable strain and pressure marks need extra care", "#e7e2d7"],
  ["iphone-17-pro", "iPhone 17 Pro", "2025", "6.3-inch", "USB-C", "17-series Pro model with a large camera plateau and dense upper-frame hardware", "#d0b08e"],
  ["iphone-17-pro-max", "iPhone 17 Pro Max", "2025", "6.9-inch", "USB-C", "largest 17-series Pro model with broad glass, long cable reach, and high part density", "#d0b08e"]
].map(([slug, name, year, size, port, profile, color]) => ({ slug, name, year, size, port, profile, color }));

const repairTypes = {
  screen: {
    label: "Screen Replacement",
    short: "screen",
    problem: "cracked glass, black display, green lines, ghost touch, or failed touch response",
    goal: "separate the display adhesive, protect display and sensor flex cables, move any required small parts, and test the panel before sealing",
    risk: "display flex cables, top sensor hardware, waterproof adhesive, and mixed-length bracket screws",
    close: "touch response, brightness, True Tone where available, Face ID or sensor behavior, earpiece sound, and clean frame seating",
    tools: ["P2 pentalobe driver", "Y000 driver", "suction handle", "opening picks", "heat source", "spudger"],
    categoryUrl: "screen-repair-guides.html"
  },
  battery: {
    label: "Battery Replacement",
    short: "battery",
    problem: "weak battery health, short runtime, random shutdowns, swelling risk, or charging instability",
    goal: "open the phone safely, disconnect power early, release stretch adhesive, fit the new cell, and verify startup before final sealing",
    risk: "battery puncture, adhesive strips, board connectors, Taptic Engine area, and bracket screw order",
    close: "battery connector seating, clean adhesive channels, boot behavior, charging response, and no loose screw inside the housing",
    tools: ["P2 pentalobe driver", "Y000 driver", "plastic cards", "isopropyl alcohol", "opening picks", "spudger"],
    categoryUrl: "battery-replacement-guides.html"
  },
  backglass: {
    label: "Back Glass Replacement",
    short: "back glass",
    problem: "shattered rear glass, sharp cracks, damaged camera surround, wireless charging problems, or rear housing repair planning",
    goal: "control heat, protect cameras and wireless charging parts, manage glass fragments, and reseal the rear assembly cleanly",
    risk: "broken glass, camera lenses, wireless charging coil, flash cable, battery heat exposure, and rear adhesive alignment",
    close: "camera openings, wireless charging area, flash alignment, glass fragment cleanup, and even rear-panel pressure",
    tools: ["heat source", "eye protection", "opening picks", "plastic cards", "tweezers", "adhesive strips"],
    categoryUrl: "back-glass-repair-guides.html"
  }
};

const familyNotes = [
  [/^iphone-x($|r|s)/, "The X-series chassis opens with older Face ID-era cable routing, so keep the display supported while each connector cover is removed."],
  [/^iphone-11/, "The 11-series frame gives more working room than the mini models, but the display and battery areas still punish mixed screws."],
  [/^iphone-12/, "The 12-series flat edges make heat control important; soften the adhesive before sliding picks around the squared corners."],
  [/^iphone-13/, "The 13-series adhesive can feel stubborn near the corners, so work shallow and reheat instead of levering against the frame."],
  [/^iphone-14($|-plus)/, "The standard 14-series rear-opening layout changes the order of access; note whether the photo is showing the display side or rear glass side."],
  [/^iphone-14-pro/, "The 14 Pro layout places display and sensor hardware close to the top edge, so upper-frame pressure should stay light."],
  [/^iphone-15($|-plus)/, "The standard 15-series rear-opening design gives better battery access, but the back glass cable still needs support when opened."],
  [/^iphone-15-pro/, "The 15 Pro titanium frame and camera area leave less margin for aggressive tools near the rear assembly."],
  [/^iphone-16/, "The 16-series layout uses newer button and connector routing, so compare each photo before assuming it matches older models."],
  [/^iphone-17|^iphone-air/, "For the newer 17-series style pages, use the screw table as the primary map and avoid borrowing assumptions from older chassis generations."]
];

function familyNote(slug) {
  return familyNotes.find(([pattern]) => pattern.test(slug))?.[1] ?? "Compare the photo with the exact model before moving parts; similar iPhones can hide different cable paths.";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function stripTags(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanText(value) {
  return stripTags(value)
    .replace(/\bherestepid=\d+\b/gi, "the related step")
    .replace(/\b(\w+)stepid=\d+\|?/gi, "$1")
    .replace(/\bstepid=\d+\|?/gi, "")
    .replace(/\s+-\s+he\b/g, " the")
    .replace(/\s+-\s+hey\b/g, " they")
    .replace(/\s+-\s+own\b/g, " down")
    .replace(/\s+-\s+ntil\b/g, " until")
    .replace(/\s+-\s+irst\b/g, " first")
    .replace(/\s+-\s+ne\b/g, " one")
    .replace(/\s+-\s+ou\b/g, " you")
    .replace(/\s+-\s+ot\b/g, " not")
    .replace(/\b(\w+)-\s+he\b/g, "$1 the")
    .replace(/\b-\s?ntil\b/g, "until")
    .replace(/\b-\s?irst\b/g, "first")
    .replace(/\b-\s?ne\b/g, "one")
    .replace(/\b-\s?ou\b/g, "you")
    .replace(/\b-\s?hey\b/g, "they")
    .replace(/\b-\s?own\b/g, "down")
    .replace(/\b-\s?ot\b/g, "not")
    .replace(/\bbatterystepid=\d+\b/gi, "battery")
    .replace(/\s+/g, " ")
    .trim();
}

function sentenceStart(value) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function inferStepTitle(title, text, position, repair) {
  if (!/^Photo step \d+$/i.test(title)) return title;
  const lower = text.toLowerCase();
  const matches = [
    ["pentalobe", "Handle the pentalobe screws"],
    ["connector cover", "Work on the connector cover"],
    ["disconnect", "Disconnect the related cable"],
    ["connect", "Reconnect and test the cable"],
    ["adhesive", "Separate the adhesive"],
    ["heat", "Warm the adhesive edge"],
    ["opening pick", "Guide the opening pick"],
    ["suction", "Lift with steady suction"],
    ["battery", "Work around the battery"],
    ["screen", "Support the screen"],
    ["display", "Support the display"],
    ["back glass", "Position the back glass"],
    ["camera", "Protect the camera area"],
    ["liner", "Remove adhesive liners"],
    ["bracket", "Move the bracket carefully"],
    ["speaker", "Handle the speaker assembly"],
    ["sensor", "Handle the sensor cable"],
    ["press", "Apply even closing pressure"]
  ];
  const found = matches.find(([needle]) => lower.includes(needle));
  if (found) return found[1];
  if (position <= 3) return `Prepare the ${repair.short} repair`;
  return `Continue the ${repair.short} sequence`;
}

function sentenceLimit(value, max = 270) {
  const text = cleanText(value);
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "), cut.lastIndexOf(", "));
  return `${cut.slice(0, lastStop > 120 ? lastStop + 1 : max).trim()}...`;
}

function metaDescription(model, repair, stepCount) {
  const countText = stepCount ? `${stepCount} photos` : "model notes";
  const symptom = {
    screen: "cracked glass, black screen, green lines, or touch issues",
    battery: "weak battery health, fast drain, shutdowns, or charging issues",
    "back glass": "rear glass cracks, camera ring damage, or wireless charging checks"
  }[repair.short];
  return `${model.name} ${repair.short} repair guide for ${symptom}, with ${countText}, safety notes, screw checks, and closing tests.`;
}

function extractSteps(html, repair) {
  return [...html.matchAll(/<article class="step">([\s\S]*?)<\/article>/g)].map((match, index) => {
    const block = match[1];
    const image = block.match(/<img src="([^"]+)"/)?.[1] ?? "";
    const text = cleanText([...block.matchAll(/<p(?! class="(?:beginner-note|warning)")([^>]*)>([\s\S]*?)<\/p>/g)].map((p) => p[2]).join(" "));
    const rawTitle = cleanText(block.match(/<h3>([\s\S]*?)<\/h3>/)?.[1] ?? `Photo step ${index + 1}`);
    const title = inferStepTitle(rawTitle, text, index + 1, repair);
    return { position: index + 1, image, title, text };
  });
}

function extractSection(html, id) {
  return html.match(new RegExp(`<section class="section" id="${id}">([\\s\\S]*?)<\\/section>`))?.[0] ?? "";
}

function extractSpec(html, model, repair) {
  const spec = html.match(/<section class="section">\s*<div class="spec-grid">([\s\S]*?)<\/div>\s*<\/section>/)?.[0];
  if (spec) return spec;
  return `    <section class="section">
      <div class="spec-grid">
        <div class="spec"><span>Model</span><strong>${escapeHtml(model.name)}</strong></div>
        <div class="spec"><span>Year / size</span><strong>${escapeHtml(model.year)} / ${escapeHtml(model.size)}</strong></div>
        <div class="spec"><span>Port</span><strong>${escapeHtml(model.port)}</strong></div>
        <div class="spec"><span>Repair focus</span><strong>${escapeHtml(repair.label)}</strong></div>
      </div>
    </section>`;
}

function modelImagePath(model) {
  const candidates = {
    "iphone-17-pro-max": "assets/home/iPhone17Promax.jpg",
    "iphone-17-pro": "assets/home/17pro.jpeg",
    "iphone-17": "assets/home/17.jpg",
    "iphone-17e": "assets/home/17e.jpg",
    "iphone-air": "assets/home/17air.jpg"
  };
  if (candidates[model.slug]) return candidates[model.slug];
  for (const ext of ["png", "jpg", "jpeg"]) {
    const asset = `assets/home/models/${model.slug}.${ext}`;
    if (existsSync(path.join(root, asset))) return asset;
  }
  return "assets/iphone-front-back-real.png";
}

function renderPlanningJsonLd(model, repair, type, title, description, image) {
  const canonical = `${siteUrl}/repairs/${type}/${model.slug}.html`;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "FixMob", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: repair.label, item: `${siteUrl}/${repair.categoryUrl}` },
      { "@type": "ListItem", position: 3, name: title, item: canonical }
    ]
  };
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: `${siteUrl}/${image}`,
    inLanguage: "en",
    datePublished: buildDate,
    dateModified: buildDate,
    articleSection: `${model.name} ${repair.label}`,
    about: [
      { "@type": "Thing", name: model.name },
      { "@type": "Thing", name: repair.label }
    ],
    author: { "@type": "Organization", name: "FixMob" },
    publisher: {
      "@type": "Organization",
      name: "FixMob",
      url: `${siteUrl}/`,
      logo: { "@type": "ImageObject", url: `${siteUrl}/assets/fixmob-mark.svg` }
    },
    mainEntityOfPage: canonical
  };
  return `  <script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>
  <script type="application/ld+json">${JSON.stringify(article)}</script>`;
}

function renderPlanningPage(model, repair, type) {
  const title = `${model.name} Back Glass Repair Planning Guide`;
  const description = metaDescription(model, repair, 0);
  const image = modelImagePath(model);
  const canonical = `${siteUrl}/repairs/${type}/${model.slug}.html`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#ffffff">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3173901746543144"
     crossorigin="anonymous"></script>
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="author" content="FixMob">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="FixMob">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${siteUrl}/${image}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${siteUrl}/${image}">
  <link rel="icon" href="../../favicon.ico" sizes="any">
  <link rel="icon" type="image/svg+xml" href="../../assets/fixmob-mark.svg">
  <link rel="stylesheet" href="../../detail.css">
${renderPlanningJsonLd(model, repair, type, title, description, image)}
</head>
<body style="--phone-color: ${model.color}">
${renderTopbar()}
  <header class="hero">
    <div>
      <span class="verified-badge">${escapeHtml(model.year)} ${escapeHtml(model.size)} ${escapeHtml(model.port)} planning guide</span>
      <p class="eyebrow">Model-Specific Repair Notes</p>
      <h1>${escapeHtml(title)}</h1>
      <p>This page is a standalone ${model.name} back glass planning guide. It focuses on the model's rear housing layout, glass-removal risks, camera protection, wireless charging checks, and closing inspection.</p>
    </div>
    <figure>
      <img src="../../${escapeHtml(image)}" alt="${escapeHtml(model.name)} back glass repair planning reference">
      <figcaption>${escapeHtml(model.name)} rear housing reference.</figcaption>
    </figure>
  </header>
  <main>
    <section class="section">
      <div class="spec-grid">
        <div class="spec"><span>Model</span><strong>${escapeHtml(model.name)}</strong></div>
        <div class="spec"><span>Year / size</span><strong>${escapeHtml(model.year)} / ${escapeHtml(model.size)}</strong></div>
        <div class="spec"><span>Port</span><strong>${escapeHtml(model.port)}</strong></div>
        <div class="spec"><span>Repair focus</span><strong>Back Glass Planning</strong></div>
      </div>
    </section>
${renderModelSection(model, repair, 0).replace("The 0 photo steps are kept in bench order so the screw table and the visible part position stay aligned.", "Use the sections below to decide whether the repair needs a full rear-housing swap, rear glass-only service, or professional laser and heat equipment.")}
    <section class="section" id="before">
      <div class="section-heading"><p class="eyebrow">Start Here</p><h2>${escapeHtml(model.name)} back glass repair decision points</h2></div>
      <div class="beginner-grid">
        <article class="guide-panel">
          <h3>Glass condition</h3>
          <p>Small cracks can hide loose shards around the camera ring and wireless charging area. On ${model.name}, inspect the rear glass under strong light before heat or pressure.</p>
        </article>
        <article class="guide-panel guide-panel--warning">
          <h3>Heat risk</h3>
          <p>${escapeHtml(model.profile)}. Keep heat moving so the battery, cameras, flash cable, and wireless charging hardware are not overheated.</p>
        </article>
        <article class="guide-panel">
          <h3>Tool plan</h3>
          <ul>
            <li>Use eye protection, heat control, plastic tools, tweezers, and adhesive cleanup supplies.</li>
            <li>Keep the ${model.size} frame supported so pressure does not twist the housing.</li>
            <li>Stop if glass starts chipping toward the battery or camera openings.</li>
          </ul>
        </article>
        <article class="guide-panel">
          <h3>Closing check</h3>
          <p>Before sealing, check camera glass edges, wireless charging alignment, flash opening, rear microphone area, adhesive coverage, and frame straightness.</p>
        </article>
      </div>
      <div class="status-note"><strong>Model-specific rule:</strong> ${escapeHtml(familyNote(model.slug))}</div>
    </section>
    <section class="section" id="steps">
      <div class="section-heading"><p class="eyebrow">Repair Workflow</p><h2>Suggested ${escapeHtml(model.name)} back glass workflow</h2></div>
      <div class="steps">
        ${["Inspect the rear glass and camera surround", "Power off and prepare heat-safe support", "Soften adhesive gradually", "Lift glass fragments away from cameras and battery", "Clean the rear housing", "Dry fit the replacement back glass", "Test wireless charging and camera openings", "Apply final pressure evenly"].map((step, index) => `<article class="step">
          <figure>
            <img src="../../${escapeHtml(image)}" alt="${escapeHtml(model.name)} back glass workflow step ${index + 1}: ${step}" loading="${index < 2 ? "eager" : "lazy"}">
            <figcaption>${step}</figcaption>
          </figure>
          <div>
            <span class="step-number">${String(index + 1).padStart(2, "0")}</span>
            <h3>${step}</h3>
            <p class="beginner-note"><strong>${escapeHtml(model.name)} note:</strong> ${escapeHtml(model.profile)}.</p>
            <p>Use this checkpoint to keep the ${model.name} rear repair controlled. Confirm the part position, nearby cable path, heat level, and glass condition before moving forward.</p>
            <p class="warning">Back glass rule: protect cameras, battery, wireless charging hardware, and exposed glass edges at every step.</p>
          </div>
        </article>`).join("\n")}
      </div>
    </section>
    <section class="section" id="screws">
      <div class="section-heading"><p class="eyebrow">Screw Map</p><h2>${escapeHtml(model.name)} back glass screw tracking</h2></div>
      <p class="section-lead">Back glass work often crosses bracket and connector areas. Keep any screw removed during rear-housing access on a labeled map and return it to the same location.</p>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Area</th><th>What to track</th><th>Why it matters</th></tr></thead>
          <tbody>
            <tr><td>Lower edge</td><td>Pentalobe screws and bottom clips</td><td>Wrong screw placement can affect closing pressure.</td></tr>
            <tr><td>Connector covers</td><td>Bracket screw order and length</td><td>Mixed screws can damage board layers.</td></tr>
            <tr><td>Camera area</td><td>Glass fragments and adhesive residue</td><td>Debris can block camera fit or crack the replacement glass.</td></tr>
            <tr><td>Wireless charging area</td><td>Coil alignment and cable clearance</td><td>Misalignment can weaken charging or create pressure points.</td></tr>
          </tbody>
        </table>
      </div>
    </section>
${renderFaq(model, repair)}
    <section class="section" id="references">
      <div class="section-heading"><p class="eyebrow">References</p><h2>Model and safety references</h2></div>
      <ul class="source-list">
        <li><a href="https://support.apple.com/en-mz/108044" target="_blank" rel="noopener noreferrer">Apple Support: Identify your iPhone model</a></li>
      </ul>
    </section>
${renderFooter(model, type)}
  </main>
</body>
</html>
`;
}

function stepNote(step, model, repair, total) {
  const title = step.title.toLowerCase();
  if (title.includes("pentalobe") || title.includes("screw") || title.includes("cover")) {
    return `${model.name} screw note: record this location before lifting the part. ${model.size} models can reuse similar screw colors with different lengths.`;
  }
  if (title.includes("battery") || repair.short === "battery") {
    return `${model.name} battery note: use plastic tools near the cell and pause if adhesive resistance suddenly increases.`;
  }
  if (title.includes("screen") || title.includes("display") || repair.short === "screen") {
    return `${model.name} display note: support the panel at a shallow angle so the ${model.year} flex routing is not pulled.`;
  }
  if (title.includes("glass") || repair.short === "back glass") {
    return `${model.name} rear glass note: keep heat moving and protect the camera area before sliding a tool deeper.`;
  }
  if (step.position > total - 4) {
    return `${model.name} closing note: test the repair before final pressure, then seal only after the edges sit evenly.`;
  }
  return `${model.name} checkpoint: compare the photo, part orientation, and nearby cable path before moving to the next action.`;
}

function stepWarning(step, model, repair) {
  const title = step.title.toLowerCase();
  if (title.includes("disconnect") || title.includes("connector")) {
    return `Connector rule: align over the socket first, then press from one side and the other. Do not press the middle if it feels misaligned.`;
  }
  if (title.includes("adhesive") || title.includes("heat") || title.includes("slice")) {
    return `Adhesive rule: reheat and work shallow. On ${model.name}, forcing a cold edge can bend clips or mark the frame.`;
  }
  if (title.includes("screw")) {
    return `Screw rule: return each screw to the exact ${repair.short} step location; a long screw in the wrong hole can damage the board.`;
  }
  if (repair.short === "battery") {
    return `Battery rule: never pry with metal against the cell, and keep alcohol away from powered connectors.`;
  }
  if (repair.short === "back glass") {
    return `Glass rule: remove loose shards before pressure is applied, especially near cameras and wireless charging hardware.`;
  }
  return `Part rule: keep the removed part, bracket, and screws together until the matching reassembly step.`;
}

function renderSteps(steps, model, repair, title) {
  const total = steps.length;
  return steps.map((step, index) => {
    const number = String(index + 1).padStart(2, "0");
    const loading = index < 2 ? "eager" : "lazy";
    const text = sentenceLimit(step.text || `Use the photo to complete this ${repair.short} step on ${model.name}.`, 520);
    return `        <article class="step">
          <figure>
            <img src="${escapeHtml(step.image)}" alt="${escapeHtml(title)} step ${index + 1}: ${escapeHtml(step.title)}" loading="${loading}">
            <figcaption>${escapeHtml(step.title)}</figcaption>
          </figure>
          <div>
            <span class="step-number">${number}</span>
            <h3>${escapeHtml(step.title)}</h3>
            <p class="beginner-note"><strong>${escapeHtml(model.name)} note:</strong> ${escapeHtml(stepNote(step, model, repair, total))}</p>
            <p>${escapeHtml(text)}</p>
            <p class="warning">${escapeHtml(stepWarning(step, model, repair))}</p>
          </div>
        </article>`;
  }).join("\n");
}

function renderBefore(model, repair) {
  return `    <section class="section" id="before">
      <div class="section-heading"><p class="eyebrow">Start Here</p><h2>${escapeHtml(model.name)} ${escapeHtml(repair.short)} repair planning notes</h2></div>
      <div class="beginner-grid">
        <article class="guide-panel">
          <h3>When this page fits</h3>
          <p>Use this ${model.name} guide for ${repair.problem}. The photos are arranged as a practical bench sequence so you can stop after each action and compare the part position.</p>
        </article>
        <article class="guide-panel guide-panel--warning">
          <h3>Main risk on this model</h3>
          <p>${escapeHtml(sentenceStart(model.profile))}. For this ${repair.short} repair, watch ${repair.risk}.</p>
        </article>
        <article class="guide-panel">
          <h3>Prepare the workspace</h3>
          <ul>
            <li>Power off the ${model.port} iPhone and keep the battery below 25% when the battery area will be exposed.</li>
            <li>Make a screw map for the ${model.size} housing before removing connector covers.</li>
            <li>Keep heat gentle, tools shallow, and photos open beside the phone.</li>
          </ul>
        </article>
        <article class="guide-panel">
          <h3>Before sealing</h3>
          <p>Check ${repair.close}. This final check matters more on ${model.name} because ${model.profile}.</p>
        </article>
      </div>
      <div class="status-note"><strong>Model-specific rule:</strong> ${escapeHtml(familyNote(model.slug))}</div>
    </section>`;
}

function renderModelSection(model, repair, stepCount) {
  return `    <section class="section">
      <div class="section-heading"><p class="eyebrow">Model Notes</p><h2>What is different about the ${escapeHtml(model.name)} ${escapeHtml(repair.short)} job</h2></div>
      <div class="beginner-grid">
        <article class="guide-panel">
          <h3>Chassis profile</h3>
          <p>The ${model.year} ${model.name} is a ${model.size} ${model.port} model. ${escapeHtml(sentenceStart(model.profile))}.</p>
        </article>
        <article class="guide-panel">
          <h3>Repair path</h3>
          <p>This page focuses on how to ${repair.goal}. The ${stepCount} photo steps are kept in bench order so the screw table and the visible part position stay aligned.</p>
        </article>
        <article class="guide-panel">
          <h3>Tool emphasis</h3>
          <p>Keep ${repair.tools.slice(0, 3).join(", ")} ready first, then add ${repair.tools.slice(3).join(", ")} as the phone opens.</p>
        </article>
        <article class="guide-panel">
          <h3>Quality check</h3>
          <p>After the repair, inspect ${repair.close}. If anything fails, reopen before adhesive pressure makes the correction harder.</p>
        </article>
      </div>
    </section>`;
}

function renderSearchIntentSection(model, repair, steps) {
  const earlyStep = steps.find((step) => /pentalobe|heat|suction|opening|adhesive/i.test(`${step.title} ${step.text}`)) ?? steps[0];
  const connectorStep = steps.find((step) => /connector|bracket|cable/i.test(`${step.title} ${step.text}`)) ?? steps[Math.min(steps.length - 1, 4)];
  const closingStep = steps.slice().reverse().find((step) => /install|seal|close|pressure|test/i.test(`${step.title} ${step.text}`)) ?? steps[steps.length - 1];
  const partLanguage = {
    screen: "display assembly, touch response, OLED panel behavior, Face ID sensor area, and waterproof adhesive",
    battery: "battery health, charging behavior, stretch adhesive, connector seating, and safe lithium-ion handling",
    "back glass": "rear glass damage, camera ring protection, wireless charging alignment, heat control, and shard cleanup"
  };
  const localIntent = {
    screen: "screen replacement cost, cracked iPhone glass repair, black screen repair, green line display repair, and touch failure troubleshooting",
    battery: "battery replacement cost, weak battery health, fast drain repair, random shutdown repair, and charging issue diagnosis",
    "back glass": "back glass replacement cost, cracked rear glass repair, camera lens area damage, wireless charging issue checks, and housing repair planning"
  };
  return `    <section class="section" id="search-notes">
      <div class="section-heading"><p class="eyebrow">US Repair Search Notes</p><h2>${escapeHtml(model.name)} ${escapeHtml(repair.short)} symptoms, parts, and checks</h2></div>
      <div class="beginner-grid">
        <article class="guide-panel">
          <h3>Search intent covered</h3>
          <p>This guide is written for US repair searches around ${escapeHtml(model.name)} ${escapeHtml(localIntent[repair.short] ?? `${repair.short} repair`)}. It keeps the model name, repair type, symptom, and part checks together on one page.</p>
        </article>
        <article class="guide-panel">
          <h3>Parts to confirm</h3>
          <p>Before ordering parts, match the exact ${escapeHtml(model.name)} generation, ${escapeHtml(model.size)} display size, ${escapeHtml(model.port)} connector style, and the ${escapeHtml(partLanguage[repair.short])} mentioned in this guide.</p>
        </article>
        <article class="guide-panel">
          <h3>High-value photo checks</h3>
          <p>Pay extra attention to step ${earlyStep.position} (${escapeHtml(earlyStep.title)}), step ${connectorStep.position} (${escapeHtml(connectorStep.title)}), and step ${closingStep.position} (${escapeHtml(closingStep.title)}). These photos usually decide whether the repair stays clean or needs to be reopened.</p>
        </article>
        <article class="guide-panel">
          <h3>Result to verify</h3>
          <p>A successful ${escapeHtml(model.name)} ${escapeHtml(repair.short)} repair should pass the closing checks, sit flush around the frame, and show no new warnings, loose brackets, lifted adhesive, or cable pressure marks.</p>
        </article>
      </div>
    </section>`;
}

function renderFaq(model, repair) {
  return `    <section class="section" id="faq">
      <div class="section-heading"><p class="eyebrow">FAQ</p><h2>${escapeHtml(model.name)} ${escapeHtml(repair.short)} repair questions</h2></div>
      <div class="beginner-grid">
        <article class="guide-panel">
          <h3>Can I use a guide from another iPhone?</h3>
          <p>No. Similar generations often share repair ideas, but ${model.name} has its own ${model.size} housing, ${model.port} port layout, screw positions, and cable routing.</p>
        </article>
        <article class="guide-panel">
          <h3>What should I test before closing?</h3>
          <p>For this ${repair.short} repair, test ${repair.close}. Do this before final adhesive pressure.</p>
        </article>
        <article class="guide-panel">
          <h3>Why use the screw table?</h3>
          <p>The table highlights steps where length or bracket position matters. Mixed screws are one of the easiest ways to turn a simple ${model.name} repair into board damage.</p>
        </article>
        <article class="guide-panel">
          <h3>When should I stop?</h3>
          <p>Stop if heat becomes excessive, a connector will not align, the battery bends, or glass fragments move toward cameras, cables, or the board.</p>
        </article>
      </div>
    </section>`;
}

function renderTopbar() {
  return `  <nav class="topbar">
    <a class="topbar__brand" href="../../index.html" aria-label="FixMob home">
      <img class="topbar__logo" src="../../assets/fixmob-logo.svg" alt="FixMob">
    </a>
    <div class="topbar__links">
      <a href="#before">Start Here</a>
      <a href="#steps">Steps</a>
      <a href="#screws">Screws</a>
      <a href="#faq">FAQ</a>
      <a href="#references">References</a>
    </div>
  </nav>`;
}

function renderFooter(model, type) {
  return `    <div class="footer-nav">
      <a href="../../index.html">Back to model index</a>
      <a href="../screen/${model.slug}.html"${type === "screen" ? ' aria-current="page"' : ""}>Screen</a>
      <a href="../battery/${model.slug}.html"${type === "battery" ? ' aria-current="page"' : ""}>Battery</a>
      <a href="../backglass/${model.slug}.html"${type === "backglass" ? ' aria-current="page"' : ""}>Back Glass</a>
    </div>`;
}

function renderJsonLd(model, repair, type, title, description, heroImage, steps) {
  const canonical = `${siteUrl}/repairs/${type}/${model.slug}.html`;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "FixMob", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: repair.label, item: `${siteUrl}/${repair.categoryUrl}` },
      { "@type": "ListItem", position: 3, name: title, item: canonical }
    ]
  };
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: `${siteUrl}/${heroImage.replace(/^\.\.\/\.\.\//, "")}`,
    inLanguage: "en",
    datePublished: buildDate,
    dateModified: buildDate,
    articleSection: `${model.name} ${repair.label}`,
    wordCount: steps.reduce((count, step) => count + cleanText(step.text).split(/\s+/).filter(Boolean).length, 0),
    about: [
      { "@type": "Thing", name: model.name },
      { "@type": "Thing", name: repair.label },
      { "@type": "Thing", name: `${model.name} ${repair.short} repair` }
    ],
    author: { "@type": "Organization", name: "FixMob", url: `${siteUrl}/` },
    publisher: {
      "@type": "Organization",
      name: "FixMob",
      url: `${siteUrl}/`,
      logo: { "@type": "ImageObject", url: `${siteUrl}/assets/fixmob-mark.svg` }
    },
    mainEntityOfPage: canonical
  };
  return `  <script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>
  <script type="application/ld+json">${JSON.stringify(article)}</script>`;
}

async function main() {
  let updated = 0;
  for (const type of Object.keys(repairTypes)) {
    const repair = repairTypes[type];
    const dir = path.join(root, "repairs", type);
    for (const file of await readdir(dir)) {
      if (!file.endsWith(".html")) continue;
      const slug = file.replace(/\.html$/, "");
      const model = models.find((item) => item.slug === slug);
      if (!model) continue;
      const filePath = path.join(dir, file);
      const html = await readFile(filePath, "utf8");
      const steps = extractSteps(html, repair);
      if (!steps.length) {
        await writeFile(filePath, renderPlanningPage(model, repair, type), "utf8");
        updated += 1;
        continue;
      }
      const title = `${model.name} ${repair.label} Guide`;
      const description = metaDescription(model, repair, steps.length);
      const canonical = `${siteUrl}/repairs/${type}/${file}`;
      const heroImage = steps[0].image;
      const ogImage = `${siteUrl}/${heroImage.replace(/^\.\.\/\.\.\//, "")}`;
      const spec = extractSpec(html, model, repair);
      const screwSection = extractSection(html, "screws")
        .replace(/<h2>[\s\S]*?<\/h2>/, `<h2>${escapeHtml(model.name)} ${escapeHtml(repair.short)} screw and bracket table</h2>`)
        .replace(/\s*<p class="section-lead">Use this table as the [\s\S]*?until reassembly\.<\/p>/g, "")
        .replace('<div class="table-wrap">', `<p class="section-lead">Use this table as the ${model.name} screw map for the ${repair.short} job. If a row mentions a bracket, keep that bracket and its screws together until reassembly.</p>\n      <div class="table-wrap">`);
      const references = extractSection(html, "references") || `    <section class="section" id="references">
      <div class="section-heading"><p class="eyebrow">References</p><h2>Model and safety references</h2></div>
      <ul class="source-list">
        <li><a href="https://support.apple.com/en-mz/108044" target="_blank" rel="noopener noreferrer">Apple Support: Identify your iPhone model</a></li>
      </ul>
    </section>`;
      const body = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#ffffff">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3173901746543144"
     crossorigin="anonymous"></script>
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="author" content="FixMob">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="FixMob">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1600">
  <meta property="og:image:height" content="1200">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${ogImage}">
  <link rel="icon" href="../../favicon.ico" sizes="any">
  <link rel="icon" type="image/svg+xml" href="../../assets/fixmob-mark.svg">
  <link rel="stylesheet" href="../../detail.css">
${renderJsonLd(model, repair, type, title, description, heroImage, steps)}
</head>
<body style="--phone-color: ${model.color}">
${renderTopbar()}
  <header class="hero">
    <div>
      <span class="verified-badge">${escapeHtml(model.year)} ${escapeHtml(model.size)} ${escapeHtml(model.port)} repair guide</span>
      <p class="eyebrow">Model-Specific Tutorial</p>
      <h1>${escapeHtml(title)}</h1>
      <p>This ${model.name} ${repair.short} guide is written as a standalone bench page. It explains the ${model.year} ${model.size} chassis, the parts most likely to be damaged, and the checks to make before the phone is sealed again.</p>
    </div>
    <figure>
      <img src="${escapeHtml(heroImage)}" alt="${escapeHtml(title)} repair photo">
      <figcaption>${escapeHtml(model.name)} ${escapeHtml(repair.short)} opening reference.</figcaption>
    </figure>
  </header>
  <main>
${spec}
${renderModelSection(model, repair, steps.length)}
${renderBefore(model, repair)}
${renderSearchIntentSection(model, repair, steps)}
    <section class="section" id="steps">
      <div class="section-heading"><p class="eyebrow">Step By Step</p><h2>${escapeHtml(model.name)} ${escapeHtml(repair.short)} photo sequence</h2></div>
      <p class="section-lead">Follow these ${steps.length} photos in order. Each ${model.name} step includes a model note, the action from the photo, and a risk check for the ${repair.short} repair.</p>
      <div class="steps">
${renderSteps(steps, model, repair, title)}
      </div>
    </section>
${screwSection}
${renderFaq(model, repair)}
${references}
${renderFooter(model, type)}
  </main>
</body>
</html>
`;
      await writeFile(filePath, body, "utf8");
      updated += 1;
    }
  }
  console.log(`Updated ${updated} repair pages with model-specific content.`);
}

await main();
