// Mesin Komputasi Dampak (frontend-only)
// - langkah pipeline + kontrol eksekusi
// - pra-pemeriksaan: hitung approved vs gap
// - eksekusi stub: generate keluaran palsu mengikuti skema
// - persist ke localStorage: impact_jobs, impact_output_indicator, impact_output_aggregate
//
// PENTING: tidak ada rumus resmi dihitung di sini (hanya angka contoh). Backend yang menghitung resmi.

const $ = (id) => document.getElementById(id);

const els = {
  engineState: $("engineState"),
  resetEngine: $("resetEngine"),
  period: $("period"),
  jobType: $("jobType"),
  scope: $("scope"),
  scopeId: $("scopeId"),
  methodVersion: $("methodVersion"),
  parameterSet: $("parameterSet"),
  runBtn: $("runBtn"),
  dryCheckBtn: $("dryCheckBtn"),
  openApiBtn: $("openApiBtn"),
  kReady: $("kReady"),
  kMissing: $("kMissing"),
  kLastJob: $("kLastJob"),

  pipeline: $("pipeline"),
  logbox: $("logbox"),
  clearLogs: $("clearLogs"),

  tblIndicator: $("tblIndicator"),
  tblAggregate: $("tblAggregate"),
  tblJobs: $("tblJobs"),

  tabs: Array.from(document.querySelectorAll(".tab")),
  tabIndicator: $("tab-indicator"),
  tabAggregate: $("tab-aggregate"),
  tabJobs: $("tab-jobs"),

  globalSearch: $("globalSearch"),
  searchScope: $("searchScope"),
  searchBtn: $("searchBtn"),
  searchModal: $("searchModal"),
  searchTitle: $("searchTitle"),
  searchBody: $("searchBody"),
  closeSearch: $("closeSearch"),

  apiModal: $("apiModal"),
  closeApi: $("closeApi"),
  apiPost: $("apiPost"),
  apiGet: $("apiGet"),
  apiOutputs: $("apiOutputs"),

  langToggle: $("langToggle"),
};

const STORAGE = {
  records: "monev_records",              // record gabungan dari review.js
  jobs: "impact_jobs",
  outIndicator: "impact_output_indicator",
  outAggregate: "impact_output_aggregate",
  engineLogs: "impact_engine_logs",
};

// Tetap simpan kode status (OK/WARN/ERR/IDLE) untuk styling,
// tapi tampilkan label Indonesia.
function labelStepState(code){
  const s = (code || "IDLE").toUpperCase();
  if (s === "OK") return "BAIK";
  if (s === "WARN") return "PERINGATAN";
  if (s === "ERR") return "GAGAL";
  return "Tidak aktif";
}

function labelJobStatus(code){
  const s = (code || "").toUpperCase();
  if (s === "RUNNING") return "BERJALAN";
  if (s === "SUCCEEDED") return "BERHASIL";
  if (s === "FAILED") return "GAGAL";
  return code || "—";
}

function labelJobType(code){
  const t = (code || "").toUpperCase();
  if (t === "DRY_RUN") return "UJI COBA";
  if (t === "FULL_RUN") return "EKSEKUSI PENUH";
  return code || "—";
}

function labelScope(code){
  const s = (code || "").toUpperCase();
  if (s === "NATIONAL") return "Nasional";
  if (s === "SECTOR") return "Sektor";
  if (s === "REGION") return "Wilayah";
  if (s === "ACTION") return "Aksi";
  return code || "—";
}

function labelYesNo(v){
  return v ? "YA" : "TIDAK";
}

function labelQualityFlag(code){
  const s = (code || "").toUpperCase();
  if (s === "OK") return "BAIK";
  if (s === "WARN") return "PERINGATAN";
  if (s === "ERR") return "GAGAL";
  return code || "—";
}

const PIPELINE = [
  {
    id:"ingest",
    title:"1) Ambil Input yang Disetujui",
    desc:"Ambil data berstatus APPROVED dari modul Verifikasi & Validasi (terbaru).",
    state:"IDLE"
  },
  {
    id:"standardize",
    title:"2) Standarisasi & Pemetaan Kunci",
    desc:"Normalisasi action_id, indicator_id, location_id, period_id.",
    state:"IDLE"
  },
  {
    id:"gate",
    title:"3) Gerbang Kesiapan & Kelayakan",
    desc:"Saring record layak dihitung sesuai ambang parameter.",
    state:"IDLE"
  },
  {
    id:"compute",
    title:"4) Komputasi (Backend)",
    desc:"Menjalankan paket perhitungan (kemajuan/delta/dll).",
    state:"IDLE"
  },
  {
    id:"aggregate",
    title:"5) Agregasi",
    desc:"Hitung agregasi sektor/wilayah/nasional.",
    state:"IDLE"
  },
  {
    id:"publish",
    title:"6) Publikasi Keluaran",
    desc:"Simpan keluaran + jejak asal-usul (job_id, method_version).",
    state:"IDLE"
  },
];

function modal(el, show){
  el.classList.toggle("hidden", !show);
}

function nowIso(){ return new Date().toISOString(); }

function fmtDate(iso){
  if(!iso) return "—";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const da = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${da}`;
}

function rid(prefix="J"){
  return `${prefix}-${Math.random().toString(16).slice(2,8)}-${Date.now().toString(16)}`.toUpperCase();
}

function readJSON(key, fallback){
  try{ return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch{ return fallback; }
}
function writeJSON(key, data){
  localStorage.setItem(key, JSON.stringify(data));
}

function setEngineState(text, cls){
  els.engineState.textContent = `● ${text}`;
  els.engineState.className = "pill " + (cls || "");
}

function badgeClass(state){
  if (state === "OK") return "badge b-ok";
  if (state === "WARN") return "badge b-warn";
  if (state === "ERR") return "badge b-err";
  return "badge b-idle";
}

function renderPipeline(){
  els.pipeline.innerHTML = PIPELINE.map(s => `
    <div class="step" data-step="${s.id}">
      <div class="left">
        <div class="title">${s.title}</div>
        <div class="desc">${s.desc}</div>
      </div>
      <div class="${badgeClass(s.state)}">${labelStepState(s.state)}</div>
    </div>
  `).join("");
}

function setStep(id, state){
  const step = PIPELINE.find(s => s.id === id);
  if(step) step.state = state;
  renderPipeline();
}

function log(line){
  const logs = readJSON(STORAGE.engineLogs, []);
  logs.push(`[${new Date().toLocaleString()}] ${line}`);
  writeJSON(STORAGE.engineLogs, logs);
  els.logbox.textContent = logs.join("\n");
  els.logbox.scrollTop = els.logbox.scrollHeight;
}

function clearLogs(){
  writeJSON(STORAGE.engineLogs, []);
  els.logbox.textContent = "";
}

function loadRecords(){
  // record dipelihara oleh modul review; mencakup status
  return readJSON(STORAGE.records, []);
}

function getThreshold(paramSet){
  // Set parameter:
  // default_v1: 0.8; strict_v1: 0.9
  if ((paramSet || "").startsWith("strict")) return 0.9;
  return 0.8;
}

function countReadiness(records, threshold01){
  const approved  = records.filter(r => (r.status || "").toUpperCase() === "APPROVED");
  const returned  = records.filter(r => (r.status || "").toUpperCase() === "RETURNED");
  const rejected  = records.filter(r => (r.status || "").toUpperCase() === "REJECTED");
  const submitted = records.filter(r => (r.status || "").toUpperCase() === "SUBMITTED");

  // readiness di record tersimpan sebagai persen (0–100)
  const thrPct = Math.round(threshold01 * 100);
  const eligible = approved.filter(r => Number(r.readiness || 0) >= thrPct);

  return {
    approved: approved.length,
    eligible: eligible.length,
    returned: returned.length,
    rejected: rejected.length,
    submitted: submitted.length
  };
}

function updateKPIs(){
  const threshold = getThreshold(els.parameterSet.value);
  const records = loadRecords();
  const c = countReadiness(records, threshold);
  const thrPct = Math.round(threshold*100);

  els.kReady.textContent = `${c.approved} disetujui / ${c.eligible} layak (≥${thrPct}%)`;
  els.kMissing.textContent = `${c.submitted} dikirim, ${c.returned} dikembalikan, ${c.rejected} ditolak`;
}

function latestJob(){
  const jobs = readJSON(STORAGE.jobs, []);
  return jobs[0] || null;
}

function renderJobs(){
  const jobs = readJSON(STORAGE.jobs, []);
  const tbody = els.tblJobs.querySelector("tbody");

  tbody.innerHTML = jobs.map(j => `
    <tr>
      <td><b>${j.job_id}</b></td>
      <td>${labelJobType(j.job_type)} <span class="muted small">(${j.job_type})</span></td>
      <td>${labelScope(j.scope)}${j.scope_id ? ` • ${escapeHtml(j.scope_id)}` : ""}</td>
      <td>${j.period_id}</td>
      <td>${j.method_version}</td>
      <td>${j.parameter_set_id}</td>
      <td>${labelJobStatus(j.status)} <span class="muted small">(${j.status})</span></td>
      <td>${fmtDate(j.started_at)}</td>
    </tr>
  `).join("") || `<tr><td colspan="8" class="muted">Belum ada pekerjaan.</td></tr>`;
}

function renderOutputs(){
  const outsI = readJSON(STORAGE.outIndicator, []);
  const outsA = readJSON(STORAGE.outAggregate, []);

  // default tampilkan keluaran dari pekerjaan terbaru
  const j = latestJob();
  const jobId = j?.job_id;

  const showI = jobId ? outsI.filter(o => o.job_id === jobId) : outsI.slice(0, 10);
  const showA = jobId ? outsA.filter(o => o.job_id === jobId) : outsA.slice(0, 10);

  const tbI = els.tblIndicator.querySelector("tbody");
  tbI.innerHTML = showI.map(o => `
    <tr>
      <td>${o.job_id}</td>
      <td><b>${escapeHtml(o.action_id)}</b></td>
      <td>${escapeHtml(o.indicator_id)}</td>
      <td>${escapeHtml(o.period_id)}</td>
      <td>${escapeHtml(o.method_used)}</td>
      <td>${escapeHtml(o.readiness_score)}</td>
      <td>${labelYesNo(o.eligibility_flag)}</td>
      <td><b>${o.progress_pct}</b></td>
      <td>${labelQualityFlag(o.quality_flag)}</td>
    </tr>
  `).join("") || `<tr><td colspan="9" class="muted">Belum ada keluaran level indikator.</td></tr>`;

  const tbA = els.tblAggregate.querySelector("tbody");
  tbA.innerHTML = showA.map(a => `
    <tr>
      <td>${a.job_id}</td>
      <td>${escapeHtml(labelScope(a.agg_type))} <span class="muted small">(${escapeHtml(a.agg_type)})</span></td>
      <td><b>${escapeHtml(a.agg_key)}</b></td>
      <td>${escapeHtml(a.period_id)}</td>
      <td>${a.n_actions}</td>
      <td>${a.n_eligible}</td>
      <td><b>${a.progress_pct}</b></td>
      <td class="muted">${escapeHtml(a.notes || "")}</td>
    </tr>
  `).join("") || `<tr><td colspan="8" class="muted">Belum ada keluaran agregat.</td></tr>`;
}

function setActiveTab(name){
  els.tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === name));
  els.tabIndicator.classList.toggle("hidden", name !== "indicator");
  els.tabAggregate.classList.toggle("hidden", name !== "aggregate");
  els.tabJobs.classList.toggle("hidden", name !== "jobs");
}

function runPrecheck(){
  setEngineState("Pra-Pemeriksaan", "warn");
  log("Menjalankan pra-pemeriksaan (gerbang kelayakan)…");

  setStep("ingest", "OK");
  setStep("standardize", "OK");
  setStep("gate", "WARN");
  setStep("compute", "IDLE");
  setStep("aggregate", "IDLE");
  setStep("publish", "IDLE");

  const threshold = getThreshold(els.parameterSet.value);
  const c = countReadiness(loadRecords(), threshold);
  const thrPct = Math.round(threshold * 100);

  log(`Hasil pra-pemeriksaan: disetujui=${c.approved}, layak=${c.eligible} (ambang=${thrPct}%)`);
  log(`Kesenjangan: dikirim=${c.submitted}, dikembalikan=${c.returned}, ditolak=${c.rejected}`);

  setEngineState("Siap", "good");
  updateKPIs();
}

function runJob(){
  const period_id = els.period.value;
  const job_type = els.jobType.value;
  const scope = els.scope.value;
  const scope_id = (els.scopeId.value || "").trim();
  const method_version = els.methodVersion.value;
  const parameter_set_id = els.parameterSet.value;

  const threshold01 = getThreshold(parameter_set_id);
  const thrPct = Math.round(threshold01 * 100);
  const records = loadRecords();

  const job_id = rid("JOB");
  const job = {
    job_id,
    job_type,
    scope,
    scope_id: scope_id || null,
    period_id,
    method_version,
    parameter_set_id,
    triggered_by: "Pengguna (stub)",
    started_at: nowIso(),
    ended_at: null,
    status: "RUNNING",
    log: ""
  };

  // simpan job
  const jobs = readJSON(STORAGE.jobs, []);
  jobs.unshift(job);
  writeJSON(STORAGE.jobs, jobs);

  els.kLastJob.textContent = job_id;

  // animasi pipeline (sederhana)
  setEngineState("Sedang Berjalan", "warn");
  clearPipelineStates();

  log(`Pekerjaan dimulai: ${job_id} jenis=${job_type} cakupan=${scope}${scope_id ? `(${scope_id})` : ""} periode=${period_id}`);
  log(`Metode=${method_version}, SetParameter=${parameter_set_id} (ambang_kesiapan=${thrPct}%)`);

  setStep("ingest", "OK");
  log("Langkah 1 ambil: mengumpulkan record berstatus APPROVED.");

  setStep("standardize", "OK");
  log("Langkah 2 standarisasi: memetakan action_id / indicator_id / location_id / period_id.");

  // gate
  const approved = records.filter(r => (r.status || "").toUpperCase() === "APPROVED");
  const eligible = approved.filter(r => Number(r.readiness || 0) >= thrPct);
  const ineligible = approved.length - eligible.length;

  setStep("gate", eligible.length ? "OK" : "WARN");
  log(`Langkah 3 gerbang: disetujui=${approved.length}, layak=${eligible.length}, tidak_layak=${ineligible}`);

  // compute (stub)
  setStep("compute", eligible.length ? "OK" : "WARN");
  log("Langkah 4 komputasi: (stub) membangkitkan keluaran mengikuti skema…");

  // keluaran palsu per record layak (batasi agar tabel tidak kebesaran)
  const maxRows = 25;
  const rows = eligible.slice(0, maxRows).map(r => {
    const progressPct = mockProgressPct(job_type, r.readiness);
    return {
      out_id: rid("OUT"),
      job_id,
      action_id: r.id?.startsWith("ACT-") ? r.id : (r.action_id || r.id || "ACT-UNKNOWN"),
      indicator_id: r.indicator || r.indicator_id || "IND-NA",
      period_id,
      baseline_value: null,
      target_value: null,
      actual_value: null,
      progress_value: +(progressPct/100).toFixed(2),
      progress_pct: progressPct,
      delta_value: null,
      method_used: "PROGRESS",
      eligibility_flag: true,
      readiness_score: `${Number(r.readiness || 0)}%`,
      quality_flag: (Number(r.readiness||0) >= 85) ? "OK" : "WARN"
    };
  });

  // aggregate mock
  setStep("aggregate", "OK");
  log("Langkah 5 agregasi: (stub) mengagregasi sesuai cakupan…");

  const agg = makeAggregate(job_id, period_id, scope, scope_id, rows);

  setStep("publish", "OK");
  log("Langkah 6 publikasi: menyimpan keluaran dengan jejak asal-usul (job_id, method_version, parameter_set_id).");

  // persist outputs
  const outI = readJSON(STORAGE.outIndicator, []);
  writeJSON(STORAGE.outIndicator, [...rows, ...outI]);

  const outA = readJSON(STORAGE.outAggregate, []);
  writeJSON(STORAGE.outAggregate, [agg, ...outA]);

  // selesai
  job.status = "SUCCEEDED";
  job.ended_at = nowIso();
  job.log = `layak=${eligible.length}, keluaran=${rows.length}`;
  jobs[0] = job;
  writeJSON(STORAGE.jobs, jobs);

  setEngineState("Berhasil", "good");
  updateKPIs();
  renderJobs();
  renderOutputs();
}

function mockProgressPct(jobType, readinessPct){
  // hanya ilustrasi, BUKAN rumus resmi
  const base = Math.max(10, Math.min(95, Math.round(Number(readinessPct || 60) - 10)));
  const jitter = Math.round((Math.random()*10) - 5);
  const add = jobType === "FULL_RUN" ? 3 : 0;
  return Math.max(0, Math.min(100, base + jitter + add));
}

function makeAggregate(job_id, period_id, scope, scope_id, rows){
  const n = rows.length;
  const mean = n ? Math.round(rows.reduce((a,r)=>a+Number(r.progress_pct||0),0)/n) : 0;
  const key = scope === "NATIONAL" ? "NATIONAL" : (scope_id || `${scope}-UNSPEC`);
  return {
    agg_id: rid("AGG"),
    job_id,
    period_id,
    agg_type: scope === "ACTION" ? "NATIONAL" : scope, // stub sederhana
    agg_key: key,
    progress_value: +(mean/100).toFixed(2),
    progress_pct: mean,
    n_actions: n,
    n_eligible: n,
    notes: "Agregasi stub (hanya frontend)"
  };
}

function clearPipelineStates(){
  PIPELINE.forEach(s => s.state = "IDLE");
  renderPipeline();
}

function resetEngine(){
  if (!confirm("Atur ulang status UI mesin komputasi? (pekerjaan tersimpan tidak dihapus)")) return;
  clearPipelineStates();
  setEngineState("Tidak aktif", "");
  updateKPIs();
  log("Mesin komputasi diatur ulang (status UI).");
}

function runSearch(){
  const qRaw = (els.globalSearch.value || "").trim();
  const q = qRaw.toLowerCase();
  if (!q) return;

  const scope = els.searchScope.value;
  const jobs = readJSON(STORAGE.jobs, []);
  const outsI = readJSON(STORAGE.outIndicator, []);
  const outsA = readJSON(STORAGE.outAggregate, []);

  const res = [];

  if (scope === "all" || scope === "jobs"){
    const hit = jobs.filter(j =>
      (`${j.job_id} ${j.scope} ${j.period_id} ${j.method_version} ${j.parameter_set_id} ${j.status}`.toLowerCase()).includes(q)
    );
    res.push(section("Pekerjaan", hit.map(h => `${h.job_id} • ${labelJobStatus(h.status)} • ${h.period_id}`)));
  }

  if (scope === "all" || scope === "outputs"){
    const hitI = outsI.filter(o =>
      (`${o.job_id} ${o.action_id} ${o.indicator_id} ${o.period_id}`.toLowerCase()).includes(q)
    );
    const hitA = outsA.filter(a =>
      (`${a.job_id} ${a.agg_type} ${a.agg_key} ${a.period_id}`.toLowerCase()).includes(q)
    );
    res.push(section("Keluaran (Level Indikator)", hitI.slice(0,12).map(x => `${x.action_id} • ${x.indicator_id} • ${x.progress_pct}%`)));
    res.push(section("Keluaran (Agregat)", hitA.slice(0,12).map(x => `${x.agg_type}:${x.agg_key} • ${x.progress_pct}%`)));
  }

  if (scope === "all" || scope === "help"){
    const helpItems = [];
    if (q.includes("metode") || q.includes("method")){
      helpItems.push("Versi metode: gunakan penamaan impact_v1, impact_v1_1, dst. untuk pelacakan perubahan.");
    }
    if (q.includes("parameter") || q.includes("threshold") || q.includes("ambang")){
      helpItems.push("Set parameter: default_v1 (≥80%), strict_v1 (≥90%) untuk gerbang kesiapan.");
    }
    res.push(section("Bantuan", helpItems));
  }

  els.searchTitle.textContent = `Hasil Pencarian: "${qRaw}"`;
  els.searchBody.innerHTML = res.join("") || `<div class="muted">Tidak ada hasil.</div>`;
  modal(els.searchModal, true);
}

function section(title, items){
  const arr = (items || []).filter(Boolean);
  return `
    <div style="margin-bottom:12px">
      <div style="font-weight:900; margin-bottom:6px">${title} (${arr.length})</div>
      ${arr.length ? `<ul>${arr.map(i => `<li>${escapeHtml(i)}</li>`).join("")}</ul>` : `<div class="muted">Tidak ada hasil</div>`}
    </div>
  `;
}

function escapeHtml(s){
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function bindTabs(){
  els.tabs.forEach(t => t.addEventListener("click", () => setActiveTab(t.dataset.tab)));
}

function showApiContract(){
  const body = {
    job_type: els.jobType.value,
    period_id: els.period.value,
    scope: els.scope.value,
    scope_id: (els.scopeId.value || "").trim() || null,
    method_version: els.methodVersion.value,
    parameter_set_id: els.parameterSet.value
  };

  els.apiPost.textContent = JSON.stringify({
    permintaan: "POST /engine/jobs",
    body,
    contoh_respons: { job_id: "JOB-XXXX", status: "RUNNING" }
  }, null, 2);

  els.apiGet.textContent = JSON.stringify({
    permintaan: "GET /engine/jobs/JOB-XXXX",
    contoh_respons: {
      job_id: "JOB-XXXX",
      status: "SUCCEEDED",
      started_at: nowIso(),
      ended_at: nowIso(),
      outputs: {
        indicator: { endpoint: "/engine/outputs?type=indicator&job_id=JOB-XXXX" },
        aggregate: { endpoint: "/engine/outputs?type=aggregate&job_id=JOB-XXXX" }
      }
    }
  }, null, 2);

  els.apiOutputs.textContent = JSON.stringify({
    permintaan: "GET /engine/outputs",
    parameter_query: {
      type: "indicator|aggregate",
      job_id: "JOB-XXXX",
      period_id: els.period.value,
      scope: els.scope.value,
      scope_id: (els.scopeId.value || "").trim() || null
    },
    contoh_respons: [
      { out_id:"OUT-..", job_id:"JOB-..", action_id:"ACT-..", indicator_id:"IND-..", progress_pct: 72, eligibility_flag:true }
    ]
  }, null, 2);

  modal(els.apiModal, true);
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

function init(){
  renderPipeline();
  setEngineState("Tidak aktif", "");
  els.logbox.textContent = readJSON(STORAGE.engineLogs, []).join("\n");
  updateKPIs();
  renderJobs();
  renderOutputs();
  bindTabs();
  sidebarBehavior();

  els.clearLogs.addEventListener("click", clearLogs);
  els.resetEngine.addEventListener("click", resetEngine);
  els.dryCheckBtn.addEventListener("click", runPrecheck);
  els.runBtn.addEventListener("click", runJob);

  els.parameterSet.addEventListener("change", updateKPIs);

  els.searchBtn.addEventListener("click", runSearch);
  els.globalSearch.addEventListener("keydown", (e)=>{ if(e.key==="Enter") runSearch(); });
  els.closeSearch.addEventListener("click", ()=> modal(els.searchModal, false));

  els.openApiBtn.addEventListener("click", showApiContract);
  els.closeApi.addEventListener("click", ()=> modal(els.apiModal, false));

  // toggle bahasa (stub)
  els.langToggle.addEventListener("click", ()=>{
    els.langToggle.textContent = (els.langToggle.textContent === "ID") ? "EN" : "ID";
  });

  // default tab
  setActiveTab("indicator");

  // info pekerjaan terakhir
  const lj = latestJob();
  els.kLastJob.textContent = lj ? lj.job_id : "—";
}

init();
