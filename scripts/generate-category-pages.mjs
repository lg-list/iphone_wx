import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const siteUrl = "https://fixmob.tech";
const publisherId = "ca-pub-3173901746543144";
const categories = {
  screen: {
    file: "screen-repair-guides.html",
    title: "iPhone Screen Replacement Guides by Model",
    heading: "iPhone screen replacement guides",
    description:
      "Browse iPhone screen replacement guides by model, with repair photos, safety notes, display cable warnings, tools, and screw measurements.",
    intro:
      "Choose the exact iPhone model before opening the display. These guides cover cracked glass, OLED damage, touch failure, display cables, sensor assemblies, and waterproof adhesive.",
    image: "assets/repair-photos/local/BO6lEF2W1kX5S1sI-huge.jpg",
    imageWidth: 1600,
    imageHeight: 1200,
    label: "Screen Replacement"
  },
  battery: {
    file: "battery-replacement-guides.html",
    title: "iPhone Battery Replacement Guides by Model",
    heading: "iPhone battery replacement guides",
    description:
      "Browse iPhone battery replacement guides by model, with safe discharge instructions, repair photos, adhesive removal notes, tools, and screw measurements.",
    intro:
      "Select the exact iPhone model for battery removal instructions. Discharge the battery below 25%, protect internal connectors, and keep every screw in its original position.",
    image: "assets/repair-photos/local/2QwDP1nNyyYBhu5J-huge.jpg",
    imageWidth: 1600,
    imageHeight: 1200,
    label: "Battery Replacement"
  },
  backglass: {
    file: "back-glass-repair-guides.html",
    title: "iPhone Back Glass Repair Guides by Model",
    heading: "iPhone back glass repair guides",
    description:
      "Browse iPhone back glass repair guides by model, with repair photos, heat and glass safety notes, wireless charging precautions, and screw maps.",
    intro:
      "Back glass work can involve heat, sharp glass, camera hardware, and wireless charging components. Use the model-specific guide and wear appropriate eye and hand protection.",
    image: "assets/repair-photos/local/Feh6TUrm2uIveIQC-large.jpg",
    imageWidth: 800,
    imageHeight: 600,
    label: "Back Glass Repair"
  }
};

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
  return a.name.localeCompare(b.name, "en", {
    numeric: true,
    sensitivity: "base"
  });
}

for (const [type, category] of Object.entries(categories)) {
  const repairDir = path.join(root, "repairs", type);
  const guides = [];

  for (const file of await readdir(repairDir)) {
    if (!file.endsWith(".html")) continue;
    const html = await readFile(path.join(repairDir, file), "utf8");
    if (html.includes('name="robots" content="noindex')) continue;
    const image =
      html.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ??
      `${siteUrl}/${category.image}`;
    guides.push({
      name: modelName(file),
      href: `repairs/${type}/${file}`,
      image
    });
  }

  guides.sort(modelSort);
  const canonical = `${siteUrl}/${category.file}`;
  const itemList = guides.map((guide, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: `${guide.name} ${category.label} Guide`,
    url: `${siteUrl}/${guide.href}`
  }));
  const cards = guides
    .map(
      (guide) => `        <article class="guide-card">
          <img src="${guide.image.replace(`${siteUrl}/`, "")}" alt="${guide.name} ${category.label.toLowerCase()} guide" loading="lazy">
          <div>
            <h2>${guide.name}</h2>
            <p>Open the model-specific ${category.label.toLowerCase()} tutorial with repair photos and safety notes.</p>
            <a href="${guide.href}">View ${guide.name} guide</a>
          </div>
        </article>`
    )
    .join("\n");

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#ffffff">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}" crossorigin="anonymous"></script>
  <title>${category.title}</title>
  <meta name="description" content="${category.description}">
  <meta name="author" content="FixMob">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="FixMob">
  <meta property="og:title" content="${category.title}">
  <meta property="og:description" content="${category.description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${siteUrl}/${category.image}">
  <meta property="og:image:width" content="${category.imageWidth}">
  <meta property="og:image:height" content="${category.imageHeight}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${category.title}">
  <meta name="twitter:description" content="${category.description}">
  <meta name="twitter:image" content="${siteUrl}/${category.image}">
  <link rel="icon" href="favicon.ico" sizes="any">
  <link rel="icon" type="image/svg+xml" href="assets/fixmob-mark.svg">
  <link rel="stylesheet" href="styles.css">
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.title,
    description: category.description,
    url: canonical,
    inLanguage: "en",
    publisher: {
      "@type": "Organization",
      name: "FixMob",
      url: `${siteUrl}/`
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: guides.length,
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
        <a href="site-map.html">Site Map</a>
      </div>
    </nav>
    <div class="category-intro">
      <p class="eyebrow">Model-Specific Repair Library</p>
      <h1>${category.heading}</h1>
      <p>${category.intro}</p>
    </div>
  </header>
  <main class="category-main">
    <div class="category-summary">
      <p><strong>${guides.length} model guides</strong> are currently available in this category.</p>
      <a href="site-map.html">Open the full site map</a>
    </div>
    <section class="guide-grid" aria-label="${category.label} guides">
${cards}
    </section>
  </main>
</body>
</html>
`;

  await writeFile(path.join(root, category.file), html, "utf8");
  console.log(`Generated ${category.file} with ${guides.length} guides.`);
}
