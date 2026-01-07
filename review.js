// Kotak Masuk Review (frontend-only)
// - kotak masuk universal untuk Sektoral (HORIZONTAL) & Kewilayahan (VERTICAL)
// - filter + ringkasan cepat + checklist tinjau lengkap
// - jejak audit disimpan di localStorage
// - ingest draft DIKIRIM (SUBMITTED) dari wizard (localStorage):
//   - monev_draft_horizontal, monev_draft_vertical
//
// CATATAN: wizard menyimpan 1 draft per mode, kotak masuk ini menampilkan:
//  - item contoh (beberapa)
//  - + draft DIKIRIM dari wizard (jika ada)

const els = {};
function qs(id){ return document.getElementById(id); }

function initRefs(){
  [
    // sidebar
    "burgerBtn","sidebar","sidebarOverlay",

    // KPI & filter
    "kpiTotal","kpiPending","kpiReturned","kpiApproved",
    "fSource","fStatus","fPeriod","fSector","fLocation","fText","resetFilters",

    // tabel
    "inboxTable","checkAll","batchApprove","batchReturn",

    // ringkasan cepat
    "peekTitle","peekSub","peekMeta","peekLogs",
    "openFullReview","peekApprove","peekReturn",

    // modal review
    "reviewModal","modalTitle","modalStatusPill","closeModal",
    "checklist","reviewComment","btnApprove","btnReturn","btnReject",
    "modalDetails","modalLogs",

    // pencarian global
    "globalSearch","searchScope","searchBtn",
    "searchModal","searchTitle","searchBody","closeSearch",

    // lainnya
    "langToggle"
  ].forEach(k => els[k] = qs(k));
}

function nowIso(){ return new Date().toISOString(); }

function fmtDate(iso){
  if (!iso) return "—";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const da = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${da}`;
}

function escapeHtml(s){
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function statusClass(st){
  const s = (st || "").toUpperCase();
  if (s === "PENDING") return "st-pending";
  if (s === "RETURNED") return "st-returned";
  if (s === "APPROVED") return "st-approved";
  return "st-submitted";
}

// Label sumber untuk tampilan (UI) — tanpa menampilkan HORIZONTAL/VERTICAL
function labelSource(src){
  const s = (src || "").toUpperCase();
  if (s === "HORIZONTAL") return "Sektoral";
  if (s === "VERTICAL") return "Kewilayahan";
  return s || "—";
}

// Label status untuk tampilan (UI)
function labelStatus(st){
  const s = (st || "SUBMITTED").toUpperCase();
  if (s === "SUBMITTED") return "DIKIRIM";
  if (s === "PENDING") return "MENUNGGU";
  if (s === "RETURNED") return "DIKEMBALIKAN";
  if (s === "APPROVED") return "DISETUJUI";
  if (s === "REJECTED") return "DITOLAK";
  return s;
}

// Label aksi log untuk tampilan (UI)
function labelAction(act){
  const a = (act || "").toUpperCase();
  if (a === "APPROVE") return "SETUJUI";
  if (a === "RETURN") return "KEMBALIKAN";
  if (a === "REJECT") return "TOLAK";
  if (a === "COMMENT") return "KOMENTAR";
  return a || "—";
}

function storageLogsKey(){ return "monev_review_logs"; }
function storageRecordsKey(){ return "monev_records"; }

function loadLogs(){
  try{ return JSON.parse(localStorage.getItem(storageLogsKey()) || "[]"); }
  catch{ return []; }
}

function saveLogs(logs){
  localStorage.setItem(storageLogsKey(), JSON.stringify(logs));
}

function cryptoRandomId(){
  return "L" + Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function addLog(recordId, action, notes){
  const logs = loadLogs();
  logs.unshift({
    id: cryptoRandomId(),
    recordId,
    at: nowIso(),
    actor: "Penelaah (stub)",
    action, // simpan kode (APPROVE/RETURN/REJECT/COMMENT)
    notes: notes || ""
  });
  saveLogs(logs);
}

function getLogsFor(recordId, limit=6){
  return loadLogs().filter(l => l.recordId === recordId).slice(0, limit);
}

// ---- Data contoh ----
const seeded = [
  {
    id: "R-H-001",
    source: "HORIZONTAL",
    actionName: "Penguatan EWS Banjir DAS X",
    institution: "KLH",
    sector: "Kebencanaan",
    location: "Prov A",
    indicator: "IND-01",
    readiness: 82,
    period: "2026-S1",
    status: "PENDING",
    updatedAt: "2026-03-12T10:12:00Z",
    payload: { typology:"EWS", unit:"%", target:100, actual:75, evidence: "2 berkas" }
  },
  {
    id: "R-V-014",
    source: "VERTICAL",
    actionName: "Rehabilitasi Vegetasi Riparian",
    institution: "Prov B – OPD",
    sector: "Ekosistem",
    location: "Prov B",
    indicator: "IND-03",
    readiness: 68,
    period: "2026-S1",
    status: "RETURNED",
    updatedAt: "2026-03-11T08:40:00Z",
    payload: { typology:"EbA", unit:"ha", target:2000, actual:1450, evidence: "dokumen kurang" }
  },
  {
    id: "R-H-032",
    source: "HORIZONTAL",
    actionName: "Peningkatan Akses Air Minum Aman",
    institution: "KemenPU",
    sector: "Air",
    location: "Prov C",
    indicator: "IND-07",
    readiness: 74,
    period: "2026-S1",
    status: "SUBMITTED",
    updatedAt: "2026-03-13T15:20:00Z",
    payload: { typology:"Infrastruktur", unit:"%", target:40, actual:22, evidence: "1 tautan" }
  },
  {
    id: "R-V-020",
    source: "VERTICAL",
    actionName: "Penguatan Kapasitas Penyuluh Iklim",
    institution: "Kab B – OPD",
    sector: "Pangan",
    location: "Prov A",
    indicator: "IND-01",
    readiness: 90,
    period: "2026-S1",
    status: "APPROVED",
    updatedAt: "2026-03-10T09:00:00Z",
    payload: { typology:"Kapasitas", unit:"unit", target:50, actual:48, evidence: "3 berkas" }
  }
];

function loadStoredRecords(){
  try{ return JSON.parse(localStorage.getItem(storageRecordsKey()) || "[]"); }
  catch{ return []; }
}

function saveStoredRecords(records){
  localStorage.setItem(storageRecordsKey(), JSON.stringify(records));
}

function ingestSubmittedDrafts(records){
  const drafts = [
    { key: "monev_draft_horizontal", source: "HORIZONTAL" },
    { key: "monev_draft_vertical", source: "VERTICAL" },
  ];

  drafts.forEach(d => {
    const raw = localStorage.getItem(d.key);
    if (!raw) return;

    try{
      const obj = JSON.parse(raw);
      if ((obj._status || "").toUpperCase() !== "SUBMITTED") return;

      const id = `R-${d.source[0]}-DRAFT`; // deterministic
      const existing = records.find(r => r.id === id);
      const readiness = Number(obj._readiness || 0);

      const rec = {
        id,
        source: d.source,
        actionName: obj.actionName || "(tanpa judul)",
        institution: obj.institution || "—",
        sector: obj.sector || "—",
        location: obj.prov || "—",
        indicator: obj.indicator || "—",
        readiness,
        period: obj.period || "—",
        status: "SUBMITTED",
        updatedAt: obj._updatedAt || nowIso(),
        payload: {
          typology: obj.typology || "—",
          unit: obj.unit || "—",
          baseline: obj.baseline || "—",
          target: obj.target || "—",
          actual: obj.actual || "—",
          evidence: `${(obj.evidenceFiles||[]).length} berkas` + (obj.evidenceLink ? " + tautan" : "")
        },
        _draftKey: d.key
      };

      if (!existing) records.unshift(rec);
      else Object.assign(existing, rec);

    }catch{
      /* abaikan */
    }
  });

  return records;
}

let records = [];
let selectedId = null;

function initData(){
  const stored = loadStoredRecords();

  // merge stored + seeded (hindari duplikasi id)
  const map = new Map();
  [...stored, ...seeded].forEach(r => map.set(r.id, r));
  records = Array.from(map.values());

  // ingest draft dari wizard
  records = ingestSubmittedDrafts(records);

  // simpan agar keputusan persist
  saveStoredRecords(records);

  // seed logs jika kosong
  const logs = loadLogs();
  if (logs.length === 0){
    addLog("R-V-014", "RETURN", "Bukti/evidence belum lengkap (dokumen pendukung).");
    addLog("R-H-001", "COMMENT", "Cek konsistensi satuan indikator sebelum disetujui.");
    addLog("R-V-020", "APPROVE", "Checklist lengkap, bukti valid.");
  }
}

function applyFilters(all){
  const src = els.fSource.value;   // tetap pakai HORIZONTAL/VERTICAL (nilai internal)
  const st = els.fStatus.value;
  const pr = els.fPeriod.value;
  const sc = els.fSector.value;
  const lc = els.fLocation.value;
  const q = (els.fText.value || "").trim().toLowerCase();

  return all.filter(r => {
    if (src && r.source !== src) return false;
    if (st && (r.status || "").toUpperCase() !== st) return false;
    if (pr && r.period !== pr) return false;
    if (sc && r.sector !== sc) return false;
    if (lc && r.location !== lc) return false;
    if (q){
      const hay = `${r.actionName} ${r.institution} ${r.indicator}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }).sort((a,b) => (b.updatedAt||"").localeCompare(a.updatedAt||""));
}

function kpis(all){
  const total = all.length;
  const pending = all.filter(r => r.status === "PENDING").length;
  const returned = all.filter(r => r.status === "RETURNED").length;
  const approved = all.filter(r => r.status === "APPROVED").length;

  els.kpiTotal.textContent = String(total);
  els.kpiPending.textContent = String(pending);
  els.kpiReturned.textContent = String(returned);
  els.kpiApproved.textContent = String(approved);
}

function renderReadinessPill(r){
  const n = Number(r || 0);
  const cls = n >= 80 ? "good" : (n >= 60 ? "warn" : "bad");
  return `<span class="pill ${cls}">${n}%</span>`;
}

function renderTable(rows){
  const tbody = els.inboxTable.querySelector("tbody");
  tbody.innerHTML = rows.map(r => {
    const st = (r.status || "SUBMITTED").toUpperCase();
    return `
      <tr data-id="${r.id}">
        <td><input type="checkbox" class="rowCheck" data-id="${r.id}" /></td>
        <td>${escapeHtml(labelSource(r.source))}</td>
        <td><b>${escapeHtml(r.actionName)}</b></td>
        <td>${escapeHtml(r.institution)}</td>
        <td>${escapeHtml(r.sector)}</td>
        <td>${escapeHtml(r.location)}</td>
        <td>${escapeHtml(r.indicator)}</td>
        <td>${renderReadinessPill(r.readiness)}</td>
        <td><span class="status ${statusClass(st)}">${labelStatus(st)}</span></td>
        <td>${fmtDate(r.updatedAt)}</td>
      </tr>
    `;
  }).join("");

  // klik baris (abaikan checkbox)
  tbody.querySelectorAll("tr").forEach(tr => {
    tr.addEventListener("click", (e) => {
      if (e.target && e.target.matches("input[type=checkbox]")) return;
      const id = tr.getAttribute("data-id");
      selectRecord(id);
    });
  });
}

function kv(k, v){
  return `<div class="kv"><div class="k">${k}</div><div class="v">${v}</div></div>`;
}

function renderPeekLogs(recordId){
  const logs = getLogsFor(recordId, 5);
  const ul = els.peekLogs;
  if (logs.length === 0){
    ul.innerHTML = `<li class="muted">Belum ada log.</li>`;
    return;
  }
  ul.innerHTML = logs.map(l =>
    `<li><b>${labelAction(l.action)}</b> • ${fmtDate(l.at)}<br><span class="muted">${escapeHtml(l.notes || "")}</span></li>`
  ).join("");
}

function selectRecord(id){
  selectedId = id;
  const rec = records.find(r => r.id === id);
  if (!rec) return;

  els.peekTitle.textContent = rec.actionName || "Ringkasan Cepat";
  els.peekSub.textContent = `${labelSource(rec.source)} • ${rec.period} • ${rec.institution}`;

  els.peekMeta.innerHTML = [
    kv("Sumber", escapeHtml(labelSource(rec.source))),
    kv("Status", `<span class="status ${statusClass(rec.status)}">${labelStatus(rec.status)}</span>`),
    kv("Sektor", escapeHtml(rec.sector)),
    kv("Lokasi", escapeHtml(rec.location)),
    kv("Indikator", escapeHtml(rec.indicator)),
    kv("Kesiapan", `${rec.readiness}%`),
    kv("Pembaruan", fmtDate(rec.updatedAt)),
  ].join("");

  renderPeekLogs(rec.id);

  els.openFullReview.disabled = false;
  els.peekApprove.disabled = false;
  els.peekReturn.disabled = false;
}

function modal(id, show){
  qs(id).classList.toggle("hidden", !show);
}

function checklistScore(){
  const checks = Array.from(document.querySelectorAll("#checklist input[type=checkbox]"));
  const total = checks.length || 1;
  const checked = checks.filter(c => c.checked).length;
  return { checked, total };
}

function openModal(){
  const rec = records.find(r => r.id === selectedId);
  if (!rec) return;

  els.modalTitle.textContent = `Tinjau Lengkap — ${rec.actionName}`;
  els.modalStatusPill.className = `pill ${rec.readiness >= 80 ? "good" : rec.readiness >= 60 ? "warn" : "bad"}`;
  els.modalStatusPill.textContent = `Status: ${labelStatus(rec.status)} • Kesiapan: ${rec.readiness}%`;

  // checklist (gerbang QA/QC)
  const items = [
    { id:"c1", label:"Identitas aksi jelas (nama, instansi, status implementasi)" },
    { id:"c2", label:"Lokasi & cakupan memadai untuk agregasi (minimal provinsi)" },
    { id:"c3", label:"Sektor & tipologi konsisten dengan registri MPC" },
    { id:"c4", label:"Indikator & satuan konsisten (satuan sesuai)" },
    { id:"c5", label:"Nilai target & periode terisi serta valid" },
    { id:"c6", label:"Bukti/evidence memadai (berkas/tautan + deskripsi)" },
  ];

  const defaultChecked = rec.status === "APPROVED" ? true : (rec.readiness >= 80);

  els.checklist.innerHTML = items.map(it => `
    <label class="check">
      <input type="checkbox" data-check="${it.id}" ${defaultChecked ? "checked" : ""}/>
      <div>
        <div style="font-weight:900">${escapeHtml(it.label)}</div>
        <div class="muted small">Gerbang pemeriksaan QA/QC</div>
      </div>
    </label>
  `).join("");

  // detail record
  els.modalDetails.innerHTML = `
    <div class="kv"><div class="k">ID Record</div><div class="v">${rec.id}</div></div>
    <div class="kv"><div class="k">Sumber</div><div class="v">${escapeHtml(labelSource(rec.source))}</div></div>
    <div class="kv"><div class="k">Periode</div><div class="v">${escapeHtml(rec.period)}</div></div>
    <div class="kv"><div class="k">Instansi</div><div class="v">${escapeHtml(rec.institution)}</div></div>
    <div class="kv"><div class="k">Sektor</div><div class="v">${escapeHtml(rec.sector)}</div></div>
    <div class="kv"><div class="k">Lokasi</div><div class="v">${escapeHtml(rec.location)}</div></div>
    <div class="kv"><div class="k">Indikator</div><div class="v">${escapeHtml(rec.indicator)}</div></div>
    <div class="kv"><div class="k">Tipologi</div><div class="v">${escapeHtml(rec.payload?.typology || "—")}</div></div>
    <div class="kv"><div class="k">Satuan</div><div class="v">${escapeHtml(rec.payload?.unit || "—")}</div></div>
    <div class="kv"><div class="k">Target</div><div class="v">${escapeHtml(rec.payload?.target || "—")}</div></div>
    <div class="kv"><div class="k">Realisasi</div><div class="v">${escapeHtml(rec.payload?.actual || "—")}</div></div>
    <div class="kv"><div class="k">Bukti</div><div class="v">${escapeHtml(rec.payload?.evidence || "—")}</div></div>
  `;

  // log record
  const logs = getLogsFor(rec.id, 10);
  els.modalLogs.innerHTML = logs.length
    ? logs.map(l => `<li><b>${labelAction(l.action)}</b> • ${fmtDate(l.at)}<br><span class="muted">${escapeHtml(l.notes||"")}</span></li>`).join("")
    : `<li class="muted">Belum ada log.</li>`;

  els.reviewComment.value = "";
  modal("reviewModal", true);
}

function decision(dec){
  const rec = records.find(r => r.id === selectedId);
  if (!rec) return;

  const { checked, total } = checklistScore();
  const comment = (els.reviewComment.value || "").trim();

  if (dec === "RETURN" && comment.length < 5){
    alert("Komentar wajib untuk KEMBALIKAN (minimal 5 karakter).");
    return;
  }

  if (dec === "APPROVE" && checked < total){
    const ok = confirm("Checklist belum lengkap. Tetap setujui?");
    if (!ok) return;
  }

  rec.status = (dec === "APPROVE") ? "APPROVED"
            : (dec === "RETURN")  ? "RETURNED"
            : "REJECTED";
  rec.updatedAt = nowIso();

  saveStoredRecords(records);

  // jejak audit (simpan kode aksi)
  addLog(rec.id, dec, comment || `Checklist ${checked}/${total}`);

  refresh();
  selectRecord(rec.id);
  modal("reviewModal", false);
}

function getSelectedRowIds(){
  return Array.from(document.querySelectorAll(".rowCheck"))
    .filter(c => c.checked)
    .map(c => c.getAttribute("data-id"));
}

function batchAction(dec){
  const ids = getSelectedRowIds();
  if (ids.length === 0) return alert("Tidak ada item yang dipilih.");

  let note = "";
  if (dec === "RETURN"){
    note = prompt(
      "Catatan batch KEMBALIKAN (wajib):",
      "Mohon lengkapi bukti/evidence / koreksi indikator-satuan / perbaiki lokasi."
    );
    if (!note || note.trim().length < 5) return;
  }

  ids.forEach(id => {
    const rec = records.find(r => r.id === id);
    if (!rec) return;
    rec.status = (dec === "APPROVE") ? "APPROVED" : "RETURNED";
    rec.updatedAt = nowIso();
    addLog(rec.id, dec, note || "Aksi batch");
  });

  saveStoredRecords(records);
  refresh();
}

function section(title, items){
  const arr = items.filter(Boolean);
  return `
    <div style="margin-bottom:12px">
      <div style="font-weight:900; margin-bottom:6px">${title} (${arr.length})</div>
      ${arr.length ? `<ul>${arr.map(i => `<li>${escapeHtml(i)}</li>`).join("")}</ul>` : `<div class="muted">Tidak ada hasil</div>`}
    </div>
  `;
}

function runSearch(){
  const q = (els.globalSearch.value || "").trim();
  if (!q) return;

  const scope = els.searchScope.value; // nilai masih "actions/institutions/..." (internal)
  const res = [];
  const lower = q.toLowerCase();

  const hits = records.filter(r =>
    (`${r.actionName} ${r.institution} ${r.location} ${r.indicator}`.toLowerCase()).includes(lower)
  );

  if (scope === "all" || scope === "actions"){
    res.push(section("Aksi", hits.map(h => h.actionName)));
  }
  if (scope === "all" || scope === "institutions"){
    res.push(section("Instansi", Array.from(new Set(hits.map(h => h.institution))).filter(Boolean)));
  }
  if (scope === "all" || scope === "locations"){
    res.push(section("Lokasi", Array.from(new Set(hits.map(h => h.location))).filter(Boolean)));
  }
  if (scope === "all" || scope === "indicators"){
    res.push(section("Indikator", Array.from(new Set(hits.map(h => h.indicator))).filter(Boolean)));
  }
  if (scope === "all" || scope === "help"){
    res.push(section("Bantuan", lower.includes("bukti") || lower.includes("evidence")
      ? ["Checklist bukti & contoh dokumen pendukung"]
      : []
    ));
  }

  els.searchTitle.textContent = `Hasil Pencarian: "${q}"`;
  els.searchBody.innerHTML = res.join("") || `<div class="muted">Tidak ada hasil.</div>`;
  modal("searchModal", true);
}

// ===========================
// Perilaku Sidebar (desktop + drawer mobile)
// ===========================
function sidebarBehavior(){
  const btn = els.burgerBtn;
  const sidebar = els.sidebar;
  const overlay = els.sidebarOverlay;
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

  const toggleDesktop = () => {
    const willClose = !document.body.classList.contains("sidebar-closed");
    document.body.classList.toggle("sidebar-closed", willClose);

    if (willClose) closeMobileDrawer();

    localStorage.setItem("sidebar_state", willClose ? "closed" : "open");
    setAria();
  };

  btn.addEventListener("click", () => {
    if (isMobile()){
      const isClosed = document.body.classList.contains("sidebar-closed");
      if (isClosed){
        document.body.classList.remove("sidebar-closed");
        localStorage.setItem("sidebar_state", "open");
      }
      document.body.classList.add("sidebar-open");
      setAria();
      return;
    }
    toggleDesktop();
  });

  overlay.addEventListener("click", closeMobileDrawer);

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

function refresh(){
  const stored = loadStoredRecords();
  const base = stored.length ? stored : records;
  records = ingestSubmittedDrafts(base);

  // KPI semua record (tanpa filter)
  kpis(records);

  // apply filter dan render
  const filtered = applyFilters(records);
  renderTable(filtered);

  els.checkAll.checked = false;
}

function bindEvents(){
  // filter
  ["fSource","fStatus","fPeriod","fSector","fLocation","fText"].forEach(id => {
    els[id].addEventListener("input", refresh);
    els[id].addEventListener("change", refresh);
  });

  els.resetFilters.addEventListener("click", () => {
    els.fSource.value = "";
    els.fStatus.value = "";
    els.fPeriod.value = "";
    els.fSector.value = "";
    els.fLocation.value = "";
    els.fText.value = "";
    refresh();
  });

  // pilih semua
  els.checkAll.addEventListener("change", () => {
    const on = els.checkAll.checked;
    document.querySelectorAll(".rowCheck").forEach(c => c.checked = on);
  });

  // ringkasan cepat
  els.openFullReview.addEventListener("click", openModal);

  els.peekApprove.addEventListener("click", () => {
    if (!selectedId) return;
    if (!confirm("Setujui record ini?")) return;
    decision("APPROVE");
  });

  els.peekReturn.addEventListener("click", () => {
    if (!selectedId) return;
    openModal();
    setTimeout(()=>els.reviewComment.focus(), 80);
  });

  // modal
  els.closeModal.addEventListener("click", () => modal("reviewModal", false));
  els.btnApprove.addEventListener("click", () => decision("APPROVE"));
  els.btnReturn.addEventListener("click", () => decision("RETURN"));
  els.btnReject.addEventListener("click", () => decision("REJECT"));

  // batch
  els.batchApprove.addEventListener("click", () => batchAction("APPROVE"));
  els.batchReturn.addEventListener("click", () => batchAction("RETURN"));

  // pencarian global (tiruan)
  els.searchBtn.addEventListener("click", runSearch);
  els.globalSearch.addEventListener("keydown", (e) => { if (e.key === "Enter") runSearch(); });
  els.closeSearch.addEventListener("click", () => modal("searchModal", false));

  // toggle bahasa (stub)
  els.langToggle.addEventListener("click", () => {
    els.langToggle.textContent = (els.langToggle.textContent === "ID") ? "EN" : "ID";
  });
}

function init(){
  initRefs();
  initData();
  bindEvents();
  sidebarBehavior();
  refresh();

  // auto-select record pertama
  const firstRow = els.inboxTable.querySelector("tbody tr");
  if (firstRow){
    const id = firstRow.getAttribute("data-id");
    selectRecord(id);
  }
}

init();
