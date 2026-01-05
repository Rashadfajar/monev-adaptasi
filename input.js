// Input Wizard (frontend-only)
// - supports Horizontal/Vertical via #horizontal / #vertical
// - autosave to localStorage
// - readiness score + required validations
// - evidence upload stub list

const STEPS = [
  { id: 1, name: "Identitas" },
  { id: 2, name: "Lokasi" },
  { id: 3, name: "Sektor" },
  { id: 4, name: "Indikator" },
  { id: 5, name: "Nilai" },
  { id: 6, name: "Evidence" },
  { id: 7, name: "Submit" },
];

let currentStep = 1;
let mode = "HORIZONTAL"; // or VERTICAL

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

function qs(id){ return document.getElementById(id); }

function initRefs(){
  [
    "wizTitle","wizSub","stepper","readinessPill","readinessPill2",
    "modeH","modeV","clearDraftBtn",
    "actionName","implStatus","institution","implementingUnit","actionDesc",
    "prov","kab","kec","desa","coverageNotes",
    "sector","typology","napMap",
    "indicator","unit","methodNotes",
    "baseline","target","actual","period","valueNotes",
    "fileInput","fileList","evidenceLink","evidenceDesc",
    "prevBtn","nextBtn","backBtn","submitBtn","navFooter","stepHint",
    "saveDraftBtn","exportDraftBtn",
    "summaryTitle","summaryMeta","summaryTable",
    "toast","toastTitle","toastMsg"
  ].forEach(k => els[k] = qs(k));
}

function storageKey(){
  return `monev_draft_${mode.toLowerCase()}`;
}

function showToast(title, msg){
  els.toastTitle.textContent = title;
  els.toastMsg.textContent = msg;
  els.toast.classList.add("show");
  setTimeout(()=>els.toast.classList.remove("show"), 1700);
}

function setModeFromHash(){
  const h = (location.hash || "").toLowerCase();
  mode = h.includes("vertical") ? "VERTICAL" : "HORIZONTAL";
  state._mode = mode;
  els.wizTitle.textContent = `Input Data – ${mode === "HORIZONTAL" ? "Horizontal" : "Vertical"}`;
  els.modeH.classList.toggle("active", mode === "HORIZONTAL");
  els.modeV.classList.toggle("active", mode === "VERTICAL");
  // hint wording
  els.wizSub.textContent =
    mode === "HORIZONTAL"
      ? "Input oleh K/L untuk kompilasi nasional. Draft tersimpan otomatis di browser."
      : "Input oleh Pemda/OPD untuk kompilasi kewilayahan. Draft tersimpan otomatis di browser.";
}

function renderStepper(){
  els.stepper.innerHTML = STEPS.map(s => {
    const btn = document.createElement("button");
    btn.className = "step";
    btn.textContent = `${s.id}. ${s.name}`;
    btn.onclick = () => goToStep(s.id);
    btn.dataset.step = String(s.id);
    return btn.outerHTML;
  }).join("");
  refreshStepper();
}

function refreshStepper(){
  document.querySelectorAll(".step").forEach(b => {
    const s = Number(b.dataset.step);
    b.classList.toggle("active", s === currentStep);
    b.classList.toggle("done", s < currentStep);
  });
  els.stepHint.textContent = `Step ${currentStep} of 7`;
}

function showStep(step){
  document.querySelectorAll(".step-page").forEach(p => {
    p.classList.toggle("hidden", Number(p.dataset.step) !== step);
  });

  // show/hide footer nav
  const isLast = step === 7;
  els.navFooter.classList.toggle("hidden", isLast);
}

function goToStep(step){
  // prevent jumping forward if current step has blocking errors (except backwards)
  if (step > currentStep) {
    const { ok } = validateStep(currentStep);
    if (!ok) {
      showToast("Validation", "Lengkapi item wajib sebelum lanjut.");
      return;
    }
  }
  currentStep = step;
  refreshStepper();
  showStep(step);
  if (step === 7) renderSummary();
}

function prev(){
  if (currentStep > 1) goToStep(currentStep - 1);
}

function next(){
  const { ok } = validateStep(currentStep);
  if (!ok) {
    showToast("Validation", "Masih ada field wajib yang belum valid.");
    return;
  }
  if (currentStep < 7) goToStep(currentStep + 1);
}

function bindInputs(){
  // helper: bind input/select/textarea
  const bind = (id, key) => {
    const el = els[id];
    const isSelect = el.tagName === "SELECT";
    const isTextArea = el.tagName === "TEXTAREA";
    const isInput = el.tagName === "INPUT";
    const get = () => isSelect || isTextArea || isInput ? el.value : "";
    const set = (v) => { el.value = v ?? ""; };

    el.addEventListener("input", () => {
      state[key] = get();
      markUpdated();
      updateReadiness();
      if (currentStep === 7) renderSummary();
      autosave();
    });
    // initial set
    set(state[key]);
  };

  bind("actionName","actionName");
  bind("implStatus","implStatus");
  bind("institution","institution");
  bind("implementingUnit","implementingUnit");
  bind("actionDesc","actionDesc");

  bind("prov","prov");
  bind("kab","kab");
  bind("kec","kec");
  bind("desa","desa");
  bind("coverageNotes","coverageNotes");

  bind("sector","sector");
  bind("typology","typology");
  bind("napMap","napMap");

  bind("indicator","indicator");
  bind("unit","unit");
  bind("methodNotes","methodNotes");

  bind("baseline","baseline");
  bind("target","target");
  bind("actual","actual");
  bind("period","period");
  bind("valueNotes","valueNotes");

  bind("evidenceLink","evidenceLink");
  bind("evidenceDesc","evidenceDesc");

  // file input
  els.fileInput.addEventListener("change", () => {
    const files = Array.from(els.fileInput.files || []);
    state.evidenceFiles = files.map(f => ({ name: f.name, size: f.size, type: f.type || "unknown" }));
    renderFileList();
    markUpdated();
    updateReadiness();
    autosave();
  });
}

function renderFileList(){
  els.fileList.innerHTML = "";
  if (!state.evidenceFiles.length){
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

function validateStep(step){
  // required by step
  const missing = [];
  const req = (cond, label) => { if (!cond) missing.push(label); };

  if (step === 1){
    req(state.actionName.trim().length > 0, "Nama Aksi");
    req(state.implStatus.trim().length > 0, "Status Implementasi");
    req(state.institution.trim().length > 0, "Instansi");
  }
  if (step === 2){
    // minimal: province required for both (can be relaxed for purely national horizontal)
    req(state.prov.trim().length > 0, "Provinsi");
  }
  if (step === 3){
    req(state.sector.trim().length > 0, "Sektor");
    req(state.typology.trim().length > 0, "Tipologi");
  }
  if (step === 4){
    req(state.indicator.trim().length > 0, "Indikator");
    req(state.unit.trim().length > 0, "Satuan");
  }
  if (step === 5){
    req(String(state.target).trim().length > 0, "Target");
    req(state.period.trim().length > 0, "Periode");
  }
  if (step === 6){
    // evidence minimal: at least one file OR a link
    req(state.evidenceFiles.length > 0 || state.evidenceLink.trim().length > 0, "Evidence (file atau link)");
  }

  return { ok: missing.length === 0, missing };
}

function calcReadiness(){
  // simple scoring (can be refined later):
  // Step1 required 20, Step2 10, Step3 15, Step4 15, Step5 20, Step6 20
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

function updateReadiness(){
  const r = calcReadiness();
  state._readiness = r;

  const setPill = (pillEl, r) => {
    pillEl.textContent = `Readiness: ${r}%`;
    pillEl.classList.remove("good","warn","bad");
    if (r >= 80) pillEl.classList.add("good");
    else if (r >= 60) pillEl.classList.add("warn");
    else pillEl.classList.add("bad");
  };

  setPill(els.readinessPill, r);
  if (els.readinessPill2) setPill(els.readinessPill2, r);

  // enable submit if minimum requirements for all steps satisfied
  const minOk =
    validateStep(1).ok &&
    validateStep(2).ok &&
    validateStep(3).ok &&
    validateStep(4).ok &&
    validateStep(5).ok &&
    validateStep(6).ok;

  els.submitBtn.disabled = !minOk;
}

function markUpdated(){
  state._updatedAt = new Date().toISOString();
}

function autosave(){
  localStorage.setItem(storageKey(), JSON.stringify(state));
}

function loadDraft(){
  const raw = localStorage.getItem(storageKey());
  if (!raw) return false;
  try{
    const obj = JSON.parse(raw);
    Object.assign(state, obj);
    return true;
  }catch{
    return false;
  }
}

function clearDraft(){
  localStorage.removeItem(storageKey());
  // reset state
  Object.keys(state).forEach(k => {
    if (Array.isArray(state[k])) state[k] = [];
    else if (k.startsWith("_")) state[k] = (k === "_mode" ? mode : null);
    else state[k] = "";
  });
  state._mode = mode;
  state._status = "DRAFT";
  markUpdated();
  // reset UI values
  bindInputs(); // rebinding sets current values; safe for this stub
  renderFileList();
  updateReadiness();
  showToast("Draft cleared", "Draft dihapus dari browser.");
}

function renderSummary(){
  els.summaryTitle.textContent = state.actionName ? state.actionName : "—";
  els.summaryMeta.textContent =
    `${mode} • ${state.sector || "—"} • ${state.prov || "—"} • ${state.period || "—"} • ${state._status}`;

  const rows = [
    ["Mode", mode],
    ["Nama Aksi", state.actionName],
    ["Status Implementasi", state.implStatus],
    ["Instansi", state.institution],
    ["Unit Pelaksana", state.implementingUnit],
    ["Lokasi", [state.prov, state.kab, state.kec, state.desa].filter(Boolean).join(" / ") || "—"],
    ["Sektor", state.sector],
    ["Tipologi", state.typology],
    ["Indikator", state.indicator],
    ["Satuan", state.unit],
    ["Baseline", state.baseline || "—"],
    ["Target", state.target || "—"],
    ["Realisasi", state.actual || "—"],
    ["Evidence", `${state.evidenceFiles.length} file` + (state.evidenceLink ? " + link" : "")],
    ["Readiness", `${state._readiness}%`],
    ["Last updated", state._updatedAt || "—"],
  ];

  const tb = els.summaryTable.querySelector("tbody");
  tb.innerHTML = rows.map(r => `<tr><td>${r[0]}</td><td>${escapeHtml(String(r[1] ?? ""))}</td></tr>`).join("");
}

function escapeHtml(s){
  return s.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
}

function exportDraft(){
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${storageKey()}_${(state.period||"draft").replace(/[^a-zA-Z0-9_-]/g,"")}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Exported", "Draft JSON berhasil diunduh.");
}

function submit(){
  // frontend-only: simulate submission
  const allOk = validateStep(1).ok && validateStep(2).ok && validateStep(3).ok &&
                validateStep(4).ok && validateStep(5).ok && validateStep(6).ok;
  if (!allOk){
    showToast("Cannot submit", "Masih ada item wajib belum lengkap.");
    return;
  }
  state._status = "SUBMITTED";
  markUpdated();
  autosave();
  updateReadiness();
  showToast("Submitted", "Tersimpan sebagai SUBMITTED (stub). Nanti masuk Inbox Review.");
}

function bindNav(){
  els.prevBtn.addEventListener("click", prev);
  els.nextBtn.addEventListener("click", next);
  els.backBtn.addEventListener("click", () => goToStep(6));
  els.submitBtn.addEventListener("click", submit);

  els.saveDraftBtn.addEventListener("click", () => {
    autosave();
    showToast("Saved", "Draft tersimpan di browser.");
  });
  els.exportDraftBtn.addEventListener("click", exportDraft);

  els.clearDraftBtn.addEventListener("click", clearDraft);

  els.modeH.addEventListener("click", () => { location.hash = "#horizontal"; location.reload(); });
  els.modeV.addEventListener("click", () => { location.hash = "#vertical"; location.reload(); });
}

function init(){
  initRefs();
  setModeFromHash();
  renderStepper();

  const loaded = loadDraft();
  bindInputs();
  renderFileList();
  updateReadiness();

  // if loaded, show small toast
  if (loaded) showToast("Loaded", "Draft sebelumnya dimuat dari browser.");

  bindNav();
  showStep(currentStep);
}

init();
