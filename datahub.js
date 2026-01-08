// Portal Data UI (frontend-only)
//
// Fitur:
// - Panel Integrasi (stub konektor dengan status/log)
// - Asisten Impor Data: parse CSV/JSON + validasi kolom wajib + buat batch impor -> masuk ke Kotak Masuk Tinjau (localStorage)
// - Studio Pemetaan: simpan aturan pemetaan di localStorage
// - Mode Keandalan: konfigurasi + log simulasi kegagalan
//
// Kunci LocalStorage yang dipakai:
// - datahub_connectors
// - datahub_mappings
// - datahub_reliability
// - upload_batches
// - review_inbox (antrian stub untuk modul Verifikasi & Validasi)

const $ = (id) => document.getElementById(id);

const els = {
  // top
  hubState: $("hubState"),
  refreshBtn: $("refreshBtn"),
  openAuditBtn: $("openAuditBtn"),

  // KPIs
  kConn: $("kConn"),
  kMap: $("kMap"),
  kBatch: $("kBatch"),

  // tabs
  tabs: Array.from(document.querySelectorAll(".tab")),
  tabIntegrations: $("tab-integrations"),
  tabUpload: $("tab-upload"),
  tabMapping: $("tab-mapping"),
  tabReliability: $("tab-reliability"),

  // global search
  globalSearch: $("globalSearch"),
  searchScope: $("searchScope"),
  searchBtn: $("searchBtn"),
  searchModal: $("searchModal"),
  searchTitle: $("searchTitle"),
  searchBody: $("searchBody"),
  closeSearch: $("closeSearch"),

  // integrations
  connectorsGrid: $("connectorsGrid"),
  connectorSelect: $("connectorSelect"),
  connBaseUrl: $("connBaseUrl"),
  connAuthMode: $("connAuthMode"),
  saveConnBtn: $("saveConnBtn"),
  syncNowBtn: $("syncNowBtn"),
  disableConnBtn: $("disableConnBtn"),
  syncLog: $("syncLog"),

  // upload (Impor Data)
  datasetType: $("datasetType"),
  periodId: $("periodId"),
  downloadTemplateBtn: $("downloadTemplateBtn"),
  reqTag: $("reqTag"),
  fileInput: $("fileInput"),
  validateBtn: $("validateBtn"),
  submitBatchBtn: $("submitBatchBtn"),
  clearUploadBtn: $("clearUploadBtn"),
  vTotal: $("vTotal"),
  vValid: $("vValid"),
  vInvalid: $("vInvalid"),
  errorLog: $("errorLog"),
  previewHead: $("previewHead"),
  previewBody: $("previewBody"),

  // mapping
  mapSource: $("mapSource"),
  mapTarget: $("mapTarget"),
  mapMonevField: $("mapMonevField"),
  mapSourceField: $("mapSourceField"),
  mapTransform: $("mapTransform"),
  addMapBtn: $("addMapBtn"),
  exportMapBtn: $("exportMapBtn"),
  clearMapBtn: $("clearMapBtn"),
  mapTableBody: $("mapTableBody"),

  // reliability
  relMode: $("relMode"),
  relTimeout: $("relTimeout"),
  relRetry: $("relRetry"),
  saveRelBtn: $("saveRelBtn"),
  testRelBtn: $("testRelBtn"),
  relLog: $("relLog"),

  // audit modal
  auditModal: $("auditModal"),
  closeAudit: $("closeAudit"),
  auditKeys: $("auditKeys"),
  auditKeySelect: $("auditKeySelect"),
  auditValue: $("auditValue"),

  // lang
  langToggle: $("langToggle"),
};

const STORAGE = {
  connectors: "datahub_connectors",
  mappings: "datahub_mappings",
  reliability: "datahub_reliability",
  batches: "upload_batches",
  reviewInbox: "review_inbox",
};

function readJSON(key, fallback){
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}
function writeJSON(key, value){
  localStorage.setItem(key, JSON.stringify(value));
}

function escapeHtml(s){
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
}

function modal(el, show){ el.classList.toggle("hidden", !show); }

function nowIso(){ return new Date().toISOString(); }

function uid(prefix="ID"){
  const r = Math.random().toString(16).slice(2,8);
  return `${prefix}-${Date.now()}-${r}`;
}

function setState(text, cls){
  els.hubState.textContent = `● ${text}`;
  els.hubState.className = "pill " + (cls || "");
}

function enabledLabel(flag){
  return flag ? "Aktif" : "Nonaktif";
}

function statusLabel(code){
  // Catatan: ini hanya label tampilan. Kode status internal tetap dipakai untuk logika.
  const map = {
    "Healthy": "Terhubung",
    "Down": "Tidak Tersedia",
    "Degraded": "Terganggu",
    "Needs Auth": "Perlu Autentikasi",
    "Manual": "Manual",
    "Disabled": "Nonaktif",
  };
  return map[code] || String(code || "—");
}

function statusClass(code){
  if (code === "Healthy") return "good";
  if (code === "Down") return "bad";
  return "warn";
}

// -------------------- Defaults --------------------
function defaultConnectors(){
  return [
    { id:"SRN", name:"SRN (KLH)", role:"Registri / pelaporan aksi", base_url:"https://srn.kemenlh.go.id", auth_mode:"OAUTH2", status:"Needs Auth", enabled:true, last_sync:null, log:[] },
    { id:"AKSARA", name:"AKSARA (Bappenas)", role:"Perencanaan / pelacakan PRK-PBI", base_url:"https://pprk.bappenas.go.id/aksara", auth_mode:"OAUTH2", status:"Needs Auth", enabled:true, last_sync:null, log:[] },
    { id:"CBT", name:"Climate Budget Tagging (Kemenkeu)", role:"Tagging anggaran", base_url:"", auth_mode:"NONE", status:"Manual", enabled:true, last_sync:null, log:[] },
    { id:"BMKG", name:"BMKG", role:"Data iklim / layanan", base_url:"", auth_mode:"NONE", status:"Manual", enabled:true, last_sync:null, log:[] },
    { id:"BIG", name:"BIG", role:"Data geospasial", base_url:"", auth_mode:"NONE", status:"Manual", enabled:true, last_sync:null, log:[] },
    { id:"BPS", name:"BPS", role:"Data sosial-ekonomi", base_url:"", auth_mode:"NONE", status:"Manual", enabled:true, last_sync:null, log:[] },
    { id:"SID", name:"Sistem Informasi Desa", role:"Profil & indikator desa (beragam)", base_url:"", auth_mode:"NONE", status:"Manual", enabled:true, last_sync:null, log:[] },
    { id:"PEMDA", name:"Portal Pemda (Prov/Kab/Kota)", role:"Dataset wilayah / OPD", base_url:"", auth_mode:"NONE", status:"Manual", enabled:true, last_sync:null, log:[] },
  ];
}

function ensureBootstrap(){
  if (!localStorage.getItem(STORAGE.connectors)) writeJSON(STORAGE.connectors, defaultConnectors());
  if (!localStorage.getItem(STORAGE.mappings)) writeJSON(STORAGE.mappings, []);
  if (!localStorage.getItem(STORAGE.reliability)) writeJSON(STORAGE.reliability, { mode:"AUTO", timeout_sec:20, retry_count:2, log:[] });
  if (!localStorage.getItem(STORAGE.batches)) writeJSON(STORAGE.batches, []);
  if (!localStorage.getItem(STORAGE.reviewInbox)) writeJSON(STORAGE.reviewInbox, []);
}

// -------------------- KPIs --------------------
function refreshKPIs(){
  const conns = readJSON(STORAGE.connectors, []);
  const maps  = readJSON(STORAGE.mappings, []);
  const batches = readJSON(STORAGE.batches, []);
  els.kConn.textContent = conns.filter(c=>c.enabled).length;
  els.kMap.textContent  = maps.length;
  els.kBatch.textContent = batches.length;
}

// -------------------- Tabs --------------------
function setActiveTab(name){
  els.tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === name));
  els.tabIntegrations.classList.toggle("hidden", name !== "integrations");
  els.tabUpload.classList.toggle("hidden", name !== "upload");
  els.tabMapping.classList.toggle("hidden", name !== "mapping");
  els.tabReliability.classList.toggle("hidden", name !== "reliability");
}

// -------------------- Integrations Panel --------------------
function renderConnectors(){
  const conns = readJSON(STORAGE.connectors, []);
  els.connectorsGrid.innerHTML = conns.map(c => {
    const cls = statusClass(c.status);
    return `
      <div class="conn" data-id="${c.id}">
        <div class="row2" style="justify-content:space-between">
          <div class="title">${escapeHtml(c.name)}</div>
          <span class="pill ${cls}">● ${escapeHtml(statusLabel(c.status))}</span>
        </div>
        <div class="meta">${escapeHtml(c.role)} • ${enabledLabel(!!c.enabled)}</div>
        <div class="meta">Sinkron terakhir: ${escapeHtml(c.last_sync || "—")}</div>
        <div class="actions">
          <button class="btn btn-ghost" data-act="select">Pilih</button>
          <button class="btn btn-ghost" data-act="sync">Sinkronkan</button>
          <button class="btn btn-ghost" data-act="toggle">${c.enabled ? "Nonaktifkan" : "Aktifkan"}</button>
        </div>
      </div>
    `;
  }).join("");

  // populate select
  els.connectorSelect.innerHTML = conns.map(c => `<option value="${c.id}">${c.id} — ${escapeHtml(c.name)}</option>`).join("");

  // wire events
  Array.from(els.connectorsGrid.querySelectorAll(".conn")).forEach(box => {
    box.addEventListener("click", (e)=>{
      const act = e.target?.dataset?.act;
      const id = box.dataset.id;
      if (!act) return;
      if (act === "select") selectConnector(id);
      if (act === "sync") simulateSync(id);
      if (act === "toggle") toggleConnector(id);
    });
  });

  // auto select first
  if (conns[0]) selectConnector(els.connectorSelect.value || conns[0].id);
}

function selectConnector(id){
  const conns = readJSON(STORAGE.connectors, []);
  const c = conns.find(x => x.id === id);
  if (!c) return;

  els.connectorSelect.value = c.id;
  els.connBaseUrl.value = c.base_url || "";
  els.connAuthMode.value = c.auth_mode || "NONE";
  els.syncLog.textContent = (c.log || []).slice(-20).join("\n") || "(belum ada log)";
}

function saveConnector(){
  const id = els.connectorSelect.value;
  const conns = readJSON(STORAGE.connectors, []);
  const c = conns.find(x => x.id === id);
  if (!c) return;

  c.base_url = (els.connBaseUrl.value || "").trim();
  c.auth_mode = els.connAuthMode.value;

  c.log = c.log || [];
  c.log.push(`[${nowIso()}] Konfigurasi disimpan: base_url=${c.base_url || "(kosong)"}, auth=${c.auth_mode}`);
  writeJSON(STORAGE.connectors, conns);
  selectConnector(id);
  refreshKPIs();
  setState("Konfigurasi tersimpan", "good");
  setTimeout(()=> setState("Siap", ""), 900);
}

function simulateSync(id){
  const conns = readJSON(STORAGE.connectors, []);
  const c = conns.find(x => x.id === id);
  if (!c) return;

  c.log = c.log || [];
  c.log.push(`[${nowIso()}] Permintaan sinkronisasi (stub).`);

  // simulasi perilaku mode keandalan
  const rel = readJSON(STORAGE.reliability, { mode:"AUTO", timeout_sec:20, retry_count:2, log:[] });
  const failChance = (rel.mode === "CONNECT_ONLY") ? 0.30 : (rel.mode === "AUTO") ? 0.20 : 0.10;
  const failed = Math.random() < failChance;

  if (!c.enabled){
    c.status = "Disabled";
    c.log.push(`[${nowIso()}] Sinkron dilewati: konektor nonaktif.`);
  } else if (failed){
    c.status = "Down";
    c.log.push(`[${nowIso()}] Sinkron gagal (simulasi). Disarankan fallback: impor data.`);
  } else {
    c.status = "Healthy";
    c.last_sync = nowIso();
    c.log.push(`[${nowIso()}] Sinkron berhasil (simulasi). Snapshot dicache.`);
  }

  writeJSON(STORAGE.connectors, conns);
  selectConnector(c.id);
  renderConnectors();
  refreshKPIs();
}

function toggleConnector(id){
  const conns = readJSON(STORAGE.connectors, []);
  const c = conns.find(x => x.id === id);
  if (!c) return;

  c.enabled = !c.enabled;
  c.status = c.enabled ? (c.status === "Disabled" ? "Needs Auth" : c.status) : "Disabled";
  c.log = c.log || [];
  c.log.push(`[${nowIso()}] Konektor ${c.enabled ? "diaktifkan" : "dinonaktifkan"}.`);
  writeJSON(STORAGE.connectors, conns);
  renderConnectors();
  selectConnector(id);
  refreshKPIs();
}

function disableSelectedConnector(){
  const id = els.connectorSelect.value;
  toggleConnector(id);
}

function syncSelectedConnector(){
  const id = els.connectorSelect.value;
  simulateSync(id);
}

// -------------------- Impor Data --------------------
const REQUIRED = {
  HORIZONTAL: [
    "kementerian_lembaga",
    "unit_pelaksana",
    "nama_aksi_adaptasi",
    "sektor",
    "lokasi_pelaksanaan",
    "periode_pelaporan",
    "indikator_adaptasi",
    "satuan_indikator",
    "baseline",
    "target_periode",
    "realisasi"
  ],
  VERTICAL: [
    "sektor",
    "tipe_aksi",
    "nama_aksi",
    "lokasi_desa_kec",
    "kab_kota",
    "provinsi",
    "periode_pelaporan",
    "status",
    "indikator",
    "satuan",
    "baseline",
    "target",
    "realisasi"
  ]
};

let uploadContext = {
  file: null,
  rows: [],
  validRows: [],
  invalidRows: [],
  errors: [],
  columns: [],
};

function updateRequiredTag(){
  const t = els.datasetType.value;
  els.reqTag.textContent = `Wajib: ${REQUIRED[t].length} kolom`;
}

function downloadTemplate(){
  const t = els.datasetType.value;
  const cols = REQUIRED[t];
  const header = cols.join(",");
  const sample = (t === "HORIZONTAL")
    ? ["KLH","Dit Adaptasi","Contoh Aksi","Air","DKI Jakarta","2026-S1","IND-001","unit","0","10","4"].join(",")
    : ["Air","Infrastruktur","Contoh Aksi Wilayah","Desa A / Kec B","Kota X","DKI Jakarta","2026-S1","Dilaksanakan","IND-001","unit","0","10","4"].join(",");
  const csv = header + "\n" + sample + "\n";
  downloadText(`template_${t.toLowerCase()}.csv`, csv, "text/csv");
}

function downloadText(filename, text, mime="text/plain"){
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click(); a.remove();
  setTimeout(()=> URL.revokeObjectURL(url), 800);
}

function clearUpload(resetFileInput = true){
  uploadContext = { file:null, rows:[], validRows:[], invalidRows:[], errors:[], columns:[] };

  if (resetFileInput) els.fileInput.value = "";

  els.vTotal.textContent = "—";
  els.vValid.textContent = "—";
  els.vInvalid.textContent = "—";
  els.errorLog.textContent = "";
  els.previewHead.innerHTML = "";
  els.previewBody.innerHTML = "";
  els.submitBatchBtn.disabled = true;
}


function parseCSV(text){
  // Parser CSV sederhana: delimiter koma, mendukung quoted values (dasar)
  const lines = text.replace(/\r\n/g,"\n").replace(/\r/g,"\n").split("\n").filter(l => l.trim().length > 0);
  if (!lines.length) return { columns:[], rows:[] };
  const columns = splitCSVLine(lines[0]).map(c => normalizeKey(c));
  const rows = [];
  for (let i=1; i<lines.length; i++){
    const vals = splitCSVLine(lines[i]);
    const obj = {};
    columns.forEach((c, idx) => { obj[c] = (vals[idx] ?? "").trim(); });
    rows.push(obj);
  }
  return { columns, rows };
}

function splitCSVLine(line){
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i=0;i<line.length;i++){
    const ch = line[i];
    if (ch === '"' ){
      if (inQ && line[i+1] === '"'){ cur += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === ',' && !inQ){
      out.push(cur); cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function normalizeKey(k){
  return String(k || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g,"_")
    .replace(/[^a-z0-9_]/g,"");
}

function validateRows(){
  const t = els.datasetType.value;
  const periodId = (els.periodId.value || "").trim();

  if (!periodId){
    setState("ID Periode wajib diisi", "warn");
    return;
  }
  if (!uploadContext.rows.length){
    setState("Tidak ada baris data untuk divalidasi", "warn");
    return;
  }

  const required = REQUIRED[t];
  const errors = [];
  const validRows = [];
  const invalidRows = [];

  uploadContext.rows.forEach((r, idx) => {
    const missing = [];

    required.forEach(k => {
      if (String(r[k] ?? "").trim() === "") missing.push(k);
    });

    // konsistensi periode jika kolom tersedia
    const pcol = "periode_pelaporan";
    if (String(r[pcol] ?? "").trim() && String(r[pcol]).trim() !== periodId) {
      missing.push(`periode_pelaporan (harus=${periodId}, saat_ini=${String(r[pcol]).trim()})`);
    }

    if (missing.length){
      invalidRows.push({ row_index: idx+1, missing });
      if (errors.length < 50){
        errors.push(`Baris ${idx+1}: kolom kosong/tidak sesuai -> ${missing.join(", ")}`);
      }
    } else {
      // lampirkan meta
      const rr = { ...r, _meta: { dataset_type: t, period_id: periodId, source: "UPLOAD" } };
      validRows.push(rr);
    }
  });

  uploadContext.validRows = validRows;
  uploadContext.invalidRows = invalidRows;
  uploadContext.errors = errors;

  els.vTotal.textContent = uploadContext.rows.length;
  els.vValid.textContent = validRows.length;
  els.vInvalid.textContent = invalidRows.length;
  els.errorLog.textContent = errors.join("\n") || "(tidak ada error)";
  els.submitBatchBtn.disabled = validRows.length === 0;

  renderPreview(uploadContext.rows, REQUIRED[t]);

  setState(validRows.length ? "Validasi selesai" : "Tidak ada baris yang valid", validRows.length ? "good" : "warn");
  setTimeout(()=> setState("Siap", ""), 900);
}

function renderPreview(allRows, requiredCols){
  const rows = (allRows || []).slice(0, 20);
  const cols = (uploadContext.columns && uploadContext.columns.length)
    ? uploadContext.columns.slice(0, 12)
    : requiredCols.slice(0, 12);

  els.previewHead.innerHTML = `<tr>${cols.map(c => `<th>${escapeHtml(c)}</th>`).join("")}</tr>`;
  els.previewBody.innerHTML = rows.map(r => `
    <tr>
      ${cols.map(c => `<td>${escapeHtml(r[c] ?? "")}</td>`).join("")}
    </tr>
  `).join("") || `<tr><td class="muted" colspan="${cols.length}">Tidak ada pratinjau</td></tr>`;
}

async function handleFile(){
  const file = els.fileInput.files?.[0];
  clearUpload(false); 
  if (!file) return;

  uploadContext.file = file;

  const name = (file.name || "").toLowerCase();
  const ext = name.split(".").pop();

  if (ext === "csv"){
    const text = await file.text();
    const parsed = parseCSV(text);
    uploadContext.columns = parsed.columns;
    uploadContext.rows = parsed.rows;
    els.errorLog.textContent = "(CSV terbaca, klik Validasi)";
    setState("CSV dimuat", "good");
  } else if (ext === "json"){
    const text = await file.text();
    try{
      const data = JSON.parse(text);
      // menerima array of objects, atau {rows:[...]}
      const rows = Array.isArray(data) ? data : (Array.isArray(data.rows) ? data.rows : []);
      uploadContext.rows = rows.map(r=>{
        const o = {};
        Object.keys(r||{}).forEach(k => o[normalizeKey(k)] = String(r[k] ?? "").trim());
        return o;
      });
      uploadContext.columns = Object.keys(uploadContext.rows[0] || {});
      els.errorLog.textContent = "(JSON terbaca, klik Validasi)";
      setState("JSON dimuat", "good");
    } catch(e){
      els.errorLog.textContent = "Gagal parse JSON: " + e.message;
      setState("JSON tidak valid", "warn");
    }
  } else if (ext === "xlsx"){
    // diterima tapi tidak diparsing di stub
    els.errorLog.textContent = "XLSX diterima tetapi belum bisa diparsing di stub frontend. Silakan ekspor ke CSV lalu unggah.";
    setState("XLSX belum didukung", "warn");
  } else {
    els.errorLog.textContent = "Format tidak didukung. Gunakan CSV atau JSON.";
    setState("Format tidak didukung", "warn");
  }

  // update total sebagai status "terbaca" (belum tervalidasi)
  els.vTotal.textContent = uploadContext.rows.length || "—";
  els.vValid.textContent = "—";
  els.vInvalid.textContent = "—";
}

function submitBatch(){
  const t = els.datasetType.value;
  const periodId = (els.periodId.value || "").trim();
  if (!uploadContext.validRows.length) return;

  const batch_id = uid("BATCH");
  const batch = {
    batch_id,
    dataset_type: t,
    period_id: periodId,
    filename: uploadContext.file?.name || "(tidak diketahui)",
    created_at: nowIso(),
    status: "SUBMITTED",
    counts: {
      total: uploadContext.rows.length,
      valid: uploadContext.validRows.length,
      invalid: uploadContext.invalidRows.length
    },
    errors_preview: uploadContext.errors,
    rows_valid: uploadContext.validRows,
  };

  // simpan batch
  const batches = readJSON(STORAGE.batches, []);
  batches.unshift(batch);
  writeJSON(STORAGE.batches, batches);

  // kirim ke kotak masuk tinjau (stub)
  const inbox = readJSON(STORAGE.reviewInbox, []);
  inbox.unshift({
    inbox_id: uid("INBOX"),
    type: "UPLOAD_BATCH",
    ref_id: batch_id,
    dataset_type: t,
    period_id: periodId,
    status: "PENDING_REVIEW",
    created_at: batch.created_at,
    summary: `${t} batch impor ${batch_id} (valid=${batch.counts.valid} / tidak_valid=${batch.counts.invalid})`
  });
  writeJSON(STORAGE.reviewInbox, inbox);

  refreshKPIs();
  setState("Dikirim ke Kotak Masuk Tinjau", "good");
  setTimeout(()=> setState("Siap", ""), 900);

  // bersihkan agar tidak double submit
  clearUpload();
}

// -------------------- Mapping Studio --------------------
function renderMappings(){
  const maps = readJSON(STORAGE.mappings, []);
  els.mapTableBody.innerHTML = maps.map((m, idx)=> `
    <tr data-idx="${idx}" style="cursor:pointer">
      <td><b>${escapeHtml(m.source)}</b></td>
      <td>${escapeHtml(m.target)}</td>
      <td>${escapeHtml(m.monev_field)}</td>
      <td>${escapeHtml(m.source_field)}</td>
      <td class="muted">${escapeHtml(m.transform || "")}</td>
    </tr>
  `).join("") || `<tr><td colspan="5" class="muted">Belum ada aturan.</td></tr>`;

  Array.from(els.mapTableBody.querySelectorAll("tr[data-idx]")).forEach(tr=>{
    tr.addEventListener("click", ()=>{
      const i = Number(tr.dataset.idx);
      const maps2 = readJSON(STORAGE.mappings, []);
      maps2.splice(i,1);
      writeJSON(STORAGE.mappings, maps2);
      renderMappings();
      refreshKPIs();
      setState("Aturan dihapus", "warn");
      setTimeout(()=> setState("Siap", ""), 900);
    });
  });
}

function addMappingRule(){
  const rule = {
    id: uid("MAP"),
    source: els.mapSource.value,
    target: els.mapTarget.value,
    monev_field: normalizeKey(els.mapMonevField.value),
    source_field: normalizeKey(els.mapSourceField.value),
    transform: (els.mapTransform.value || "").trim(),
    created_at: nowIso()
  };
  if (!rule.monev_field || !rule.source_field){
    setState("Kolom penyelarasan wajib diisi", "warn");
    return;
  }
  const maps = readJSON(STORAGE.mappings, []);
  maps.unshift(rule);
  writeJSON(STORAGE.mappings, maps);
  renderMappings();
  refreshKPIs();
  els.mapMonevField.value = "";
  els.mapSourceField.value = "";
  els.mapTransform.value = "";
  setState("Aturan ditambahkan", "good");
  setTimeout(()=> setState("Siap", ""), 900);
}

function exportMappings(){
  const maps = readJSON(STORAGE.mappings, []);
  downloadText(`monev_mapping_rules.json`, JSON.stringify(maps, null, 2), "application/json");
  setState("Aturan diekspor", "good");
  setTimeout(()=> setState("Siap", ""), 900);
}

function clearMappings(){
  writeJSON(STORAGE.mappings, []);
  renderMappings();
  refreshKPIs();
  setState("Aturan dikosongkan", "warn");
  setTimeout(()=> setState("Siap", ""), 900);
}

// -------------------- Reliability Mode --------------------
function loadReliability(){
  const rel = readJSON(STORAGE.reliability, { mode:"AUTO", timeout_sec:20, retry_count:2, log:[] });
  els.relMode.value = rel.mode || "AUTO";
  els.relTimeout.value = rel.timeout_sec ?? 20;
  els.relRetry.value = rel.retry_count ?? 2;
  els.relLog.textContent = (rel.log || []).slice(-50).join("\n") || "(belum ada log)";
}

function saveReliability(){
  const rel = readJSON(STORAGE.reliability, { mode:"AUTO", timeout_sec:20, retry_count:2, log:[] });
  rel.mode = els.relMode.value;
  rel.timeout_sec = Number(els.relTimeout.value || 20);
  rel.retry_count = Number(els.relRetry.value || 2);
  rel.log = rel.log || [];
  rel.log.push(`[${nowIso()}] Pengaturan disimpan: mode=${rel.mode}, timeout=${rel.timeout_sec}s, retry=${rel.retry_count}`);
  writeJSON(STORAGE.reliability, rel);
  loadReliability();
  setState("Pengaturan konektor tersimpan", "good");
  setTimeout(()=> setState("Siap", ""), 900);
}

function simulateFailure(){
  const rel = readJSON(STORAGE.reliability, { mode:"AUTO", timeout_sec:20, retry_count:2, log:[] });
  rel.log = rel.log || [];
  rel.log.push(`[${nowIso()}] Simulasi kegagalan konektor -> kebijakan fallback: ${rel.mode}`);
  if (rel.mode === "CONNECT_ONLY"){
    rel.log.push(`[${nowIso()}] KONEKTOR SAJA: pengguna harus menunggu/ulang; impor data dibatasi oleh kebijakan.`);
  } else if (rel.mode === "UPLOAD_FIRST"){
    rel.log.push(`[${nowIso()}] IMPOR DAHULU: tampilkan asisten impor data; lewati percobaan konektor.`);
  } else {
    rel.log.push(`[${nowIso()}] OTOMATIS: coba konektor ${rel.retry_count}x dalam ${rel.timeout_sec}s lalu fallback ke impor data.`);
  }
  writeJSON(STORAGE.reliability, rel);
  loadReliability();
}

// -------------------- Global Search --------------------
function runSearch(){
  const q = (els.globalSearch.value || "").trim().toLowerCase();
  if (!q) return;

  const scope = els.searchScope.value;
  const conns = readJSON(STORAGE.connectors, []);
  const maps = readJSON(STORAGE.mappings, []);
  const batches = readJSON(STORAGE.batches, []);

  const res = [];


  if (scope === "all" || scope === "connectors"){
    const hit = conns.filter(c => (`${c.id} ${c.name} ${c.role} ${c.status} ${enabledLabel(!!c.enabled)}`.toLowerCase()).includes(q));
    res.push(section("Konektor", hit.map(h => `${h.id} • ${statusLabel(h.status)} • ${h.base_url || "(belum ada URL)"}`)));
  }
  if (scope === "all" || scope === "mappings"){
    const hit = maps.filter(m => (`${m.source} ${m.target} ${m.monev_field} ${m.source_field} ${m.transform}`.toLowerCase()).includes(q));
    res.push(section("Aturan Kolom", hit.slice(0,20).map(h => `${h.source}→${h.target}: ${h.monev_field} <= ${h.source_field} ${h.transform ? "| " + h.transform : ""}`)));
  }
  if (scope === "all" || scope === "batches"){
    const hit = batches.filter(b => (`${b.batch_id} ${b.dataset_type} ${b.period_id} ${b.filename}`.toLowerCase()).includes(q));
    res.push(section("Batch Impor", hit.slice(0,20).map(h => `${h.batch_id} • ${h.dataset_type} • ${h.period_id} • valid=${h.counts?.valid}`)));
  }

  els.searchTitle.textContent = `Hasil Pencarian: "${els.globalSearch.value}"`;
  els.searchBody.innerHTML = res.join("") || `<div class="muted">Tidak ada hasil.</div>`;
  modal(els.searchModal, true);
}

function section(title, items){
  const arr = (items || []).filter(Boolean);
  return `
    <div style="margin-bottom:12px">
      <div style="font-weight:900; margin-bottom:6px">${escapeHtml(title)} (${arr.length})</div>
      ${arr.length ? `<ul>${arr.map(i => `<li>${escapeHtml(i)}</li>`).join("")}</ul>` : `<div class="muted">Tidak ada hasil</div>`}
    </div>
  `;
}

// -------------------- Audit modal --------------------
function openAudit(){
  const keys = Object.keys(localStorage).sort();
  els.auditKeys.textContent = keys.join("\n") || "(kosong)";
  els.auditKeySelect.innerHTML = keys.map(k => `<option value="${escapeHtml(k)}">${escapeHtml(k)}</option>`).join("");
  const first = keys[0];
  if (first){
    els.auditKeySelect.value = first;
    els.auditValue.textContent = localStorage.getItem(first) || "";
  } else {
    els.auditValue.textContent = "(kosong)";
  }
  modal(els.auditModal, true);
}
function refreshAuditValue(){
  const k = els.auditKeySelect.value;
  els.auditValue.textContent = localStorage.getItem(k) || "";
}

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

// -------------------- Init --------------------
function init(){
  ensureBootstrap();
  refreshKPIs();
  updateRequiredTag();
  sidebarBehavior();

  // tabs
  els.tabs.forEach(t => t.addEventListener("click", ()=> setActiveTab(t.dataset.tab)));
  setActiveTab("integrations");

  // integrations
  renderConnectors();
  els.connectorSelect.addEventListener("change", ()=> selectConnector(els.connectorSelect.value));
  els.saveConnBtn.addEventListener("click", saveConnector);
  els.syncNowBtn.addEventListener("click", syncSelectedConnector);
  els.disableConnBtn.addEventListener("click", disableSelectedConnector);

  // upload (Impor Data)
  els.datasetType.addEventListener("change", updateRequiredTag);
  els.downloadTemplateBtn.addEventListener("click", downloadTemplate);
  els.fileInput.addEventListener("change", handleFile);
  els.validateBtn.addEventListener("click", validateRows);
  els.submitBatchBtn.addEventListener("click", submitBatch);
  els.clearUploadBtn.addEventListener("click", clearUpload);

  // mapping
  renderMappings();
  els.addMapBtn.addEventListener("click", addMappingRule);
  els.exportMapBtn.addEventListener("click", exportMappings);
  els.clearMapBtn.addEventListener("click", clearMappings);

  // reliability
  loadReliability();
  els.saveRelBtn.addEventListener("click", saveReliability);
  els.testRelBtn.addEventListener("click", simulateFailure);

  // global search
  els.searchBtn.addEventListener("click", runSearch);
  els.globalSearch.addEventListener("keydown", (e)=>{ if (e.key==="Enter") runSearch(); });
  els.closeSearch.addEventListener("click", ()=> modal(els.searchModal, false));

  // audit
  els.openAuditBtn.addEventListener("click", openAudit);
  els.closeAudit.addEventListener("click", ()=> modal(els.auditModal, false));
  els.auditKeySelect.addEventListener("change", refreshAuditValue);

  // refresh
  els.refreshBtn.addEventListener("click", ()=>{
    refreshKPIs();
    renderConnectors();
    renderMappings();
    loadReliability();
    setState("Dimuat ulang", "good");
    setTimeout(()=> setState("Siap", ""), 900);
  });

  // lang toggle placeholder
  els.langToggle.addEventListener("click", ()=>{
    els.langToggle.textContent = (els.langToggle.textContent === "ID") ? "EN" : "ID";
  });

  // default period suggestion
  if (!els.periodId.value) els.periodId.value = "2026-S1";

  // pastikan status default konsisten dengan UI
  setState("Siap", "");
}

init();
