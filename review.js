// Review Inbox (frontend-only)
// - universal inbox for Horizontal & Vertical
// - filters + quick peek + full review checklist
// - stores audit logs in localStorage
// - ingests SUBMITTED drafts from input wizard localStorage keys:
//   - monev_draft_horizontal, monev_draft_vertical
//
// NOTE: since the wizard stores ONE draft per mode, this inbox will show:
//  - seeded mock items (multiple)
//  - plus any SUBMITTED draft from wizard (if present)

const els = {};
function qs(id){ return document.getElementById(id); }

function initRefs(){
  [
    "kpiTotal","kpiPending","kpiReturned","kpiApproved",
    "fSource","fStatus","fPeriod","fSector","fLocation","fText","resetFilters",
    "inboxTable","checkAll","batchApprove","batchReturn",
    "peekTitle","peekSub","peekMeta","peekLogs",
    "openFullReview","peekApprove","peekReturn",
    "reviewModal","modalTitle","modalStatusPill","closeModal",
    "checklist","reviewComment","btnApprove","btnReturn","btnReject",
    "modalDetails","modalLogs",
    "globalSearch","searchScope","searchBtn",
    "searchModal","searchTitle","searchBody","closeSearch",
    "langToggle"
  ].forEach(k => els[k] = qs(k));
}

function nowIso(){
  return new Date().toISOString();
}

function fmtDate(iso){
  if (!iso) return "—";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const da = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${da}`;
}

function escapeHtml(s){
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
}

function statusClass(st){
  const s = (st || "").toUpperCase();
  if (s === "PENDING") return "st-pending";
  if (s === "RETURNED") return "st-returned";
  if (s === "APPROVED") return "st-approved";
  return "st-submitted";
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

function addLog(recordId, action, notes){
  const logs = loadLogs();
  logs.unshift({
    id: cryptoRandomId(),
    recordId,
    at: nowIso(),
    actor: "Reviewer (stub)",
    action,
    notes: notes || ""
  });
  saveLogs(logs);
}

function getLogsFor(recordId, limit=6){
  return loadLogs().filter(l => l.recordId === recordId).slice(0, limit);
}

function cryptoRandomId(){
  // small stub ID
  return "L" + Math.random().toString(16).slice(2) + Date.now().toString(16);
}

// ---- Records ----
const seeded = [
  {
    id: "R-H-001",
    source: "HORIZONTAL",
    actionName: "Penguatan EWS Banjir DAS X",
    institution: "KLH",
    sector: "DRM",
    location: "Prov A",
    indicator: "IND-01",
    readiness: 82,
    period: "2026-S1",
    status: "PENDING",
    updatedAt: "2026-03-12T10:12:00Z",
    payload: { typology:"EWS", unit:"%", target:100, actual:75, evidence: "2 files" }
  },
  {
    id: "R-V-014",
    source: "VERTICAL",
    actionName: "Rehabilitasi Vegetasi Riparian",
    institution: "Prov B – OPD",
    sector: "Ecosystems",
    location: "Prov B",
    indicator: "IND-03",
    readiness: 68,
    period: "2026-S1",
    status: "RETURNED",
    updatedAt: "2026-03-11T08:40:00Z",
    payload: { typology:"EbA", unit:"ha", target:2000, actual:1450, evidence: "missing doc" }
  },
  {
    id: "R-H-032",
    source: "HORIZONTAL",
    actionName: "Peningkatan Akses Air Minum Aman",
    institution: "KemenPU",
    sector: "Water",
    location: "Prov C",
    indicator: "IND-07",
    readiness: 74,
    period: "2026-S1",
    status: "SUBMITTED",
    updatedAt: "2026-03-13T15:20:00Z",
    payload: { typology:"Infrastructure", unit:"%", target:40, actual:22, evidence: "1 link" }
  },
  {
    id: "R-V-020",
    source: "VERTICAL",
    actionName: "Penguatan Kapasitas Penyuluh Iklim",
    institution: "Kab B – OPD",
    sector: "Food",
    location: "Prov A",
    indicator: "IND-01",
    readiness: 90,
    period: "2026-S1",
    status: "APPROVED",
    updatedAt: "2026-03-10T09:00:00Z",
    payload: { typology:"Capacity", unit:"unit", target:50, actual:48, evidence: "3 files" }
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

      // create a deterministic id so it won't duplicate
      const id = `R-${d.source[0]}-DRAFT`;
      const existing = records.find(r => r.id === id);
      const readiness = Number(obj._readiness || 0);

      const rec = {
        id,
        source: d.source,
        actionName: obj.actionName || "(untitled)",
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
          evidence: `${(obj.evidenceFiles||[]).length} files` + (obj.evidenceLink ? " + link" : "")
        },
        _draftKey: d.key
      };

      if (!existing) records.unshift(rec);
      else Object.assign(existing, rec);

    }catch{ /* ignore */ }
  });

  return records;
}

let records = [];
let selectedId = null;

function initData(){
  // baseline: seeded + stored
  const stored = loadStoredRecords();
  // merge with seeded (avoid duplicates by id)
  const map = new Map();
  [...stored, ...seeded].forEach(r => map.set(r.id, r));
  records = Array.from(map.values());

  // ingest submitted drafts from wizard
  records = ingestSubmittedDrafts(records);

  // write back merged as stored (so decisions persist)
  saveStoredRecords(records);

  // seed some logs if none
  const logs = loadLogs();
  if (logs.length === 0){
    addLog("R-V-014", "RETURN", "Evidence belum lengkap (dokumen pendukung).");
    addLog("R-H-001", "COMMENT", "Cek konsistensi unit indikator sebelum approve.");
    addLog("R-V-020", "APPROVE", "Checklist lengkap, evidence valid.");
  }
}

function applyFilters(all){
  const src = els.fSource.value;
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

function renderTable(rows){
  const tbody = els.inboxTable.querySelector("tbody");
  tbody.innerHTML = rows.map(r => {
    const st = (r.status || "SUBMITTED").toUpperCase();
    return `
      <tr data-id="${r.id}">
        <td><input type="checkbox" class="rowCheck" data-id="${r.id}" /></td>
        <td>${r.source}</td>
        <td><b>${escapeHtml(r.actionName)}</b></td>
        <td>${escapeHtml(r.institution)}</td>
        <td>${escapeHtml(r.sector)}</td>
        <td>${escapeHtml(r.location)}</td>
        <td>${escapeHtml(r.indicator)}</td>
        <td>${renderReadinessPill(r.readiness)}</td>
        <td><span class="status ${statusClass(st)}">${st}</span></td>
        <td>${fmtDate(r.updatedAt)}</td>
      </tr>
    `;
  }).join("");

  // row click (ignore checkbox)
  tbody.querySelectorAll("tr").forEach(tr => {
    tr.addEventListener("click", (e) => {
      if (e.target && e.target.matches("input[type=checkbox]")) return;
      const id = tr.getAttribute("data-id");
      selectRecord(id);
    });
  });
}

function renderReadinessPill(r){
  const n = Number(r || 0);
  const cls = n >= 80 ? "good" : (n >= 60 ? "warn" : "bad");
  return `<span class="pill ${cls}">${n}%</span>`;
}

function selectRecord(id){
  selectedId = id;
  const rec = records.find(r => r.id === id);
  if (!rec) return;

  els.peekTitle.textContent = rec.actionName || "Quick Peek";
  els.peekSub.textContent = `${rec.source} • ${rec.period} • ${rec.institution}`;
  els.peekMeta.innerHTML = [
    kv("Status", `<span class="status ${statusClass(rec.status)}">${rec.status}</span>`),
    kv("Sector", escapeHtml(rec.sector)),
    kv("Location", escapeHtml(rec.location)),
    kv("Indicator", escapeHtml(rec.indicator)),
    kv("Readiness", `${rec.readiness}%`),
    kv("Updated", fmtDate(rec.updatedAt)),
  ].join("");

  renderPeekLogs(rec.id);

  const enable = true;
  els.openFullReview.disabled = !enable;
  els.peekApprove.disabled = !enable;
  els.peekReturn.disabled = !enable;
}

function kv(k, v){
  return `<div class="kv"><div class="k">${k}</div><div class="v">${v}</div></div>`;
}

function renderPeekLogs(recordId){
  const logs = getLogsFor(recordId, 5);
  const ul = els.peekLogs;
  if (logs.length === 0){
    ul.innerHTML = `<li class="muted">No logs.</li>`;
    return;
  }
  ul.innerHTML = logs.map(l => `<li><b>${l.action}</b> • ${fmtDate(l.at)}<br><span class="muted">${escapeHtml(l.notes || "")}</span></li>`).join("");
}

function openModal(){
  const rec = records.find(r => r.id === selectedId);
  if (!rec) return;
  els.modalTitle.textContent = `Full Review — ${rec.actionName}`;
  els.modalStatusPill.className = `pill ${rec.readiness >= 80 ? "good" : rec.readiness >= 60 ? "warn" : "bad"}`;
  els.modalStatusPill.textContent = `Status: ${rec.status} • Readiness: ${rec.readiness}%`;

  // checklist template (ETF-ready quality gates)
  const items = [
    { id:"c1", label:"Identitas aksi jelas (nama, instansi, status implementasi)" },
    { id:"c2", label:"Lokasi & cakupan memadai untuk agregasi (minimal provinsi)" },
    { id:"c3", label:"Sektor & tipologi konsisten dengan registry MPC" },
    { id:"c4", label:"Indikator & satuan konsisten (unit match)" },
    { id:"c5", label:"Nilai target periode terisi & valid (angka)" },
    { id:"c6", label:"Evidence memadai (file/link + deskripsi)" },
  ];

  // default: if approved earlier, check all; else check based on readiness
  const defaultChecked = rec.status === "APPROVED" ? true : (rec.readiness >= 80);

  els.checklist.innerHTML = items.map(it => `
    <label class="check">
      <input type="checkbox" data-check="${it.id}" ${defaultChecked ? "checked" : ""}/>
      <div>
        <div style="font-weight:900">${escapeHtml(it.label)}</div>
        <div class="muted small">Checklist QA/QC gate</div>
      </div>
    </label>
  `).join("");

  // details
  els.modalDetails.innerHTML = `
    <div class="kv"><div class="k">Record ID</div><div class="v">${rec.id}</div></div>
    <div class="kv"><div class="k">Source</div><div class="v">${rec.source}</div></div>
    <div class="kv"><div class="k">Period</div><div class="v">${rec.period}</div></div>
    <div class="kv"><div class="k">Institution</div><div class="v">${escapeHtml(rec.institution)}</div></div>
    <div class="kv"><div class="k">Sector</div><div class="v">${escapeHtml(rec.sector)}</div></div>
    <div class="kv"><div class="k">Location</div><div class="v">${escapeHtml(rec.location)}</div></div>
    <div class="kv"><div class="k">Indicator</div><div class="v">${escapeHtml(rec.indicator)}</div></div>
    <div class="kv"><div class="k">Typology</div><div class="v">${escapeHtml(rec.payload?.typology || "—")}</div></div>
    <div class="kv"><div class="k">Unit</div><div class="v">${escapeHtml(rec.payload?.unit || "—")}</div></div>
    <div class="kv"><div class="k">Target</div><div class="v">${escapeHtml(rec.payload?.target || "—")}</div></div>
    <div class="kv"><div class="k">Actual</div><div class="v">${escapeHtml(rec.payload?.actual || "—")}</div></div>
    <div class="kv"><div class="k">Evidence</div><div class="v">${escapeHtml(rec.payload?.evidence || "—")}</div></div>
  `;

  // logs
  const logs = getLogsFor(rec.id, 10);
  els.modalLogs.innerHTML = logs.length
    ? logs.map(l => `<li><b>${l.action}</b> • ${fmtDate(l.at)}<br><span class="muted">${escapeHtml(l.notes||"")}</span></li>`).join("")
    : `<li class="muted">No logs.</li>`;

  // clear comment box
  els.reviewComment.value = "";

  modal("reviewModal", true);
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

function decision(dec){
  const rec = records.find(r => r.id === selectedId);
  if (!rec) return;

  const { checked, total } = checklistScore();
  const comment = (els.reviewComment.value || "").trim();

  if (dec === "RETURN" && comment.length < 5){
    alert("Komentar wajib untuk RETURN (minimal 5 karakter).");
    return;
  }

  if (dec === "APPROVE" && checked < total){
    // allow approve but warn
    const ok = confirm("Checklist belum lengkap. Tetap approve?");
    if (!ok) return;
  }

  rec.status = dec === "APPROVE" ? "APPROVED" : (dec === "RETURN" ? "RETURNED" : "REJECTED");
  rec.updatedAt = nowIso();

  // persist
  saveStoredRecords(records);

  // audit log
  addLog(rec.id, dec, comment || `Checklist ${checked}/${total}`);

  // update UI
  refresh();
  selectRecord(rec.id);

  modal("reviewModal", false);
}

function batchAction(dec){
  const ids = getSelectedRowIds();
  if (ids.length === 0) return alert("Tidak ada item dipilih.");

  let note = "";
  if (dec === "RETURN"){
    note = prompt("Catatan batch RETURN (wajib):", "Mohon lengkapi evidence / koreksi indikator-unit / perbaiki lokasi.");
    if (!note || note.trim().length < 5) return;
  }

  ids.forEach(id => {
    const rec = records.find(r => r.id === id);
    if (!rec) return;
    rec.status = dec === "APPROVE" ? "APPROVED" : "RETURNED";
    rec.updatedAt = nowIso();
    addLog(rec.id, dec, note || "Batch action");
  });

  saveStoredRecords(records);
  refresh();
}

function getSelectedRowIds(){
  return Array.from(document.querySelectorAll(".rowCheck"))
    .filter(c => c.checked)
    .map(c => c.getAttribute("data-id"));
}

function bindEvents(){
  // filters
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

  // select all
  els.checkAll.addEventListener("change", () => {
    const on = els.checkAll.checked;
    document.querySelectorAll(".rowCheck").forEach(c => c.checked = on);
  });

  // quick peek actions
  els.openFullReview.addEventListener("click", openModal);
  els.peekApprove.addEventListener("click", () => {
    if (!selectedId) return;
    if (!confirm("Approve record ini?")) return;
    decision("APPROVE");
  });
  els.peekReturn.addEventListener("click", () => {
    if (!selectedId) return;
    modal("reviewModal", true);
    openModal();
    // focus comment
    setTimeout(()=>els.reviewComment.focus(), 100);
  });

  // modal
  els.closeModal.addEventListener("click", () => modal("reviewModal", false));
  els.btnApprove.addEventListener("click", () => decision("APPROVE"));
  els.btnReturn.addEventListener("click", () => decision("RETURN"));
  els.btnReject.addEventListener("click", () => decision("REJECT"));

  // batch
  els.batchApprove.addEventListener("click", () => batchAction("APPROVE"));
  els.batchReturn.addEventListener("click", () => batchAction("RETURN"));

  // simple global search (mock)
  els.searchBtn.addEventListener("click", runSearch);
  els.globalSearch.addEventListener("keydown", (e) => { if (e.key === "Enter") runSearch(); });
  els.closeSearch.addEventListener("click", () => modal("searchModal", false));

  // language toggle (stub label only)
  els.langToggle.addEventListener("click", () => {
    els.langToggle.textContent = (els.langToggle.textContent === "ID") ? "EN" : "ID";
  });
}

function runSearch(){
  const q = (els.globalSearch.value || "").trim();
  if (!q) return;
  const scope = els.searchScope.value;

  const res = [];
  const lower = q.toLowerCase();
  const hits = records.filter(r => (`${r.actionName} ${r.institution} ${r.location} ${r.indicator}`.toLowerCase()).includes(lower));

  if (scope === "all" || scope === "actions"){
    res.push(section("Actions", hits.map(h => h.actionName)));
  }
  if (scope === "all" || scope === "institutions"){
    res.push(section("Institutions", Array.from(new Set(hits.map(h => h.institution))).filter(Boolean)));
  }
  if (scope === "all" || scope === "locations"){
    res.push(section("Locations", Array.from(new Set(hits.map(h => h.location))).filter(Boolean)));
  }
  if (scope === "all" || scope === "indicators"){
    res.push(section("Indicators", Array.from(new Set(hits.map(h => h.indicator))).filter(Boolean)));
  }
  if (scope === "all" || scope === "help"){
    res.push(section("Help", lower.includes("evidence") ? ["Evidence checklist & acceptable proofs"] : []));
  }

  els.searchTitle.textContent = `Search Results: "${q}"`;
  els.searchBody.innerHTML = res.join("") || `<div class="muted">No results.</div>`;
  modal("searchModal", true);
}

function section(title, items){
  const arr = items.filter(Boolean);
  return `
    <div style="margin-bottom:12px">
      <div style="font-weight:900; margin-bottom:6px">${title} (${arr.length})</div>
      ${arr.length ? `<ul>${arr.map(i => `<li>${escapeHtml(i)}</li>`).join("")}</ul>` : `<div class="muted">No results</div>`}
    </div>
  `;
}



function refresh(){
  // reload persisted records (so state stays consistent if changed elsewhere)
  records = ingestSubmittedDrafts(loadStoredRecords().length ? loadStoredRecords() : records);
  // compute kpis over all records (unfiltered)
  kpis(records);

  // apply filters and render
  const filtered = applyFilters(records);
  renderTable(filtered);

  // keep checkAll consistent
  els.checkAll.checked = false;
}

function init(){
  initRefs();
  initData();
  bindEvents();
  refresh();

  // auto-select first filtered record
  const firstRow = els.inboxTable.querySelector("tbody tr");
  if (firstRow){
    const id = firstRow.getAttribute("data-id");
    selectRecord(id);
  }
}

init();
