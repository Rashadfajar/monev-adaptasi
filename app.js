// -------------------------------
// Mock data (frontend-only)
// -------------------------------
const mock = {
  tasks: [
    { text: "12 records pending review (Horizontal)", link: "review.html?filter=pending&source=H" },
    { text: "8 records missing evidence (Vertical – Prov A)", link: "review.html?filter=returned&source=V" },
    { text: "Run computation recommended (Readiness ≥ 80%)", link: "engine.html" },
  ],
  alerts: [
    { text: "Unit mismatch detected: IND-07 (auto-blocked)", link: "engine.html#logs" },
    { text: "Overdue submissions: 3 institutions", link: "input.html" },
    { text: "Low coverage: Prov C (52%)", link: "#" },
  ],
  logs: [
    { text: "Harmonization warning: IND-07 unit mismatch (needs review)", link: "engine.html#logs" },
    { text: "Validation blocked: Aksi-118 missing evidence", link: "review.html?record=Aksi-118" },
    { text: "Aggregation: completed OK", link: "engine.html#runs" },
  ],
  mpcRows: [
    { sector: "Food", actions: 230, approved: "91%", readiness: "84%", status: "On Track" },
    { sector: "Water", actions: 180, approved: "76%", readiness: "71%", status: "Needs Review" },
    { sector: "Health", actions: 95, approved: "88%", readiness: "80%", status: "On Track" },
    { sector: "Ecosystems", actions: 210, approved: "83%", readiness: "79%", status: "Watch" },
    { sector: "DRM", actions: 160, approved: "90%", readiness: "86%", status: "On Track" },
    { sector: "Coastal", actions: 120, approved: "78%", readiness: "73%", status: "Needs Review" },
  ],
  hRows: [
    { inst: "KLH", action: "Aksi-001", sector: "Water", loc: "Prov A", ind: "IND-01", tgt: 100, act: 75, qa: "Pending" },
    { inst: "KemenPU", action: "Aksi-014", sector: "DRM", loc: "Prov B", ind: "IND-07", tgt: 40, act: 22, qa: "Returned" },
    { inst: "KLH", action: "Aksi-032", sector: "Ecosystems", loc: "Prov C", ind: "IND-03", tgt: 2000, act: 1450, qa: "Approved" },
  ],
  vRows: [
    { loc: "Prov A", actions: 45, inds: 12, readiness: "78%", pending: 6, updated: "2026-03-12" },
    { loc: "Prov B", actions: 62, inds: 15, readiness: "84%", pending: 4, updated: "2026-03-13" },
    { loc: "Prov C", actions: 28, inds: 9, readiness: "52%", pending: 11, updated: "2026-03-10" },
  ],
  impactRows: [
    { domain: "Economic", group: "Food Security", value: "+12%", trend: "↑", coverage: "78%", conf: "Moderate" },
    { domain: "Social", group: "Health Resilience", value: "+6%", trend: "→", coverage: "66%", conf: "Moderate" },
    { domain: "Ecosystem", group: "Landscape Integrity", value: "+9%", trend: "↑", coverage: "72%", conf: "High" },
  ],
};

// -------------------------------
// Simple i18n (minimal demo)
// -------------------------------
let lang = "ID";
const i18n = {
  ID: {
    appTitle: "MoNEv Adaptasi – MPC",
    appSub: "Dashboard / Control Tower",
    navDashboard: "Dashboard (Home)",
    navInput: "Input Data",
    navReview: "Review & Validasi",
    navEngine: "Impact Engine",
    navReporting: "Pelaporan & Ekspor",
    navHelp: "Help Center",
    periodActive: "Periode Aktif",
    periodStatus: "Status Periode",
    lockPeriod: "Lock Period",
    quickActions: "Quick Actions",
    qaInputH: "Input Horizontal",
    qaInputV: "Input Vertical",
    qaInbox: "Review Inbox",
    qaRunCompute: "Run Computation",
    qaExport: "Export Report",
    globalFilters: "Global Filters",
    reset: "Reset",
    cardH: "Horizontal Input",
    cardV: "Vertical Input",
    cardQA: "QA/QC Workflow",
    cardEngine: "Impact Engine",
    submissions: "submissions",
    pending: "Pending",
    approved: "Approved",
    coverage: "Coverage",
    inboxItems: "inbox items",
    returned: "Returned",
    avgReview: "Avg review",
    readiness: "readiness",
    lastRun: "Last run",
    errors: "Errors",
    goInput: "Go to Input →",
    openInbox: "Open Inbox →",
    openEngine: "Open Engine →",
    tasks: "Tasks",
    alerts: "Alerts",
    logs: "Computation Logs",
    tabMPC: "MPC View",
    tabH: "Horizontal View",
    tabV: "Vertical View",
    tabImpact: "Impact View",
    kpiActions: "Aksi validated",
    kpiProgress: "Capaian indikator",
    kpiReadiness: "Readiness nasional",
    kpiCoverage: "Wilayah terlapor",
    colSector: "Sektor",
    colActions: "#Aksi",
    colApproved: "%Approved",
    colReadiness: "Avg Readiness",
    colStatus: "Status",
    viewReports: "View Report Packages",
    brief: "Generate Briefing Note",
    hHint: "Tampilan ringkas sektoral/KL (mock). Klik baris untuk detail aksi.",
    vHint: "Tampilan ringkas kewilayahan (mock). Klik baris untuk detail wilayah.",
    impactHint: "Output komputasi (mock). Klik baris untuk lineage.",
    openInputH: "Open Input Horizontal",
    openInputV: "Open Input Vertical",
    openInbox2: "Open Review Inbox",
    download: "Download Filtered Data",
    viewLogs: "View Logs",
  },
  EN: {
    appTitle: "Adaptation MoNEv – MPC",
    appSub: "Dashboard / Control Tower",
    navDashboard: "Dashboard (Home)",
    navInput: "Data Input",
    navReview: "Review & Validation",
    navEngine: "Impact Engine",
    navReporting: "Reporting & Export",
    navHelp: "Help Center",
    periodActive: "Active Period",
    periodStatus: "Period Status",
    lockPeriod: "Lock Period",
    quickActions: "Quick Actions",
    qaInputH: "Horizontal Input",
    qaInputV: "Vertical Input",
    qaInbox: "Review Inbox",
    qaRunCompute: "Run Computation",
    qaExport: "Export Report",
    globalFilters: "Global Filters",
    reset: "Reset",
    cardH: "Horizontal Input",
    cardV: "Vertical Input",
    cardQA: "QA/QC Workflow",
    cardEngine: "Impact Engine",
    submissions: "submissions",
    pending: "Pending",
    approved: "Approved",
    coverage: "Coverage",
    inboxItems: "inbox items",
    returned: "Returned",
    avgReview: "Avg review",
    readiness: "readiness",
    lastRun: "Last run",
    errors: "Errors",
    goInput: "Go to Input →",
    openInbox: "Open Inbox →",
    openEngine: "Open Engine →",
    tasks: "Tasks",
    alerts: "Alerts",
    logs: "Computation Logs",
    tabMPC: "MPC View",
    tabH: "Horizontal View",
    tabV: "Vertical View",
    tabImpact: "Impact View",
    kpiActions: "Validated actions",
    kpiProgress: "Indicator progress",
    kpiReadiness: "National readiness",
    kpiCoverage: "Locations covered",
    colSector: "Sector",
    colActions: "#Actions",
    colApproved: "%Approved",
    colReadiness: "Avg Readiness",
    colStatus: "Status",
    viewReports: "View Report Packages",
    brief: "Generate Briefing Note",
    hHint: "Sector/institution snapshot (mock). Click a row for action details.",
    vHint: "Regional snapshot (mock). Click a row for location details.",
    impactHint: "Computed outputs (mock). Click a row for lineage.",
    openInputH: "Open Horizontal Input",
    openInputV: "Open Vertical Input",
    openInbox2: "Open Review Inbox",
    download: "Download Filtered Data",
    viewLogs: "View Logs",
  }
};

function applyI18n() {
  const dict = i18n[lang];
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });
  const langBtn = document.getElementById("langToggle");
  if (langBtn) langBtn.textContent = lang;
}

function setYears() {
  const yearSel = document.getElementById("yearSel");
  const now = new Date().getFullYear();
  const years = [now - 1, now, now + 1, now + 2];
  yearSel.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join("");
  yearSel.value = now;
}

function fillLists() {
  const ul = (id, items) => {
    const el = document.getElementById(id);
    el.innerHTML = items.map(i => `<li>${i.text} <a href="${i.link}">Open</a></li>`).join("");
  };
  ul("tasksList", mock.tasks);
  ul("alertsList", mock.alerts);
  ul("logsList", mock.logs);
}

function fillTables() {
  const mpcBody = document.querySelector("#mpcTable tbody");
  mpcBody.innerHTML = mock.mpcRows.map(r =>
    `<tr>
      <td>${r.sector}</td><td>${r.actions}</td><td>${r.approved}</td><td>${r.readiness}</td><td>${r.status}</td>
    </tr>`
  ).join("");

  const hBody = document.querySelector("#hTable tbody");
  hBody.innerHTML = mock.hRows.map(r =>
    `<tr data-kind="action" data-id="${r.action}">
      <td>${r.inst}</td><td>${r.action}</td><td>${r.sector}</td><td>${r.loc}</td><td>${r.ind}</td>
      <td>${r.tgt}</td><td>${r.act}</td><td>${r.qa}</td>
    </tr>`
  ).join("");

  const vBody = document.querySelector("#vTable tbody");
  vBody.innerHTML = mock.vRows.map(r =>
    `<tr data-kind="location" data-id="${r.loc}">
      <td>${r.loc}</td><td>${r.actions}</td><td>${r.inds}</td><td>${r.readiness}</td><td>${r.pending}</td><td>${r.updated}</td>
    </tr>`
  ).join("");

  const iBody = document.querySelector("#impactTable tbody");
  iBody.innerHTML = mock.impactRows.map(r =>
    `<tr data-kind="lineage" data-id="${r.group}">
      <td>${r.domain}</td><td>${r.group}</td><td>${r.value}</td><td>${r.trend}</td><td>${r.coverage}</td><td>${r.conf}</td>
    </tr>`
  ).join("");
}

function tabsBehavior() {
  // Tasks/Alerts/Logs tabs
  document.querySelectorAll(".card .tab[data-tab]").forEach(btn => {
    btn.addEventListener("click", () => {
      const group = btn.parentElement;
      group.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.getAttribute("data-tab");
      ["tasks","alerts","logs"].forEach(t => {
        document.getElementById(`tab-${t}`).classList.toggle("hidden", t !== tab);
      });
    });
  });

  // View tabs MPC/H/V/Impact
  document.querySelectorAll(".card .tab[data-view]").forEach(btn => {
    btn.addEventListener("click", () => {
      const group = btn.parentElement;
      group.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const view = btn.getAttribute("data-view");
      ["mpc","h","v","impact"].forEach(v => {
        document.getElementById(`view-${v}`).classList.toggle("hidden", v !== view);
      });
    });
  });
}

function modal(id, show) {
  document.getElementById(id).classList.toggle("hidden", !show);
}

function showInfo(title, html) {
  document.getElementById("infoTitle").textContent = title;
  document.getElementById("infoBody").innerHTML = html;
  modal("infoModal", true);
}

function attachRowClicks() {
  // MPC table row click → show quick insight
  document.getElementById("mpcTable").addEventListener("click", (e) => {
    const tr = e.target.closest("tr");
    if (!tr) return;
    const tds = tr.querySelectorAll("td");
    if (tds.length < 5) return;
    showInfo("Sector Snapshot", `
      <p><b>Sector:</b> ${tds[0].textContent}</p>
      <p><b>#Actions:</b> ${tds[1].textContent} &nbsp; <b>%Approved:</b> ${tds[2].textContent}</p>
      <p><b>Avg Readiness:</b> ${tds[3].textContent} &nbsp; <b>Status:</b> ${tds[4].textContent}</p>
      <p class="muted">Next: drill-down page will be implemented when backend is ready.</p>
    `);
  });

  // H/V/Impact table clicks
  ["hTable","vTable","impactTable"].forEach(id => {
    document.getElementById(id).addEventListener("click", (e) => {
      const tr = e.target.closest("tr");
      if (!tr) return;
      const kind = tr.getAttribute("data-kind");
      const ref = tr.getAttribute("data-id");
      if (kind === "action") {
        showInfo("Action Detail (Mock)", `
          <p><b>Action:</b> ${ref}</p>
          <p class="muted">This will open /dashboard/action/:id in the next iteration.</p>
        `);
      } else if (kind === "location") {
        showInfo("Location Detail (Mock)", `
          <p><b>Location:</b> ${ref}</p>
          <p class="muted">This will open /dashboard/location/:id in the next iteration.</p>
        `);
      } else {
        showInfo("Lineage (Mock)", `
          <p><b>Output:</b> ${ref}</p>
          <ul>
            <li>Sources: 32 actions</li>
            <li>Indicators: IND-01, IND-03, IND-07</li>
            <li>Evidence: Docs/Photos/Datasets</li>
            <li>Version: 2026 S1 – v1</li>
          </ul>
        `);
      }
    });
  });
}

function searchBehavior() {
  const btn = document.getElementById("searchBtn");
  const input = document.getElementById("globalSearch");
  const scope = document.getElementById("searchScope");

  const run = () => {
    const q = input.value.trim();
    const sc = scope.value;
    if (!q) return;

    const sections = [
      { title: "Actions", items: mock.hRows.filter(r => r.action.toLowerCase().includes(q.toLowerCase())).map(r => r.action) },
      { title: "Locations", items: mock.vRows.filter(r => r.loc.toLowerCase().includes(q.toLowerCase())).map(r => r.loc) },
      { title: "Indicators", items: mock.hRows.filter(r => r.ind.toLowerCase().includes(q.toLowerCase())).map(r => r.ind) },
      { title: "Reports", items: q.toLowerCase().includes("btr") ? ["BTR 2026 S1 – v1"] : [] },
      { title: "Help", items: q.toLowerCase().includes("evidence") ? ["Valid evidence checklist"] : [] },
    ];

    const filtered = (sc === "all")
      ? sections
      : sections.filter(s => s.title.toLowerCase() === sc);

    document.getElementById("searchTitle").textContent = `Search Results: "${q}"`;
    document.getElementById("searchBody").innerHTML = filtered.map(s => `
      <div style="margin-bottom:12px">
        <div style="font-weight:900; margin-bottom:6px">${s.title} (${s.items.length})</div>
        ${s.items.length ? `<ul>${s.items.map(it => `<li>${it}</li>`).join("")}</ul>` : `<div class="muted">No results</div>`}
      </div>
    `).join("");

    modal("searchModal", true);
  };

  btn.addEventListener("click", run);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") run(); });

  document.getElementById("closeSearch").addEventListener("click", () => modal("searchModal", false));
}

function lockBehavior() {
  const btn = document.getElementById("lockBtn");
  const status = document.getElementById("periodStatus");
  btn.addEventListener("click", () => {
    const locked = status.classList.contains("locked");
    if (locked) {
      status.classList.remove("locked");
      status.classList.add("open");
      status.textContent = "OPEN";
    } else {
      status.classList.remove("open");
      status.classList.add("locked");
      status.textContent = "LOCKED";
    }
  });
}

function langBehavior() {
  const btn = document.getElementById("langToggle");
  btn.addEventListener("click", () => {
    lang = (lang === "ID") ? "EN" : "ID";
    applyI18n();
  });
}

function computeButtons() {
  const run = () => showInfo("Run Computation (Mock)", `
    <p>Computation will be executed in <b>Impact Engine</b> module.</p>
    <p class="muted">Backend will schedule jobs later. For now this is a UI stub.</p>
  `);
  document.getElementById("runComputeBtn").addEventListener("click", run);
  document.getElementById("runComputeBtn2").addEventListener("click", run);
  document.getElementById("briefBtn").addEventListener("click", () => showInfo("Briefing Note (Mock)", `
    <p><b>Briefing draft</b> will be generated from computed outputs + narratives later.</p>
  `));
  document.getElementById("closeInfo").addEventListener("click", () => {
    console.log("Modal close clicked"); // Cek apakah event listener dipicu
    modal("infoModal", false); // Menutup modal
    });

}

// -------------------------------
// Global filter state + helpers
// -------------------------------
const state = {
  year: null,
  subperiod: "",
  sector: "",
  location: "",
  institution: "",
  typology: ""
};

function getEl(id){ return document.getElementById(id); }

function readFiltersFromUI() {
  state.year = getEl("yearSel")?.value || state.year;
  state.subperiod = getEl("subperiodSel")?.value || state.subperiod;
  state.sector = getEl("sectorSel")?.value || "";
  state.location = getEl("locationSel")?.value || "";
  state.institution = getEl("instSel")?.value || "";
  state.typology = getEl("typologySel")?.value || "";
}

function resetFiltersUI() {
  ["sectorSel","locationSel","instSel","typologySel"].forEach(id => {
    const el = getEl(id);
    if (el) el.value = "";
  });
  // keep year/subperiod as-is (it is the active reporting period)
  readFiltersFromUI();
}

function filterHorizontalRows() {
  // NOTE: mock.hRows doesn't have typology; keep it as a no-op for now (UI ready).
  return mock.hRows.filter(r => {
    if (state.sector && r.sector !== state.sector) return false;
    if (state.location && r.loc !== state.location) return false;
    if (state.institution && r.inst !== state.institution) return false;
    return true;
  });
}

// -------------------------------
// SVG Trend Chart (NO <canvas>)
// -------------------------------
const trendLabels = ["Q1 2022","Q2 2022","Q3 2022","Q4 2022","Q1 2023","Q2 2023","Q3 2023","Q4 2023","Q1 2024"];
// Dummy series by sector (SVG chart; no canvas)
function getDummySectorSeries(sector) {
  const s = (sector || "").trim();
  const key = s === "Ecosystems" ? "Ecosystem" : s; // normalize to dummy switch
  let data = [];
  let label = "No Data";

  switch (key) {
    case "Food":
      data = [230, 240, 250, 260, 270, 280, 290, 300, 310];
      label = "Food Sector";
      break;
    case "Water":
      data = [180, 190, 200, 210, 220, 230, 240, 250, 260];
      label = "Water Sector";
      break;
    case "Health":
      data = [95, 100, 105, 110, 115, 120, 125, 130, 135];
      label = "Health Sector";
      break;
    case "Ecosystem":
      data = [210, 220, 230, 240, 250, 260, 270, 280, 290];
      label = "Ecosystem Sector";
      break;
    case "DRM":
      data = [160, 170, 180, 190, 200, 210, 220, 230, 240];
      label = "DRM Sector";
      break;
    case "Coastal":
      data = [120, 130, 140, 150, 160, 170, 180, 190, 200];
      label = "Coastal Sector";
      break;
    default: {
      // "All / Seluruh": jumlah total semua sektor per-kuartal (bukan rata-rata)
      const all = [
        [230, 240, 250, 260, 270, 280, 290, 300, 310], // Food
        [180, 190, 200, 210, 220, 230, 240, 250, 260], // Water
        [95, 100, 105, 110, 115, 120, 125, 130, 135],  // Health
        [210, 220, 230, 240, 250, 260, 270, 280, 290], // Ecosystem
        [160, 170, 180, 190, 200, 210, 220, 230, 240], // DRM
        [120, 130, 140, 150, 160, 170, 180, 190, 200], // Coastal
      ];
      data = all[0].map((_, i) => all.reduce((acc, arr) => acc + arr[i], 0));
      label = "All Sectors (Total)";
      break;
    }
  }

  return { label, data };
}


function seededNoise(seed) {
  // tiny deterministic pseudo-random (0..1)
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function buildTrendValues(filteredRows) {
  // Build a simple "trend" based on how many actions match filters.
  // When backend exists, replace with real time-series aggregation.
  const n = filteredRows.length || 0;

  // If filters are empty and we have sector selected, use mock.mpcRows baseline (#actions).
  let baseline = n;
  if (baseline === 0 && state.sector) {
    const m = mock.mpcRows.find(x => x.sector === state.sector);
    baseline = m ? m.actions : 0;
  }
  if (baseline === 0) baseline = 60; // default visual baseline for empty selections

  // Seed based on filters to keep the line stable per selection
  const seed =
    (parseInt(state.year || "2026", 10) * 7) +
    (state.subperiod === "S2" ? 13 : 5) +
    (state.sector ? state.sector.length * 17 : 3) +
    (state.location ? state.location.length * 11 : 2) +
    (state.institution ? state.institution.length * 19 : 1);

  const vals = trendLabels.map((_, i) => {
    const t = i / (trendLabels.length - 1);
    const drift = 0.7 + (t * 0.55);              // gradual uptrend
    const wiggle = (seededNoise(seed + i * 3) - 0.5) * 0.12; // small variance
    const v = baseline * (drift + wiggle);
    return Math.max(0, Math.round(v));
  });

  return vals;
}

function renderTrendSvg(svgId, labels, values, seriesLabel = "") {
  const svg = getEl(svgId);
  if (!svg) return;

  // keep viewBox in HTML (720x360)
  const W = 720, H = 360;
  const pad = { l: 54, r: 18, t: 16, b: 44 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const minV = 0;
  const maxV = Math.max(...values, 1);
  const yMax = Math.ceil(maxV * 1.12);

  const x = (i) => pad.l + (i * innerW / Math.max(1, labels.length - 1));
  const y = (v) => pad.t + (innerH - ((v - minV) / (yMax - minV)) * innerH);

  const pts = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");

  const gridLines = 4;
  const yTicks = Array.from({length: gridLines + 1}, (_, k) => {
    const val = Math.round((yMax / gridLines) * k);
    const yy = y(val);
    return { val, yy };
  });

  const titleParts = [];
  if (state.sector) titleParts.push(`Sector: ${state.sector}`);
  if (state.location) titleParts.push(`Location: ${state.location}`);
  if (state.institution) titleParts.push(`Institution: ${state.institution}`);
  if (state.typology) titleParts.push(`Typology: ${state.typology}`);
  const title = titleParts.length ? titleParts.join(" • ") : "All data";

  svg.innerHTML = `
    <defs>
      <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="rgba(79,156,255,.35)"></stop>
        <stop offset="100%" stop-color="rgba(79,156,255,0)"></stop>
      </linearGradient>
    </defs>

    <!-- frame -->
    <rect x="0" y="0" width="${W}" height="${H}" rx="14" ry="14" fill="rgba(17,31,56,.35)" stroke="rgba(32,52,87,.75)"></rect>

    <!-- title -->
    <text x="${pad.l}" y="${pad.t + 10}" fill="rgba(231,238,252,.95)" font-size="12" font-weight="800">${title}</text>
  
    <!-- grid -->
    ${yTicks.map(t => `
      <line x1="${pad.l}" y1="${t.yy}" x2="${W - pad.r}" y2="${t.yy}" stroke="rgba(32,52,87,.55)" />
      <text x="${pad.l - 10}" y="${t.yy + 4}" text-anchor="end" fill="rgba(159,176,208,.95)" font-size="11">${t.val}</text>
    `).join("")}

    <!-- x axis labels (sparse) -->
    ${labels.map((lab, i) => {
      if (i % 2 !== 0 && i !== labels.length - 1) return "";
      const xx = x(i);
      return `<text x="${xx}" y="${H - 18}" text-anchor="middle" fill="rgba(159,176,208,.95)" font-size="11">${lab}</text>`;
    }).join("")}

    <!-- area + line -->
    <polygon points="${pad.l},${pad.t + innerH} ${pts} ${W - pad.r},${pad.t + innerH}" fill="url(#trendFill)"></polygon>
    <polyline points="${pts}" fill="none" stroke="rgba(79,156,255,1)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"></polyline>

    <!-- points -->
    ${values.map((v,i) => `
      <circle cx="${x(i)}" cy="${y(v)}" r="3.2" fill="rgba(231,238,252,.95)"></circle>
    `).join("")}
  `;
}

// -------------------------------
// Leaflet Map (filter-aware markers)
// -------------------------------
let map = null;
let markersLayer = null;

const provinceCoords = {
  "Prov A": [0.55, 101.5],
  "Prov B": [-0.5, 104],
  "Prov C": [1.1, 118]
};

function initMap() {
  map = L.map('mapid', { zoomControl: true }).setView([0.7874, 119.9965], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
  updateMapMarkers();
  // Ensure proper sizing if container is rendered after layout
  setTimeout(() => map && map.invalidateSize(), 50);
}

function updateMapMarkers() {
  if (!markersLayer) return;
  markersLayer.clearLayers();

  // ⛔ SEKTOR TIDAK DIANGGAP FILTER PETA
  const hasMapFilter =
    state.location || state.institution || state.typology;

  const counts = {};

  // ===============================
  // MODE NASIONAL (ALL)
  // ===============================
  if (!hasMapFilter) {
    mock.vRows.forEach(r => {
      counts[r.loc] = r.actions; // AKUMULASI NASIONAL
    });
  }

  // ===============================
  // MODE TERFILTER (NON-SEKTOR)
  // ===============================
  else {
    mock.hRows.forEach(r => {
      if (state.location && r.loc !== state.location) return;
      if (state.institution && r.inst !== state.institution) return;
      // typology belum ada di data → skip

      counts[r.loc] = (counts[r.loc] || 0) + 1;
    });
  }

  // ===============================
  // RENDER MARKER
  // ===============================
  Object.entries(counts).forEach(([loc, n]) => {
    const coords = provinceCoords[loc];
    if (!coords) return;

    L.circleMarker(coords, {
      radius: Math.max(6, Math.min(20, 6 + Math.sqrt(n) * 3)),
      color: '#4f9cff',
      weight: 2,
      fillColor: '#4f9cff',
      fillOpacity: 0.3
    })
    .bindPopup(`
      <b>${loc}</b><br>
      Jumlah Aksi: <b>${n}</b>
    `)
    .addTo(markersLayer);
  });

  // Zoom jika lokasi dipilih
  if (state.location && provinceCoords[state.location]) {
    map.setView(provinceCoords[state.location], 6);
  }
}


// -------------------------------
// Single source of truth: update visuals
// -------------------------------
function updateVisuals() {
  readFiltersFromUI();

  // Trend chart (dummy series; filtered by Global Filters → Sector)
  const series = getDummySectorSeries(state.sector);
  renderTrendSvg("trendSvg", trendLabels, series.data, series.label);
// Map
  if (map) updateMapMarkers();
}

function filtersBehavior() {
  // change listeners
  ["yearSel","subperiodSel","sectorSel","locationSel","instSel","typologySel"].forEach(id => {
    const el = getEl(id);
    if (!el) return;
    el.addEventListener("change", updateVisuals);
  });

  const resetBtn = getEl("resetFilters");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      resetFiltersUI();
      updateVisuals();
    });
  }
}

function init() {
  setYears();
  fillLists();
  fillTables();
  tabsBehavior();
  attachRowClicks();
  searchBehavior();
  lockBehavior();
  langBehavior();
  computeButtons();
  applyI18n();

  // Filter-aware visuals on Home (map + trend)
  readFiltersFromUI();
  filtersBehavior();
  initMap();
  updateVisuals();
}

init();
