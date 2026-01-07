// Input Wizard (frontend-only)
// - Mode: Sektoral (HORIZONTAL) / Kewilayahan (VERTICAL) via #horizontal / #vertical
// - Autosave ke localStorage
// - Readiness score + validasi field wajib
// - Evidence upload: stub (hanya list di UI)

const STEPS = [
  { id: 1, name: "Identitas" },
  { id: 2, name: "Lokasi" },
  { id: 3, name: "Sektor" },
  { id: 4, name: "Indikator" },
  { id: 5, name: "Nilai" },
  { id: 6, name: "Bukti" },
  { id: 7, name: "Ringkasan" },
];

let currentStep = 1;
let mode = "HORIZONTAL"; // HORIZONTAL = Sektoral, VERTICAL = Kewilayahan

const els = {};
const state = {
  // Step 1
  actionName: "",
  implStatus: "",
  institution: "",
  implementingUnit: "",
  actionDesc: "",
  // Step 2
  prov: "",
  kab: "",
  kec: "",
  desa: "",
  coverageNotes: "",
  // Step 3
  sector: "",
  typology: "",
  napMap: "",
  // Step 4
  indicator: "",
  unit: "",
  methodNotes: "",
  // Step 5
  baseline: "",
  target: "",
  actual: "",
  period: "",
  valueNotes: "",
  // Step 6
  evidenceFiles: [], // {name,size,type}
  evidenceLink: "",
  evidenceDesc: "",
  // Meta
  _mode: "HORIZONTAL",
  _updatedAt: null,
  _status: "DRAFT",
  _readiness: 0,
};

// ---------- Helpers ----------
function qs(id) { return document.getElementById(id); }

function safeText(el, text) {
  if (!el) return;
  el.textContent = text;
}

function safeToggleClass(el, cls, on) {
  if (!el) return;
  el.classList.toggle(cls, !!on);
}

function modeLabel(m) {
  return m === "VERTICAL" ? "Kewilayahan" : "Sektoral";
}

function implStatusLabel(v) {
  const map = { Planned: "Direncanakan", Ongoing: "Berjalan", Completed: "Selesai" };
  return map[v] || v || "—";
}

function sectorLabel(v) {
  const map = {
    Food: "Pangan",
    Water: "Air",
    Health: "Kesehatan",
    Ecosystems: "Ekosistem & Lanskap",
    DRM: "Kebencanaan",
    Coastal: "Pesisir & Pulau Kecil",
  };
  return map[v] || v || "—";
}

function typologyLabel(v) {
  const map = {
    Infrastructure: "Infrastruktur",
    EbA: "Adaptasi Berbasis Ekosistem (EbA)",
    Capacity: "Peningkatan Kapasitas",
    Governance: "Tata Kelola/Kelembagaan",
    EWS: "Peringatan Dini & Kesiapsiagaan",
  };
  return map[v] || v || "—";
}

function storageKey() {
  return `monev_draft_${mode.toLowerCase()}`;
}

function markUpdated() {
  state._updatedAt = new Date().toISOString();
}

function autosave() {
  try {
    localStorage.setItem(storageKey(), JSON.stringify(state));
  } catch (e) {
    // ignore quota / privacy errors (frontend stub)
  }
}

function loadDraft() {
  const raw = localStorage.getItem(storageKey());
  if (!raw) return false;
  try {
    const obj = JSON.parse(raw);
    Object.assign(state, obj);
    return true;
  } catch {
    return false;
  }
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));
}

// ---------- UI Refs ----------
function initRefs() {
  [
    "wizTitle", "wizSub", "stepper", "readinessPill", "readinessPill2",
    "modeH", "modeV", "clearDraftBtn",
    "actionName", "implStatus", "institution", "implementingUnit", "actionDesc",
    "prov", "kab", "kec", "desa", "coverageNotes",
    "sector", "typology", "napMap",
    "indicator", "unit", "methodNotes",
    "baseline", "target", "actual", "period", "valueNotes",
    "fileInput", "fileList", "evidenceLink", "evidenceDesc",
    "prevBtn", "nextBtn", "backBtn", "submitBtn", "navFooter", "stepHint",
    "saveDraftBtn", "exportDraftBtn",
    "summaryTitle", "summaryMeta", "summaryTable",
    "toast", "toastTitle", "toastMsg"
  ].forEach(k => els[k] = qs(k));
}

// ---------- Toast ----------
function showToast(title, msg) {
  if (!els.toast) return;
  safeText(els.toastTitle, title);
  safeText(els.toastMsg, msg);
  els.toast.classList.add("show");
  setTimeout(() => els.toast.classList.remove("show"), 1700);
}

// ---------- Mode ----------
function setModeFromHash() {
  const h = (location.hash || "").toLowerCase();
  mode = h.includes("vertical") ? "VERTICAL" : "HORIZONTAL";
  state._mode = mode;

  safeText(els.wizTitle, `Input Data – ${modeLabel(mode)}`);
  safeToggleClass(els.modeH, "active", mode === "HORIZONTAL");
  safeToggleClass(els.modeV, "active", mode === "VERTICAL");

  safeText(
    els.wizSub,
    mode === "HORIZONTAL"
      ? "Input oleh K/L untuk kompilasi nasional. Draf tersimpan otomatis di browser."
      : "Input oleh Pemda/OPD untuk kompilasi kewilayahan. Draf tersimpan otomatis di browser."
  );
}

// ---------- Stepper ----------
function renderStepper() {
  if (!els.stepper) return;

  els.stepper.innerHTML = "";
  STEPS.forEach(s => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "step";
    btn.textContent = `${s.id}. ${s.name}`;
    btn.dataset.step = String(s.id);
    btn.addEventListener("click", () => goToStep(s.id));
    els.stepper.appendChild(btn);
  });

  refreshStepper();
}

function refreshStepper() {
  document.querySelectorAll(".step").forEach(b => {
    const s = Number(b.dataset.step);
    b.classList.toggle("active", s === currentStep);
    b.classList.toggle("done", s < currentStep);
  });

  safeText(els.stepHint, `Langkah ${currentStep} dari 7`);
}

function showStep(step) {
  document.querySelectorAll(".step-page").forEach(p => {
    p.classList.toggle("hidden", Number(p.dataset.step) !== step);
  });

  // show/hide footer nav
  const isLast = step === 7;
  safeToggleClass(els.navFooter, "hidden", isLast);
}

// ---------- Validation / Navigation ----------
function validateStep(step) {
  const missing = [];
  const req = (cond, label) => { if (!cond) missing.push(label); };

  if (step === 1) {
    req(state.actionName.trim().length > 0, "Nama Aksi");
    req(state.implStatus.trim().length > 0, "Status Implementasi");
    req(state.institution.trim().length > 0, "Instansi");
  }
  if (step === 2) {
    req(state.prov.trim().length > 0, "Provinsi");
  }
  if (step === 3) {
    req(state.sector.trim().length > 0, "Sektor");
    req(state.typology.trim().length > 0, "Tipologi");
  }
  if (step === 4) {
    req(state.indicator.trim().length > 0, "Indikator");
    req(state.unit.trim().length > 0, "Satuan");
  }
  if (step === 5) {
    req(String(state.target).trim().length > 0, "Target");
    req(state.period.trim().length > 0, "Periode");
  }
  if (step === 6) {
    req(
      state.evidenceFiles.length > 0 || state.evidenceLink.trim().length > 0,
      "Bukti (file atau tautan)"
    );
  }

  return { ok: missing.length === 0, missing };
}

function goToStep(step) {
  // prevent jumping forward if current step has blocking errors (except backwards)
  if (step > currentStep) {
    const { ok } = validateStep(currentStep);
    if (!ok) {
      showToast("Validasi", "Lengkapi item wajib sebelum lanjut.");
      return;
    }
  }

  currentStep = step;
  refreshStepper();
  showStep(step);
  if (step === 7) renderSummary();
}

function prev() {
  if (currentStep > 1) goToStep(currentStep - 1);
}

function next() {
  const { ok } = validateStep(currentStep);
  if (!ok) {
    showToast("Validasi", "Masih ada field wajib yang belum valid.");
    return;
  }
  if (currentStep < 7) goToStep(currentStep + 1);
}

// ---------- Readiness ----------
function calcReadiness() {
  // scoring sederhana:
  // Step1 20, Step2 10, Step3 15, Step4 15, Step5 20, Step6 20 = 100
  let score = 0;

  // Step1
  if (state.actionName.trim()) score += 8;
  if (state.implStatus.trim()) score += 6;
  if (state.institution.trim()) score += 6;

  // Step2
  if (state.prov.trim()) score += 10;

  // Step3
  if (state.sector.trim()) score += 8;
  if (state.typology.trim()) score += 7;

  // Step4
  if (state.indicator.trim()) score += 8;
  if (state.unit.trim()) score += 7;

  // Step5
  if (String(state.target).trim()) score += 12;
  if (state.period.trim()) score += 8;

  // Step6
  if (state.evidenceFiles.length > 0) score += 14;
  if (state.evidenceLink.trim()) score += 6;

  return Math.min(100, score);
}

function updateReadiness() {
  const r = calcReadiness();
  state._readiness = r;

  const setPill = (pillEl) => {
    if (!pillEl) return;
    pillEl.textContent = `Kesiapan: ${r}%`;
    pillEl.classList.remove("good", "warn", "bad");
    if (r >= 80) pillEl.classList.add("good");
    else if (r >= 60) pillEl.classList.add("warn");
    else pillEl.classList.add("bad");
  };

  setPill(els.readinessPill);
  setPill(els.readinessPill2);

  const minOk =
    validateStep(1).ok &&
    validateStep(2).ok &&
    validateStep(3).ok &&
    validateStep(4).ok &&
    validateStep(5).ok &&
    validateStep(6).ok;

  if (els.submitBtn) els.submitBtn.disabled = !minOk;
}

// ---------- Form Bind / Fill ----------
let inputsBound = false;

function fillInputsFromState() {
  const setVal = (id, v) => { if (els[id]) els[id].value = v ?? ""; };

  setVal("actionName", state.actionName);
  setVal("implStatus", state.implStatus);
  setVal("institution", state.institution);
  setVal("implementingUnit", state.implementingUnit);
  setVal("actionDesc", state.actionDesc);

  setVal("prov", state.prov);
  setVal("kab", state.kab);
  setVal("kec", state.kec);
  setVal("desa", state.desa);
  setVal("coverageNotes", state.coverageNotes);

  setVal("sector", state.sector);
  setVal("typology", state.typology);
  setVal("napMap", state.napMap);

  setVal("indicator", state.indicator);
  setVal("unit", state.unit);
  setVal("methodNotes", state.methodNotes);

  setVal("baseline", state.baseline);
  setVal("target", state.target);
  setVal("actual", state.actual);
  setVal("period", state.period);
  setVal("valueNotes", state.valueNotes);

  setVal("evidenceLink", state.evidenceLink);
  setVal("evidenceDesc", state.evidenceDesc);
}

function bindInputsOnce() {
  if (inputsBound) return;
  inputsBound = true;

  const bind = (id, key) => {
    const el = els[id];
    if (!el) return;

    const isSelect = el.tagName === "SELECT";
    const evt = isSelect ? "change" : "input";

    el.addEventListener(evt, () => {
      state[key] = el.value;
      markUpdated();
      updateReadiness();
      if (currentStep === 7) renderSummary();
      autosave();
    });
  };

  bind("actionName", "actionName");
  bind("implStatus", "implStatus");
  bind("institution", "institution");
  bind("implementingUnit", "implementingUnit");
  bind("actionDesc", "actionDesc");

  bind("prov", "prov");
  bind("kab", "kab");
  bind("kec", "kec");
  bind("desa", "desa");
  bind("coverageNotes", "coverageNotes");

  bind("sector", "sector");
  bind("typology", "typology");
  bind("napMap", "napMap");

  bind("indicator", "indicator");
  bind("unit", "unit");
  bind("methodNotes", "methodNotes");

  bind("baseline", "baseline");
  bind("target", "target");
  bind("actual", "actual");
  bind("period", "period");
  bind("valueNotes", "valueNotes");

  bind("evidenceLink", "evidenceLink");
  bind("evidenceDesc", "evidenceDesc");

  // File input
  if (els.fileInput) {
    els.fileInput.addEventListener("change", () => {
      const files = Array.from(els.fileInput.files || []);
      state.evidenceFiles = files.map(f => ({ name: f.name, size: f.size, type: f.type || "unknown" }));
      renderFileList();
      markUpdated();
      updateReadiness();
      autosave();
    });
  }
}

// ---------- Evidence list ----------
function renderFileList() {
  if (!els.fileList) return;
  els.fileList.innerHTML = "";

  if (!state.evidenceFiles.length) {
    els.fileList.innerHTML = `<li class="muted">Belum ada file dipilih.</li>`;
    return;
  }

  state.evidenceFiles.forEach(f => {
    const li = document.createElement("li");
    const kb = Math.round((f.size || 0) / 1024);
    li.textContent = `${f.name} — ${kb} KB`;
    els.fileList.appendChild(li);
  });
}

// ---------- Summary ----------
function renderSummary() {
  safeText(els.summaryTitle, state.actionName ? state.actionName : "—");

  safeText(
    els.summaryMeta,
    `${modeLabel(mode)} • ${sectorLabel(state.sector)} • ${state.prov || "—"} • ${state.period || "—"} • ${state._status}`
  );

  const lokasi = [state.prov, state.kab, state.kec, state.desa].filter(Boolean).join(" / ") || "—";

  const rows = [
    ["Mode", modeLabel(mode)],
    ["Nama Aksi", state.actionName || "—"],
    ["Status Implementasi", implStatusLabel(state.implStatus)],
    ["Instansi", state.institution || "—"],
    ["Unit Pelaksana", state.implementingUnit || "—"],
    ["Lokasi", lokasi],
    ["Sektor", sectorLabel(state.sector)],
    ["Tipologi", typologyLabel(state.typology)],
    ["Indikator", state.indicator || "—"],
    ["Satuan", state.unit || "—"],
    ["Baseline", state.baseline || "—"],
    ["Target", state.target || "—"],
    ["Realisasi", state.actual || "—"],
    ["Bukti", `${state.evidenceFiles.length} file${state.evidenceLink ? " + tautan" : ""}`],
    ["Kesiapan", `${state._readiness}%`],
    ["Terakhir diperbarui", state._updatedAt || "—"],
  ];

  const tb = els.summaryTable?.querySelector("tbody");
  if (!tb) return;

  tb.innerHTML = rows
    .map(r => `<tr><td>${escapeHtml(r[0])}</td><td>${escapeHtml(r[1])}</td></tr>`)
    .join("");
}

// ---------- Draft actions ----------
function clearDraft() {
  localStorage.removeItem(storageKey());

  // reset state (tanpa rebind listener)
  Object.keys(state).forEach(k => {
    if (Array.isArray(state[k])) state[k] = [];
    else if (k.startsWith("_")) state[k] = (k === "_mode" ? mode : null);
    else state[k] = "";
  });

  state._mode = mode;
  state._status = "DRAFT";
  markUpdated();

  fillInputsFromState();
  renderFileList();
  updateReadiness();
  showToast("Draf dihapus", "Draf dihapus dari browser.");
}

function exportDraft() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${storageKey()}_${(state.period || "draft").replace(/[^a-zA-Z0-9_-]/g, "")}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Diekspor", "Draf JSON berhasil diunduh.");
}

function submit() {
  const allOk =
    validateStep(1).ok &&
    validateStep(2).ok &&
    validateStep(3).ok &&
    validateStep(4).ok &&
    validateStep(5).ok &&
    validateStep(6).ok;

  if (!allOk) {
    showToast("Tidak bisa ajukan", "Masih ada item wajib yang belum lengkap.");
    return;
  }

  state._status = "SUBMITTED";
  markUpdated();
  autosave();
  updateReadiness();
  showToast("Diajukan", "Tersimpan sebagai SUBMITTED (stub). Nanti masuk inbox verifikasi.");
}

// ---------- Sidebar toggle (opsional; aman walau elemennya belum ada) ----------
function sidebarBehavior() {
  // NOTE: fungsi ini hanya aktif kalau halaman menyediakan elemen berikut:
  // - button#burgerBtn
  // - aside#sidebar (atau elemen sidebar dengan id="sidebar")
  // - div#sidebarOverlay (optional untuk drawer mobile)
  const btn = document.getElementById("burgerBtn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  if (!btn || !sidebar) return;

  const isMobile = () => window.matchMedia("(max-width: 980px)").matches;

  // restore state desktop (closed/open)
  const saved = localStorage.getItem("sidebar_state"); // "open" | "closed"
  if (saved === "closed") document.body.classList.add("sidebar-closed");

  const setAria = () => {
    const isClosed = document.body.classList.contains("sidebar-closed");
    btn.setAttribute("aria-expanded", String(!isClosed));
    btn.setAttribute("aria-label", isClosed ? "Buka menu" : "Tutup menu");
  };

  const closeMobileDrawer = () => document.body.classList.remove("sidebar-open");

  const toggleDesktop = () => {
    const willClose = !document.body.classList.contains("sidebar-closed");
    document.body.classList.toggle("sidebar-closed", willClose);
    if (willClose) closeMobileDrawer();
    localStorage.setItem("sidebar_state", willClose ? "closed" : "open");
    setAria();
  };

  btn.addEventListener("click", () => {
    if (isMobile()) {
      // buka dulu jika sedang closed
      if (document.body.classList.contains("sidebar-closed")) {
        document.body.classList.remove("sidebar-closed");
        localStorage.setItem("sidebar_state", "open");
      }
      document.body.classList.add("sidebar-open");
      setAria();
      return;
    }
    toggleDesktop();
  });

  if (overlay) overlay.addEventListener("click", closeMobileDrawer);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMobileDrawer();
  });

  sidebar.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => { if (isMobile()) closeMobileDrawer(); });
  });

  window.addEventListener("resize", () => {
    if (!isMobile()) closeMobileDrawer();
  });

  setAria();
}

// ---------- Nav bind ----------
function bindNav() {
  els.prevBtn?.addEventListener("click", prev);
  els.nextBtn?.addEventListener("click", next);
  els.backBtn?.addEventListener("click", () => goToStep(6));
  els.submitBtn?.addEventListener("click", submit);

  els.saveDraftBtn?.addEventListener("click", () => {
    autosave();
    showToast("Tersimpan", "Draf tersimpan di browser.");
  });

  els.exportDraftBtn?.addEventListener("click", exportDraft);
  els.clearDraftBtn?.addEventListener("click", clearDraft);

  // mode switch
  els.modeH?.addEventListener("click", () => { location.hash = "#horizontal"; location.reload(); });
  els.modeV?.addEventListener("click", () => { location.hash = "#vertical"; location.reload(); });
}

// ---------- Init ----------
function init() {
  initRefs();
  setModeFromHash();

  renderStepper();

  const loaded = loadDraft();

  bindInputsOnce();
  fillInputsFromState();
  renderFileList();
  updateReadiness();

  // sidebar toggle (kalau elemennya ada)
  sidebarBehavior();

  if (loaded) showToast("Dimuat", "Draf sebelumnya dimuat dari browser.");

  bindNav();
  showStep(currentStep);
}

init();
