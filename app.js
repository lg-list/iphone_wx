const repairs = {
  screen: {
    title: "Screen Replacement",
    copy: "For cracked glass, OLED damage, green lines, touch failure, or display assembly replacement.",
    tools: "Common tools: P2, Y000, suction handle, opening picks",
    risk: "Main risks: display cables, Face ID sensors, waterproof seal"
  },
  battery: {
    title: "Battery Replacement",
    copy: "For weak battery health, short runtime, unexpected shutdowns, charging issues, or swollen battery diagnosis.",
    tools: "Common tools: P2, Y000, PH000, isopropyl alcohol",
    risk: "Main risks: punctured battery, board connectors, Taptic Engine"
  },
  backglass: {
    title: "Back Glass Replacement",
    copy: "For shattered rear glass, sharp edges, damaged wireless charging areas, or rear housing replacement planning.",
    tools: "Common tools: heat plate, laser, scraper, eye protection",
    risk: "Main risks: wireless charging coil, cameras, flash flex cable"
  }
};

const models = [
  ["iPhone X", "X", "2017", "5.8-inch", "Lightning", "dual", "#d7dde4"],
  ["iPhone XR", "X", "2018", "6.1-inch", "Lightning", "single", "#f0d05b"],
  ["iPhone XS", "X", "2018", "5.8-inch", "Lightning", "dual", "#d8c4a5"],
  ["iPhone XS Max", "X", "2018", "6.5-inch", "Lightning", "dual", "#d8c4a5"],
  ["iPhone 11", "11", "2019", "6.1-inch", "Lightning", "dual-square", "#b9d7c7"],
  ["iPhone 11 Pro", "11", "2019", "5.8-inch", "Lightning", "triple", "#9eb2a5"],
  ["iPhone 11 Pro Max", "11", "2019", "6.5-inch", "Lightning", "triple", "#9eb2a5"],
  ["iPhone 12 mini", "12", "2020", "5.4-inch", "Lightning", "dual-square", "#aac4df"],
  ["iPhone 12", "12", "2020", "6.1-inch", "Lightning", "dual-square", "#aac4df"],
  ["iPhone 12 Pro", "12", "2020", "6.1-inch", "Lightning", "triple", "#b9c3c9"],
  ["iPhone 12 Pro Max", "12", "2020", "6.7-inch", "Lightning", "triple", "#b9c3c9"],
  ["iPhone 13 mini", "13", "2021", "5.4-inch", "Lightning", "dual-diagonal", "#e6b8c9"],
  ["iPhone 13", "13", "2021", "6.1-inch", "Lightning", "dual-diagonal", "#e6b8c9"],
  ["iPhone 13 Pro", "13", "2021", "6.1-inch", "Lightning", "triple", "#a8b8c6"],
  ["iPhone 13 Pro Max", "13", "2021", "6.7-inch", "Lightning", "triple", "#a8b8c6"],
  ["iPhone 14", "14", "2022", "6.1-inch", "Lightning", "dual-diagonal", "#e4d5b7"],
  ["iPhone 14 Plus", "14", "2022", "6.7-inch", "Lightning", "dual-diagonal", "#e4d5b7"],
  ["iPhone 14 Pro", "14", "2022", "6.1-inch", "Lightning", "triple-island", "#b5a68e"],
  ["iPhone 14 Pro Max", "14", "2022", "6.7-inch", "Lightning", "triple-island", "#b5a68e"],
  ["iPhone 15", "15", "2023", "6.1-inch", "USB-C", "dual-diagonal-island", "#d7dfd2"],
  ["iPhone 15 Plus", "15", "2023", "6.7-inch", "USB-C", "dual-diagonal-island", "#d7dfd2"],
  ["iPhone 15 Pro", "15", "2023", "6.1-inch", "USB-C", "triple-island", "#a49d92"],
  ["iPhone 15 Pro Max", "15", "2023", "6.7-inch", "USB-C", "triple-island", "#a49d92"],
  ["iPhone 16e", "16", "2025", "6.1-inch", "USB-C", "single", "#f1f1f1"],
  ["iPhone 16", "16", "2024", "6.1-inch", "USB-C", "vertical-dual-island", "#cbd8c9"],
  ["iPhone 16 Plus", "16", "2024", "6.7-inch", "USB-C", "vertical-dual-island", "#cbd8c9"],
  ["iPhone 16 Pro", "16", "2024", "6.3-inch", "USB-C", "triple-island", "#b8aea1"],
  ["iPhone 16 Pro Max", "16", "2024", "6.9-inch", "USB-C", "triple-island", "#b8aea1"],
  ["iPhone 17e", "17", "2026", "6.1-inch", "USB-C", "single", "#f2f3f4"],
  ["iPhone 17", "17", "2025", "6.3-inch", "USB-C", "dual-island", "#d7e4f1"],
  ["iPhone Air", "17", "2025", "6.5-inch", "USB-C", "single-island", "#e7e2d7"],
  ["iPhone 17 Pro", "17", "2025", "6.3-inch", "USB-C", "triple-island", "#d0b08e"],
  ["iPhone 17 Pro Max", "17", "2025", "6.9-inch", "USB-C", "triple-island", "#d0b08e"]
].map(([name, series, year, size, port, camera, color]) => ({ name, series, year, size, port, camera, color }));

let currentRepair = "screen";
let currentSeries = "17";
const verifiedGuides = new Set([
  "screen/iphone-x",
  "battery/iphone-x",
  "backglass/iphone-x",
  "screen/iphone-xr",
  "battery/iphone-xr",
  "backglass/iphone-xr",
  "screen/iphone-xs",
  "battery/iphone-xs",
  "screen/iphone-xs-max",
  "battery/iphone-xs-max",
  "screen/iphone-11",
  "battery/iphone-11",
  "screen/iphone-11-pro",
  "battery/iphone-11-pro",
  "screen/iphone-11-pro-max",
  "battery/iphone-11-pro-max",
  "screen/iphone-12-mini",
  "battery/iphone-12-mini",
  "screen/iphone-12",
  "battery/iphone-12",
  "screen/iphone-12-pro",
  "battery/iphone-12-pro",
  "screen/iphone-12-pro-max",
  "battery/iphone-12-pro-max",
  "screen/iphone-13-mini",
  "battery/iphone-13-mini",
  "screen/iphone-13",
  "battery/iphone-13",
  "screen/iphone-13-pro",
  "battery/iphone-13-pro",
  "screen/iphone-13-pro-max",
  "battery/iphone-13-pro-max",
  "screen/iphone-14",
  "battery/iphone-14",
  "backglass/iphone-14",
  "screen/iphone-14-plus",
  "battery/iphone-14-plus",
  "backglass/iphone-14-plus",
  "screen/iphone-14-pro",
  "battery/iphone-14-pro",
  "screen/iphone-14-pro-max",
  "battery/iphone-14-pro-max",
  "screen/iphone-15",
  "battery/iphone-15",
  "backglass/iphone-15",
  "screen/iphone-15-plus",
  "battery/iphone-15-plus",
  "backglass/iphone-15-plus",
  "screen/iphone-15-pro",
  "battery/iphone-15-pro",
  "backglass/iphone-15-pro",
  "screen/iphone-15-pro-max",
  "battery/iphone-15-pro-max",
  "backglass/iphone-15-pro-max",
  "screen/iphone-16e",
  "battery/iphone-16e",
  "backglass/iphone-16e",
  "screen/iphone-16",
  "battery/iphone-16",
  "backglass/iphone-16",
  "screen/iphone-16-plus",
  "battery/iphone-16-plus",
  "backglass/iphone-16-plus",
  "screen/iphone-16-pro",
  "battery/iphone-16-pro",
  "backglass/iphone-16-pro",
  "screen/iphone-16-pro-max",
  "battery/iphone-16-pro-max",
  "backglass/iphone-16-pro-max",
  "screen/iphone-17e",
  "battery/iphone-17e",
  "backglass/iphone-17e",
  "screen/iphone-17",
  "battery/iphone-17",
  "backglass/iphone-17",
  "screen/iphone-air",
  "battery/iphone-air",
  "backglass/iphone-air",
  "screen/iphone-17-pro",
  "battery/iphone-17-pro",
  "backglass/iphone-17-pro",
  "screen/iphone-17-pro-max",
  "battery/iphone-17-pro-max",
  "backglass/iphone-17-pro-max"
]);

const grid = document.querySelector("#model-grid");
const search = document.querySelector("#model-search");
const summary = document.querySelector("#repair-summary");

function slug(text) {
  return text.toLowerCase().replaceAll(" ", "-");
}

function guideStatus(repair, model) {
  return verifiedGuides.has(`${repair}/${slug(model.name)}`) ? "Verified" : "Pending";
}

function phoneSvg(model) {
  const island = model.camera.includes("island");
  const notch = !island;
  const single = model.camera.includes("single");
  const triple = model.camera.includes("triple");
  const vertical = model.camera.includes("vertical");
  const diagonal = model.camera.includes("diagonal");
  const dual = !single && !triple;
  const cameraPlate = triple ? "74" : "62";
  const lens = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="11" fill="#111820"/><circle cx="${cx}" cy="${cy}" r="5" fill="#465669"/>`;
  let lenses = "";
  if (single) lenses = lens(115, 56);
  if (dual && vertical) lenses = `${lens(113, 45)}${lens(113, 82)}`;
  if (dual && diagonal) lenses = `${lens(100, 45)}${lens(128, 82)}`;
  if (dual && !vertical && !diagonal) lenses = `${lens(100, 52)}${lens(128, 52)}`;
  if (triple) lenses = `${lens(99, 43)}${lens(130, 61)}${lens(101, 83)}`;
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 230" role="img" aria-label="${model.name} phone illustration">
      <rect x="39" y="8" width="102" height="214" rx="25" fill="#151d27"/>
      <rect x="47" y="17" width="86" height="196" rx="18" fill="${model.color}"/>
      <path d="M48 27c22-12 52-12 84 1v88c-28-14-56-15-84-2z" fill="rgba(255,255,255,.28)"/>
      ${notch ? '<path d="M70 17h40v15c0 7-5 10-12 10H82c-7 0-12-3-12-10z" fill="#151d27"/>' : '<rect x="70" y="30" width="40" height="13" rx="7" fill="#151d27"/>'}
      <rect x="${triple ? 86 : 88}" y="28" width="${cameraPlate}" height="${cameraPlate}" rx="18" fill="rgba(255,255,255,.55)"/>
      ${lenses}
      <rect x="74" y="197" width="32" height="4" rx="2" fill="rgba(21,29,39,.42)"/>
    </svg>`;
}

const modelPhotoOverrides = {
  "iPhone X": "assets/home/models/iphone-x.jpg",
  "iPhone XR": "assets/home/models/iphone-xr.jpg",
  "iPhone XS": "assets/home/models/iphone-xs.jpg",
  "iPhone XS Max": "assets/home/models/iphone-xs-max.jpg",
  "iPhone 11": "assets/home/models/iphone-11.jpg",
  "iPhone 11 Pro": "assets/home/models/iphone-11-pro.jpg",
  "iPhone 11 Pro Max": "assets/home/models/iphone-11-pro-max.jpg",
  "iPhone 12 mini": "assets/home/models/iphone-12-mini.png",
  "iPhone 12": "assets/home/models/iphone-12.png",
  "iPhone 12 Pro": "assets/home/models/iphone-12-pro.jpg",
  "iPhone 12 Pro Max": "assets/home/models/iphone-12-pro-max.jpg",
  "iPhone 13 mini": "assets/home/models/iphone-13-mini.png",
  "iPhone 13": "assets/home/models/iphone-13.png",
  "iPhone 13 Pro": "assets/home/models/iphone-13-pro.png",
  "iPhone 13 Pro Max": "assets/home/models/iphone-13-pro-max.png",
  "iPhone 14": "assets/home/models/iphone-14.png",
  "iPhone 14 Plus": "assets/home/models/iphone-14-plus.png",
  "iPhone 14 Pro": "assets/home/models/iphone-14-pro.png",
  "iPhone 14 Pro Max": "assets/home/models/iphone-14-pro-max.png",
  "iPhone 15": "assets/home/models/iphone-15.png",
  "iPhone 15 Plus": "assets/home/models/iphone-15-plus.png",
  "iPhone 15 Pro": "assets/home/models/iphone-15-pro.png",
  "iPhone 15 Pro Max": "assets/home/models/iphone-15-pro-max.png",
  "iPhone 16e": "assets/home/models/iphone-16e.png",
  "iPhone 16": "assets/home/models/iphone-16.png",
  "iPhone 16 Plus": "assets/home/models/iphone-16-plus.png",
  "iPhone 16 Pro": "assets/home/models/iphone-16-pro.png",
  "iPhone 16 Pro Max": "assets/home/models/iphone-16-pro-max.png",
  "iPhone 17e": "assets/home/17e.jpg",
  "iPhone 17": "assets/home/17.jpg",
  "iPhone Air": "assets/home/17air.jpg",
  "iPhone 17 Pro": "assets/home/17pro.jpeg",
  "iPhone 17 Pro Max": "assets/home/iPhone17Promax.jpg"
};

function imageData(model) {
  if (modelPhotoOverrides[model.name]) return `${modelPhotoOverrides[model.name]}?v=model-photos-20260528`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(phoneSvg(model))}`;
}

function renderSummary() {
  if (!summary) return;
  const item = repairs[currentRepair];
  summary.innerHTML = `
    <div>
      <p class="summary-label">Selected Repair</p>
      <h3>${item.title}</h3>
      <p>${item.copy}</p>
    </div>
    <div class="summary-meta">
      <span>${item.tools}</span>
      <span>${item.risk}</span>
    </div>`;
}

function renderModels() {
  const query = search.value.trim().toLowerCase();
  const visible = models.filter(model => {
    const matchSeries = currentSeries === "all" || model.series === currentSeries;
    const matchQuery = !query || model.name.toLowerCase().includes(query);
    return matchSeries && matchQuery;
  });

  grid.innerHTML = visible.map(model => `
    <article class="model-card">
      <div class="model-art">
        <img src="${imageData(model)}" alt="${model.name} front and back phone photo" loading="lazy">
      </div>
      <div class="model-body">
        <h3>${model.name}</h3>
        <p>${model.year} model, ${model.size}, ${model.port}. Choose a repair guide below.</p>
        <div class="model-tags">
          <span>${model.series} Series</span>
          <span>${model.camera.replaceAll("-", " ")}</span>
          <span>${model.port}</span>
        </div>
      </div>
      <div class="model-actions" aria-label="${model.name} repair links">
        <a class="${currentRepair === "screen" ? "is-current" : ""}" href="repairs/screen/${slug(model.name)}.html" target="_blank" rel="noopener noreferrer">Screen<span>${guideStatus("screen", model)}</span></a>
        <a class="${currentRepair === "battery" ? "is-current" : ""}" href="repairs/battery/${slug(model.name)}.html" target="_blank" rel="noopener noreferrer">Battery<span>${guideStatus("battery", model)}</span></a>
        <a class="${currentRepair === "backglass" ? "is-current" : ""}" href="repairs/backglass/${slug(model.name)}.html" target="_blank" rel="noopener noreferrer">Back Glass<span>${guideStatus("backglass", model)}</span></a>
      </div>
    </article>
  `).join("");

  if (!visible.length) {
    grid.innerHTML = `<p class="empty-state">No matching iPhone model found.</p>`;
  }
}

document.querySelectorAll(".repair-tab").forEach(button => {
  button.addEventListener("click", () => {
    currentRepair = button.dataset.repair;
    document.querySelectorAll(".repair-tab").forEach(tab => {
      tab.classList.toggle("is-active", tab === button);
      tab.setAttribute("aria-selected", tab === button ? "true" : "false");
    });
    renderSummary();
    renderModels();
  });
});

document.querySelectorAll(".series-pill").forEach(button => {
  button.addEventListener("click", () => {
    currentSeries = button.dataset.series;
    document.querySelectorAll(".series-pill").forEach(pill => pill.classList.toggle("is-active", pill === button));
    renderModels();
  });
});

search.addEventListener("input", renderModels);

renderSummary();
renderModels();
