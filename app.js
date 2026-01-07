/* app.js
 * MoNEv Adaptasi – MPC (frontend-only mock)
 * Bahasa: Indonesia (dengan toggle ID/EN)
 */

// -------------------------------
// Mock data (frontend-only)
// -------------------------------
const mock = {
  // =========================
  // Tasks / Alerts / Logs
  // =========================
  tasks: [
    { text: "12 pengajuan menunggu verifikasi (Sektoral)", link: "review.html?filter=pending&source=H" },
    { text: "8 pengajuan tanpa bukti (Kewilayahan – Prov A)", link: "review.html?filter=returned&source=V" },
    { text: "Disarankan menjalankan komputasi (kesiapan ≥ 80%)", link: "engine.html" },
  ],

  alerts: [
    { text: "Ketidaksesuaian satuan terdeteksi: IND-07 (diblokir otomatis)", link: "engine.html#logs" },
    { text: "Entri terlambat: 3 instansi", link: "input.html" },
    { text: "Cakupan rendah: Prov C (52%)", link: "#" },
  ],

  logs: [
    { text: "Peringatan harmonisasi: IND-07 beda satuan (perlu verifikasi)", link: "engine.html#logs" },
    { text: "Validasi diblokir: Aksi-118 tanpa bukti", link: "review.html?record=Aksi-118" },
    { text: "Agregasi: selesai", link: "engine.html#runs" },
  ],

  // =========================
  // Nasional (MPC)
  // =========================
  mpcRows: [
    { sector: "Pangan",      actions: 230, approved: "91%", readiness: "84%", status: "Tercapai" },
    { sector: "Air",         actions: 180, approved: "76%", readiness: "71%", status: "Tercapai Sebagian" },
    { sector: "Kesehatan",   actions: 95,  approved: "88%", readiness: "80%", status: "Tercapai" },
    { sector: "Ekosistem",   actions: 210, approved: "83%", readiness: "79%", status: "Perlu Pengawasan" },
    { sector: "Kebencanaan", actions: 160, approved: "90%", readiness: "86%", status: "Tercapai" },
    { sector: "Pesisir",     actions: 120, approved: "78%", readiness: "73%", status: "Tercapai Sebagian" },
  ],



  // =========================
  // Sektoral (Horizontal) / Kewilayahan (Vertical)
  // =========================
  hRows: [
    { inst: "KLH",     action: "Aksi-001", sector: "Air",         loc: "Prov A", ind: "IND-01", tgt: 100,  act: 75,   qa: "Menunggu" },
    { inst: "KemenPU", action: "Aksi-014", sector: "Kebencanaan", loc: "Prov B", ind: "IND-07", tgt: 40,   act: 22,   qa: "Perlu Perbaikan" },
    { inst: "KLH",     action: "Aksi-032", sector: "Ekosistem",   loc: "Prov C", ind: "IND-03", tgt: 2000, act: 1450, qa: "Disetujui" },
  ],

  vRows: [
    { loc: "Prov A", actions: 45, inds: 12, readiness: "78%", pending: 6,  updated: "2026-03-12" },
    { loc: "Prov B", actions: 62, inds: 15, readiness: "84%", pending: 4,  updated: "2026-03-13" },
    { loc: "Prov C", actions: 28, inds: 9,  readiness: "52%", pending: 11, updated: "2026-03-10" },
  ],

  impactRows: [
    { domain: "Ekonomi",   group: "Ketahanan Pangan",    value: "+12%", trend: "↑", coverage: "78%", conf: "Sedang" },
    { domain: "Sosial",    group: "Ketahanan Kesehatan", value: "+6%",  trend: "→", coverage: "66%", conf: "Sedang" },
    { domain: "Ekosistem", group: "Integritas Lanskap",  value: "+9%",  trend: "↑", coverage: "72%", conf: "Tinggi" },
  ],
};

// -------------------------------
// Simple i18n (minimal demo)
// -------------------------------
let lang = "ID";

const i18n = {
  ID: {
    appTitle: "MoNEv Adaptasi",
    appSub: "Dashboard / Pusat Kendali",

    navDashboard: "Dashboard (Beranda)",
    navInput: "Input Data",
    navReview: "Verifikasi & Validasi",
    navEngine: "Komputasi",
    navReporting: "Pelaporan & Ekspor",
    navHelp: "Pusat Bantuan",

    periodActive: "Periode Aktif",
    periodStatus: "Status Periode",
    lockPeriod: "Kunci Periode",

    quickActions: "Aksi Cepat",
    qaInputH: "Sektoral",
    qaInputV: "Kewilayahan",
    qaInbox: "Verifikasi",
    qaRunCompute: "Komputasi",
    qaExport: "Pelaporan",
    qaDataHub: "Portal Data",

    globalFilters: "Filter Global",
    reset: "Reset",

    cardH: "Input Sektoral",
    cardV: "Input Kewilayahan",
    cardQA: "Verifikasi & Validasi",
    cardEngine: "Dampak Aksi",

    submissions: "laporan",
    pending: "Menunggu Verifikasi",
    approved: "Disetujui",
    coverage: "Cakupan",
    inboxItems: "item",
    returned: "Perlu Perbaikan",
    avgReview: "Rata-rata proses",
    readiness: "kesiapan",
    lastRun: "Komputasi terakhir",
    errors: "Kesalahan",

    goInput: "Buka Input →",
    openInbox: "Buka Kotak Masuk →",
    openEngine: "Buka Impact Engine →",

    tasks: "Tugas",
    alerts: "Peringatan",
    logs: "Log Komputasi",

    tabMPC: "Nasional",
    tabH: "Sektoral",
    tabV: "Kewilayahan",
    tabImpact: "Dampak",

    kpiActions: "Aksi terverifikasi",
    kpiProgress: "Kemajuan indikator",
    kpiReadiness: "Kesiapan nasional",
    kpiCoverage: "Wilayah terlapor",

    colSector: "Sektor",
    colActions: "# Aksi",
    colApproved: "% Disetujui",
    colReadiness: "Rata-rata kesiapan",
    colStatus: "Status",

    viewReports: "Lihat Paket Laporan",
    brief: "Buat Catatan Ringkas",

    hHint: "Tampilan ringkas sektoral/KL (mock). Klik baris untuk detail aksi.",
    vHint: "Tampilan ringkas kewilayahan (mock). Klik baris untuk detail wilayah.",
    impactHint: "Output komputasi (mock). Klik baris untuk melihat jejak data (lineage).",

    openInputH: "Buka Input Sektoral",
    openInputV: "Buka Input Kewilayahan",
    openInbox2: "Buka Kotak Masuk Verifikasi",
    download: "Unduh Data Terfilter",
    viewLogs: "Lihat Log",

    open: "Buka",
    noResults: "Tidak ada hasil",
    searchResults: "Hasil Pencarian",
    details: "Rincian",
    openStatus: "TERBUKA",
    lockedStatus: "TERKUNCI"
  },

  EN: {
    appTitle: "Adaptation MoNEv – MPC",
    appSub: "Dashboard / Control Tower",

    navDashboard: "Dashboard (Home)",
    navInput: "Data Input",
    navReview: "Verification & Validation",
    navEngine: "Impact Engine",
    navReporting: "Reporting & Export",
    navHelp: "Help Center",

    periodActive: "Active Period",
    periodStatus: "Period Status",
    lockPeriod: "Lock Period",

    quickActions: "Quick Actions",
    qaInputH: "Sectoral",
    qaInputV: "Regional",
    qaInbox: "Verification",
    qaRunCompute: "Computation",
    qaExport: "Reports",
    qaDataHub: "Portal Data",

    globalFilters: "Global Filters",
    reset: "Reset",

    cardH: "Sectoral Input",
    cardV: "Regional Input",
    cardQA: "Verification & Validation",
    cardEngine: "Impact Engine",

    submissions: "entries",
    pending: "Pending",
    approved: "Approved",
    coverage: "Coverage",
    inboxItems: "items",
    returned: "Needs Fix",
    avgReview: "Avg processing",
    readiness: "readiness",
    lastRun: "Last run",
    errors: "Errors",

    goInput: "Go to Input →",
    openInbox: "Open Inbox →",
    openEngine: "Open Impact Engine →",

    tasks: "Tasks",
    alerts: "Alerts",
    logs: "Computation Logs",

    tabMPC: "National View",
    tabH: "Sectoral View",
    tabV: "Regional View",
    tabImpact: "Impact View",

    kpiActions: "Verified actions",
    kpiProgress: "Indicator progress",
    kpiReadiness: "National readiness",
    kpiCoverage: "Locations covered",

    colSector: "Sector",
    colActions: "# Actions",
    colApproved: "% Approved",
    colReadiness: "Avg readiness",
    colStatus: "Status",

    viewReports: "View Report Packages",
    brief: "Generate Briefing Note",

    hHint: "Sector/institution snapshot (mock). Click a row for details.",
    vHint: "Regional snapshot (mock). Click a row for details.",
    impactHint: "Computed outputs (mock). Click a row for lineage.",

    openInputH: "Open Sectoral Input",
    openInputV: "Open Regional Input",
    openInbox2: "Open Verification Inbox",
    download: "Download Filtered Data",
    viewLogs: "View Logs",

    open: "Open",
    noResults: "No results",
    searchResults: "Search Results",
    details: "Details",
    openStatus: "OPEN",
    lockedStatus: "LOCKED"
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

  // Sinkronkan status periode agar tidak nyangkut OPEN/LOCKED
  const status = document.getElementById("periodStatus");
  if (status) {
    const locked = status.classList.contains("locked");
    status.textContent = locked ? dict.lockedStatus : dict.openStatus;
  }

  // Render ulang list supaya label link "Buka/Open" ikut sesuai bahasa
  fillLists();
}

function setYears() {
  const yearSel = document.getElementById("yearSel");
  if (!yearSel) return;

  const now = new Date().getFullYear();
  const years = [now - 1, now, now + 1, now + 2];
  yearSel.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join("");
  yearSel.value = now;
}

function fillLists() {
  const dict = i18n[lang];
  const openLabel = dict.open || (lang === "ID" ? "Buka" : "Open");

  const ul = (id, items) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = items
      .map(i => `<li>${i.text} <a href="${i.link}">${openLabel}</a></li>`)
      .join("");
  };

  ul("tasksList", mock.tasks);
  ul("alertsList", mock.alerts);
  ul("logsList", mock.logs);
}

function fillTables() {
  const mpcBody = document.querySelector("#mpcTable tbody");
  if (mpcBody) {
    mpcBody.innerHTML = mock.mpcRows.map(r =>
      `<tr>
        <td>${r.sector}</td><td>${r.actions}</td><td>${r.approved}</td><td>${r.readiness}</td><td>${r.status}</td>
      </tr>`
    ).join("");
  }

  const hBody = document.querySelector("#hTable tbody");
  if (hBody) {
    hBody.innerHTML = mock.hRows.map(r =>
      `<tr data-kind="action" data-id="${r.action}">
        <td>${r.inst}</td><td>${r.action}</td><td>${r.sector}</td><td>${r.loc}</td><td>${r.ind}</td>
        <td>${r.tgt}</td><td>${r.act}</td><td>${r.qa}</td>
      </tr>`
    ).join("");
  }

  const vBody = document.querySelector("#vTable tbody");
  if (vBody) {
    vBody.innerHTML = mock.vRows.map(r =>
      `<tr data-kind="location" data-id="${r.loc}">
        <td>${r.loc}</td><td>${r.actions}</td><td>${r.inds}</td><td>${r.readiness}</td><td>${r.pending}</td><td>${r.updated}</td>
      </tr>`
    ).join("");
  }

  const iBody = document.querySelector("#impactTable tbody");
  if (iBody) {
    iBody.innerHTML = mock.impactRows.map(r =>
      `<tr data-kind="lineage" data-id="${r.group}">
        <td>${r.domain}</td><td>${r.group}</td><td>${r.value}</td><td>${r.trend}</td><td>${r.coverage}</td><td>${r.conf}</td>
      </tr>`
    ).join("");
  }
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
        const panel = document.getElementById(`tab-${t}`);
        if (panel) panel.classList.toggle("hidden", t !== tab);
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
        const panel = document.getElementById(`view-${v}`);
        if (panel) panel.classList.toggle("hidden", v !== view);
      });
    });
  });
}

function modal(id, show) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle("hidden", !show);
}

function showInfo(title, html) {
  const t = document.getElementById("infoTitle");
  const b = document.getElementById("infoBody");
  if (t) t.textContent = title;
  if (b) b.innerHTML = html;
  modal("infoModal", true);
}

function attachRowClicks() {
  // MPC table row click → show quick insight
  const mpc = document.getElementById("mpcTable");
  if (mpc) {
    mpc.addEventListener("click", (e) => {
      const tr = e.target.closest("tr");
      if (!tr) return;
      const tds = tr.querySelectorAll("td");
      if (tds.length < 5) return;

      showInfo("Ringkasan Sektor", `
        <p><b>Sektor:</b> ${tds[0].textContent}</p>
        <p><b># Aksi:</b> ${tds[1].textContent} &nbsp; <b>% Disetujui:</b> ${tds[2].textContent}</p>
        <p><b>Rata-rata kesiapan:</b> ${tds[3].textContent} &nbsp; <b>Status:</b> ${tds[4].textContent}</p>
        <p class="muted">Berikutnya: halaman rincian (drill-down) akan aktif saat backend siap.</p>
      `);
    });
  }

  // H/V/Impact table clicks
  ["hTable","vTable","impactTable"].forEach(id => {
    const table = document.getElementById(id);
    if (!table) return;

    table.addEventListener("click", (e) => {
      const tr = e.target.closest("tr");
      if (!tr) return;

      const kind = tr.getAttribute("data-kind");
      const ref = tr.getAttribute("data-id");

      if (kind === "action") {
        showInfo("Rincian Aksi (Mock)", `
          <p><b>Aksi:</b> ${ref}</p>
          <p class="muted">Akan diarahkan ke /dashboard/action/:id pada iterasi berikutnya.</p>
        `);
      } else if (kind === "location") {
        showInfo("Rincian Wilayah (Mock)", `
          <p><b>Wilayah:</b> ${ref}</p>
          <p class="muted">Akan diarahkan ke /dashboard/location/:id pada iterasi berikutnya.</p>
        `);
      } else {
        showInfo("Jejak Data / Lineage (Mock)", `
          <p><b>Output:</b> ${ref}</p>
          <ul>
            <li>Sumber: 32 aksi</li>
            <li>Indikator: IND-01, IND-03, IND-07</li>
            <li>Bukti: dokumen/foto/dataset</li>
            <li>Versi: 2026 S1 – v1</li>
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

  if (!btn || !input || !scope) return;

  const run = () => {
    const q = input.value.trim();
    const sc = scope.value;
    if (!q) return;

    const ql = q.toLowerCase();
    const dict = i18n[lang];

    const instItems = Array.from(
      new Set(
        mock.hRows
          .map(r => r.inst)
          .filter(x => (x || "").toLowerCase().includes(ql))
      )
    );

    const sections = [
      { key: "actions", title: (lang === "ID" ? "Aksi" : "Actions"), items: mock.hRows.filter(r => r.action.toLowerCase().includes(ql)).map(r => r.action) },
      { key: "locations", title: (lang === "ID" ? "Wilayah" : "Locations"), items: mock.vRows.filter(r => r.loc.toLowerCase().includes(ql)).map(r => r.loc) },
      { key: "indicators", title: (lang === "ID" ? "Indikator" : "Indicators"), items: mock.hRows.filter(r => r.ind.toLowerCase().includes(ql)).map(r => r.ind) },
      { key: "institutions", title: (lang === "ID" ? "Instansi" : "Institutions"), items: instItems },
      { key: "reports", title: (lang === "ID" ? "Laporan" : "Reports"), items: ql.includes("btr") ? ["BTR 2026 S1 – v1"] : [] },
      { key: "help", title: (lang === "ID" ? "Bantuan" : "Help"), items: (ql.includes("bukti") || ql.includes("evidence")) ? ["Daftar periksa bukti valid"] : [] },
    ];

    const filtered = (sc === "all") ? sections : sections.filter(s => s.key === sc);

    const titleEl = document.getElementById("searchTitle");
    const bodyEl = document.getElementById("searchBody");
    if (!titleEl || !bodyEl) return;

    titleEl.textContent = `${dict.searchResults}: "${q}"`;
    bodyEl.innerHTML = filtered.map(s => `
      <div style="margin-bottom:12px">
        <div style="font-weight:900; margin-bottom:6px">${s.title} (${s.items.length})</div>
        ${s.items.length
          ? `<ul>${s.items.map(it => `<li>${it}</li>`).join("")}</ul>`
          : `<div class="muted">${dict.noResults}</div>`}
      </div>
    `).join("");

    modal("searchModal", true);
  };

  btn.addEventListener("click", run);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") run(); });

  document.getElementById("closeSearch")?.addEventListener("click", () => modal("searchModal", false));
}

function lockBehavior() {
  const btn = document.getElementById("lockBtn");
  const status = document.getElementById("periodStatus");
  if (!btn || !status) return;

  btn.addEventListener("click", () => {
    const locked = status.classList.contains("locked");
    const dict = i18n[lang];

    if (locked) {
      status.classList.remove("locked");
      status.classList.add("open");
      status.textContent = dict.openStatus;
    } else {
      status.classList.remove("open");
      status.classList.add("locked");
      status.textContent = dict.lockedStatus;
    }
  });
}

function langBehavior() {
  const btn = document.getElementById("langToggle");
  if (!btn) return;

  btn.addEventListener("click", () => {
    lang = (lang === "ID") ? "EN" : "ID";
    applyI18n();
  });
}

function computeButtons() {
  const runCopy = () => {
    showInfo("Jalankan Komputasi (Mock)", `
      <p>Komputasi akan dijalankan di modul <b>Impact Engine</b>.</p>
      <p class="muted">Backend akan menjadwalkan proses. Saat ini masih UI mock.</p>
    `);
  };

  document.getElementById("runComputeBtn")?.addEventListener("click", runCopy);
  document.getElementById("runComputeBtn2")?.addEventListener("click", runCopy);

  document.getElementById("briefBtn")?.addEventListener("click", () => {
    showInfo("Catatan Ringkas (Mock)", `
      <p><b>Draf catatan ringkas</b> akan dibuat dari output komputasi + narasi (menyusul).</p>
    `);
  });

  // delegation close (tetap jalan walau tombol close dibuat ulang)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("#closeInfo");
    if (!btn) return;
    modal("infoModal", false);
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

  const sectorEl = getEl("sectorSel");
  state.sector =
    (sectorEl?.value || "").trim() ||
    (sectorEl?.selectedOptions?.[0]?.textContent || "").trim() ||
    "";

  state.location = getEl("locationSel")?.value || "";
  state.institution = getEl("instSel")?.value || "";
  state.typology = getEl("typologySel")?.value || "";
}

function resetFiltersUI() {
  ["sectorSel","locationSel","instSel","typologySel"].forEach(id => {
    const el = getEl(id);
    if (el) el.value = "";
  });
  // keep year/subperiod as-is
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
const trendLabels = ["Q1 2025","Q2 2025","Q3 2025","Q4 2025","Q1 2026","Q2 2026","Q3 2026","Q4 2026","Q1 2027"];

function getDummySectorSeries(sector) {
  const key = (sector || "").trim();
  let data = [];
  let label = "Tidak ada data";

  switch (key) {
    case "Food":
      data = [230, 240, 250, 260, 270, 280, 290, 300, 310];
      label = "Sektor Pangan";
      break;
    case "Water":
      data = [180, 190, 200, 210, 220, 230, 240, 250, 260];
      label = "Sektor Air";
      break;
    case "Health":
      data = [95, 100, 105, 110, 115, 120, 125, 130, 135];
      label = "Sektor Kesehatan";
      break;
    case "Ecosystem":
      data = [210, 220, 230, 240, 250, 260, 270, 280, 290];
      label = "Sektor Ekosistem";
      break;
    case "DRM":
      data = [160, 170, 180, 190, 200, 210, 220, 230, 240];
      label = "Sektor Kebencanaan";
      break;
    case "Coastal":
      data = [120, 130, 140, 150, 160, 170, 180, 190, 200];
      label = "Sektor Pesisir";
      break;

    default: {
      // Semua sektor (total, bukan rata-rata)
      const all = [
        [230, 240, 250, 260, 270, 280, 290, 300, 310], // Pangan
        [180, 190, 200, 210, 220, 230, 240, 250, 260], // Air
        [95, 100, 105, 110, 115, 120, 125, 130, 135],  // Kesehatan
        [210, 220, 230, 240, 250, 260, 270, 280, 290], // Ekosistem
        [160, 170, 180, 190, 200, 210, 220, 230, 240], // Kebencanaan
        [120, 130, 140, 150, 160, 170, 180, 190, 200], // Pesisir
      ];
      data = all[0].map((_, i) => all.reduce((acc, arr) => acc + arr[i], 0));
      label = "Semua Sektor (Total)";
      break;
    }
  }

  return { label, data };
}

function seededNoise(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function buildTrendValues(filteredRows) {
  // baseline "masuk akal" biar grafik berubah sesuai filter
  let baseline = 0;

  if (state.location) {
    baseline = mock.vRows.find(x => x.loc === state.location)?.actions || 0;
  } else if (state.sector) {
    baseline = mock.mpcRows.find(x => x.sector === state.sector)?.actions || 0;
  } else if (state.institution) {
    baseline = Math.max(60, (filteredRows?.length || 0) * 60);
  } else {
    baseline = mock.mpcRows.reduce((s, r) => s + (r.actions || 0), 0) || 0;
  }

  if (baseline === 0) baseline = 60;

  const seed =
    (parseInt(state.year || "2026", 10) * 7) +
    (state.subperiod === "S2" ? 13 : 5) +
    (state.sector ? state.sector.length * 17 : 3) +
    (state.location ? state.location.length * 11 : 2) +
    (state.institution ? state.institution.length * 19 : 1) +
    (state.typology ? state.typology.length * 23 : 0);

  const vals = trendLabels.map((_, i) => {
    const t = i / (trendLabels.length - 1);
    const drift = 0.7 + (t * 0.55);
    const wiggle = (seededNoise(seed + i * 3) - 0.5) * 0.12;
    const v = baseline * (drift + wiggle);
    return Math.max(0, Math.round(v));
  });

  return vals;
}


function renderTrendSvg(svgId, labels, values, seriesLabel = "") {
  const svg = getEl(svgId);
  if (!svg) return;

  const W = 720, H = 360;
  const pad = { l: 54, r: 18, t: 20, b: 44 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const minV = 0;
  const maxV = Math.max(...values, 1);
  const yMax = Math.ceil(maxV * 1.12);

  const x = (i) => pad.l + (i * innerW / Math.max(1, labels.length - 1));
  const y = (v) => pad.t + (innerH - ((v - minV) / (yMax - minV)) * innerH);

  const pts = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");

  const gridLines = 4;
  const yTicks = Array.from({ length: gridLines + 1 }, (_, k) => {
    const val = Math.round((yMax / gridLines) * k);
    return { val, yy: y(val) };
  });

  const titleParts = [];
  if (state.sector) titleParts.push(`Sektor: ${state.sector}`);
  if (state.location) titleParts.push(`Wilayah: ${state.location}`);
  if (state.institution) titleParts.push(`Instansi: ${state.institution}`);
  if (state.typology) titleParts.push(`Tipologi: ${state.typology}`);
  const title = titleParts.length ? titleParts.join(" • ") : "Semua data";

  svg.innerHTML = `
    <defs>
      <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="rgba(37,99,235,0.25)"/>
        <stop offset="100%" stop-color="rgba(37,99,235,0)"/>
      </linearGradient>
    </defs>

    <rect x="0" y="0" width="${W}" height="${H}"
      rx="14" ry="14"
      fill="#ffffff"
      stroke="#e5e7eb" />

    <text x="${pad.l}" y="${pad.t - 6}"
      fill="#0f172a"
      font-size="12"
      font-weight="700">
      ${title}
    </text>

    ${yTicks.map(t => `
      <line x1="${pad.l}" y1="${t.yy}"
            x2="${W - pad.r}" y2="${t.yy}"
            stroke="#e5e7eb" />
      <text x="${pad.l - 10}" y="${t.yy + 4}"
            text-anchor="end"
            fill="#64748b"
            font-size="11">
        ${t.val}
      </text>
    `).join("")}

    ${labels.map((lab, i) => {
      if (i % 2 !== 0 && i !== labels.length - 1) return "";
      return `
        <text x="${x(i)}" y="${H - 18}"
              text-anchor="middle"
              fill="#64748b"
              font-size="11">
          ${lab}
        </text>`;
    }).join("")}

    <polygon
      points="${pad.l},${pad.t + innerH} ${pts} ${W - pad.r},${pad.t + innerH}"
      fill="url(#trendFill)" />

    <polyline
      points="${pts}"
      fill="none"
      stroke="#2563eb"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round" />

    ${values.map((v, i) => `
      <circle cx="${x(i)}" cy="${y(v)}" r="3"
              fill="#2563eb"
              stroke="#ffffff"
              stroke-width="1.5" />
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
  map = L.map("mapid", { zoomControl: true }).setView([0.7874, 119.9965], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
  updateMapMarkers();

  setTimeout(() => map && map.invalidateSize(), 50);
}

function updateMapMarkers() {
  if (!markersLayer) return;
  markersLayer.clearLayers();

  // ⛔ SEKTOR TIDAK DIANGGAP FILTER PETA
  const hasMapFilter = state.location || state.institution || state.typology;

  const counts = {};

  // MODE NASIONAL
  if (!hasMapFilter) {
    mock.vRows.forEach(r => {
      counts[r.loc] = r.actions;
    });
  } else {
    mock.hRows.forEach(r => {
      if (state.location && r.loc !== state.location) return;
      if (state.institution && r.inst !== state.institution) return;
      // typology belum ada di data → skip
      counts[r.loc] = (counts[r.loc] || 0) + 1;
    });
  }

  Object.entries(counts).forEach(([loc, n]) => {
    const coords = provinceCoords[loc];
    if (!coords) return;

    L.circleMarker(coords, {
      radius: Math.max(6, Math.min(20, 6 + Math.sqrt(n) * 3)),
      color: "#4f9cff",
      weight: 2,
      fillColor: "#4f9cff",
      fillOpacity: 0.3
    })
    .bindPopup(`
      <b>${loc}</b><br>
      Jumlah Aksi: <b>${n}</b>
    `)
    .addTo(markersLayer);
  });

  if (state.location && provinceCoords[state.location]) {
    map.setView(provinceCoords[state.location], 6);
  }
}

function computeTrendSeries() {
  // BASE SERIES:
  // - kalau state.sector kosong => default getDummySectorSeries() sudah TOTAL (jumlah semua sektor)
  // - kalau pilih sektor => series sektor itu
  const base = getDummySectorSeries(state.sector);
  const baseData = base.data.slice();

  // faktor skala agar grafik berubah saat filter berubah (mock yang masuk akal)
  let factor = 1;

  // lokasi: pakai vRows.actions sebagai skala (dibanding prov max)
  if (state.location) {
    const v = mock.vRows.find(x => x.loc === state.location)?.actions || 0;
    const vmax = Math.max(...mock.vRows.map(x => x.actions || 0), 1);
    const r = v / vmax;               // 0..1
    factor *= (0.75 + 0.5 * r);       // 0.75..1.25
  }

  // instansi: pakai proporsi baris yg match
  if (state.institution) {
    const filtered = filterHorizontalRows().length || 0;
    const total = mock.hRows.length || 1;
    const r = filtered / total;       // 0..1
    factor *= (0.85 + 0.6 * r);       // 0.85..1.45 (tapi biasanya kecil)
  }

  // tipologi (karena belum ada data) → efek kecil saja biar tetap responsif
  if (state.typology) factor *= 1.03;

  // subperiod
  if (state.subperiod === "S2") factor *= 1.02;

  // year: shift kecil (+/- 6% max)
  const y = parseInt(state.year || "2026", 10);
  const yShift = Math.max(-0.06, Math.min(0.06, (y - 2026) * 0.02));
  factor *= (1 + yShift);

  // wiggle kecil per titik agar beda antar-filter tapi tetap "total" berbasis baseData
  const seed =
    (parseInt(state.year || "2026", 10) * 7) +
    (state.subperiod === "S2" ? 13 : 5) +
    (state.sector ? state.sector.length * 17 : 3) +
    (state.location ? state.location.length * 11 : 2) +
    (state.institution ? state.institution.length * 19 : 1) +
    (state.typology ? state.typology.length * 23 : 0);

  const data = baseData.map((v, i) => {
    const wiggle = (seededNoise(seed + i * 7) - 0.5) * 0.06; // ±3%
    return Math.max(0, Math.round(v * factor * (1 + wiggle)));
  });

  // label tampil
  const labelParts = [base.label];
  if (state.location) labelParts.push(`Wilayah: ${state.location}`);
  if (state.institution) labelParts.push(`Instansi: ${state.institution}`);
  if (state.typology) labelParts.push(`Tipologi: ${state.typology}`);

  return { label: labelParts.join(" • "), data };
}


// -------------------------------
// Single source of truth: update visuals
// -------------------------------
function updateVisuals() {
  readFiltersFromUI();

  const series = computeTrendSeries(); // <-- BARU
  renderTrendSvg("trendSvg", trendLabels, series.data, series.label);

  if (map) updateMapMarkers();
}


function filtersBehavior() {
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

  // OPTIONAL tapi bikin kebal kalau elemen filter dibuat ulang / id berubah saat render
  document.addEventListener("change", (e) => {
    const ids = ["yearSel","subperiodSel","sectorSel","locationSel","instSel","typologySel"];
    if (ids.includes(e.target?.id)) updateVisuals();
  });
}


function sidebarBehavior() {
  const btn = document.getElementById("burgerBtn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  if (!btn || !sidebar || !overlay) return;

  const isMobile = () => window.matchMedia("(max-width: 980px)").matches;

  // restore state
  const saved = localStorage.getItem("sidebar_state"); // "open" | "closed"
  if (saved === "closed") document.body.classList.add("sidebar-closed");

  const setAria = () => {
    const isClosed = document.body.classList.contains("sidebar-closed");
    btn.setAttribute("aria-expanded", String(!isClosed));
    btn.setAttribute("aria-label", isClosed ? "Buka menu" : "Tutup menu");
  };

  const closeMobileDrawer = () => document.body.classList.remove("sidebar-open");

  const toggle = () => {
    const willClose = !document.body.classList.contains("sidebar-closed");
    document.body.classList.toggle("sidebar-closed", willClose);

    // kalau ditutup, pastikan drawer mobile juga ketutup
    if (willClose) closeMobileDrawer();

    localStorage.setItem("sidebar_state", willClose ? "closed" : "open");
    setAria();
  };

  // Desktop & Mobile: burger toggle "closed/open"
  btn.addEventListener("click", () => {
    // mobile behavior:
    // - kalau sidebar dalam keadaan "closed" lalu klik burger, kita buka dulu (remove sidebar-closed)
    // - lalu tampilkan drawer (sidebar-open)
    if (isMobile()) {
      const isClosed = document.body.classList.contains("sidebar-closed");
      if (isClosed) {
        document.body.classList.remove("sidebar-closed");
        localStorage.setItem("sidebar_state", "open");
      }
      document.body.classList.add("sidebar-open");
      setAria();
      return;
    }
    // desktop: toggle closed/open
    toggle();
  });

  // overlay hanya untuk mobile drawer
  overlay.addEventListener("click", closeMobileDrawer);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMobileDrawer();
  });

  // klik menu di mobile -> auto close drawer
  sidebar.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => { if (isMobile()) closeMobileDrawer(); });
  });

  // kalau resize dari mobile->desktop, tutup drawer
  window.addEventListener("resize", () => {
    if (!isMobile()) closeMobileDrawer();
  });

  setAria();
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
  sidebarBehavior();

  // Filter-aware visuals on Home (map + trend)
  readFiltersFromUI();
  filtersBehavior();
  initMap();
  updateVisuals();
}

document.addEventListener("DOMContentLoaded", init);
