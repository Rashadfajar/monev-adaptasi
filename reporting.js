// Reporting & Export UI (frontend-only)
// Membaca hasil Impact Engine dari localStorage:
// - impact_jobs
// - impact_output_indicator
// - impact_output_aggregate
//
// Menyediakan tampilan BTR, NC, keluaran mentah, dan ekspor (CSV/JSON)
// dengan metadata jejak audit (job_id, method_version, parameter_set_id, period_id, filters).

const $ = (id) => document.getElementById(id);

const els = {
  dataState: $("dataState"),
  refreshBtn: $("refreshBtn"),

  reportMode: $("reportMode"),
  period: $("period"),
  jobId: $("jobId"),
  scope: $("scope"),
  keyFilter: $("keyFilter"),
  eligibleOnly: $("eligibleOnly"),

  applyBtn: $("applyBtn"),
  resetBtn: $("resetBtn"),
  openMetaBtn: $("openMetaBtn"),

  kJob: $("kJob"),
  kMethod: $("kMethod"),
  kParam: $("kParam"),
  kPeriod: $("kPeriod"),
  kCountI: $("kCountI"),
  kCountA: $("kCountA"),
  kHeadline: $("kHeadline"),
  narrativeBox: $("narrativeBox"),

  tagMode: $("tagMode"),
  tagEligible: $("tagEligible"),

  tblBTR: $("tblBTR"),
  tblNC: $("tblNC"),
  tblRaw: $("tblRaw"),

  exportCsvBtn: $("exportCsvBtn"),
  exportJsonBtn: $("exportJsonBtn"),
  copyNarrativeBtn: $("copyNarrativeBtn"),
  exportLog: $("exportLog"),

  tabs: Array.from(document.querySelectorAll(".tab")),
  tabBTR: $("tab-btr"),
  tabNC: $("tab-nc"),
  tabRaw: $("tab-raw"),

  // search
  globalSearch: $("globalSearch"),
  searchScope: $("searchScope"),
  searchBtn: $("searchBtn"),
  searchModal: $("searchModal"),
  searchTitle: $("searchTitle"),
  searchBody: $("searchBody"),
  closeSearch: $("closeSearch"),

  // meta modal
  metaModal: $("metaModal"),
  closeMeta: $("closeMeta"),
  metaJob: $("metaJob"),
  metaManifest: $("metaManifest"),

  // lang toggle
  langToggle: $("langToggle"),
};

const STORAGE = {
  jobs: "impact_jobs",
  outIndicator: "impact_output_indicator",
  outAggregate: "impact_output_aggregate",
};

function readJSON(key, fallback){
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}

function modal(el, show){
  el.classList.toggle("hidden", !show);
}

function fmtDate(iso){
  if(!iso) return "—";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const da = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${da}`;
}

function escapeHtml(s){
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
}

function setActiveTab(name){
  els.tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === name));
  els.tabBTR.classList.toggle("hidden", name !== "btr");
  els.tabNC.classList.toggle("hidden", name !== "nc");
  els.tabRaw.classList.toggle("hidden", name !== "raw");
}

function unique(arr){
  return Array.from(new Set(arr));
}

function getLatestJob(jobs){
  return jobs[0] || null;
}

function hydrateSelectors(){
  const jobs = readJSON(STORAGE.jobs, []);
  const periods = unique(jobs.map(j => j.period_id)).filter(Boolean);

  // period options (fallback if empty)
  els.period.innerHTML = (periods.length ? periods : ["2026-S1"])
    .map(p => `<option value="${p}">${p}</option>`)
    .join("");

  // jobs selector
  els.jobId.innerHTML = jobs.length
    ? jobs.map(j => `<option value="${j.job_id}">${j.job_id} • ${j.status} • ${j.period_id}</option>`).join("")
    : `<option value="">— Belum ada pekerjaan (jalankan Komputasi/Impact Engine) —</option>`;

  // auto-select latest
  const latest = getLatestJob(jobs);
  if (latest){
    els.period.value = latest.period_id;
    els.jobId.value = latest.job_id;
  }
}

function currentFilters(){
  return {
    mode: els.reportMode.value,
    period_id: els.period.value,
    job_id: els.jobId.value,
    scope: els.scope.value,
    key: (els.keyFilter.value || "").trim(),
    eligibleOnly: els.eligibleOnly.value === "YES",
  };
}

function applyFilters(){
  const f = currentFilters();

  // tampil di tag (UI)
  els.tagMode.textContent = `MODUS: ${f.mode}`;
  els.tagEligible.textContent = `LAYAK: ${f.eligibleOnly ? "YA" : "TIDAK"}`;

  const jobs = readJSON(STORAGE.jobs, []);
  const outsI = readJSON(STORAGE.outIndicator, []);
  const outsA = readJSON(STORAGE.outAggregate, []);

  const job = jobs.find(j => j.job_id === f.job_id) || getLatestJob(jobs);

  if (!job){
    setState("Belum ada pekerjaan", "warn");
    renderEmptyTables();
    fillSummary(null, [], [], f);
    return;
  }

  // base filter by job_id and period
  let fi = outsI.filter(o => o.job_id === job.job_id && o.period_id === f.period_id);
  let fa = outsA.filter(a => a.job_id === job.job_id && a.period_id === f.period_id);

  // eligible filter
  if (f.eligibleOnly){
    fi = fi.filter(o => !!o.eligibility_flag);
    // aggregate rows sudah banyak yang mewakili eligible, biarkan apa adanya
  }

  // scope filter (utamanya untuk agregat)
  if (f.scope !== "ALL"){
    // UI stub: agg_type dianggap scope
    fa = fa.filter(a => (a.agg_type || "").toUpperCase() === f.scope.toUpperCase());
  }

  // key filter
  if (f.key){
    const q = f.key.toLowerCase();
    fa = fa.filter(a => (`${a.agg_key}`.toLowerCase()).includes(q));
    fi = fi.filter(o => (`${o.action_id} ${o.indicator_id}`.toLowerCase()).includes(q));
  }

  setState("Ready", "good");
  renderTables(job, fi, fa, f);
  fillSummary(job, fi, fa, f);
}

function setState(text, cls){
  els.dataState.textContent = `● ${text}`;
  els.dataState.className = "pill " + (cls || "");
}

function renderEmptyTables(){
  els.tblBTR.querySelector("tbody").innerHTML = `<tr><td colspan="6" class="muted">Tidak ada data.</td></tr>`;
  els.tblNC.querySelector("tbody").innerHTML = `<tr><td colspan="6" class="muted">Tidak ada data.</td></tr>`;
  els.tblRaw.querySelector("tbody").innerHTML = `<tr><td colspan="7" class="muted">Tidak ada data.</td></tr>`;
}

function headlineFromAggregates(fa){
  // pilih NATIONAL jika ada, kalau tidak ambil baris pertama
  const nat = fa.find(a => (a.agg_key || "").toUpperCase() === "NATIONAL");
  const row = nat || fa[0];
  if (!row) return null;
  return row.progress_pct;
}

function fillSummary(job, fi, fa, f){
  els.kJob.textContent = job ? job.job_id : "—";
  els.kMethod.textContent = job ? job.method_version : "—";
  els.kParam.textContent = job ? job.parameter_set_id : "—";
  els.kPeriod.textContent = f.period_id || "—";
  els.kCountI.textContent = fi.length;
  els.kCountA.textContent = fa.length;

  const headline = headlineFromAggregates(fa);
  els.kHeadline.textContent = (headline == null) ? "—" : `${headline}%`;

  const narrative = buildNarrative(job, fi, fa, f);
  els.narrativeBox.innerHTML = narrative;
}

function buildNarrative(job, fi, fa, f){
  if (!job){
    return `<b>Draf narasi:</b> Belum ada pekerjaan Impact Engine. Jalankan Komputasi terlebih dahulu.`;
  }

  const headline = headlineFromAggregates(fa);
  const period = f.period_id;

  const eligibleText = f.eligibleOnly ? "hanya yang layak" : "termasuk yang tidak layak";
  const scopeText = (f.scope === "ALL") ? "semua cakupan" : `cakupan ${escapeHtml(f.scope)}`;

  if (f.mode === "BTR"){
    return `
      <b>Draf narasi (BTR):</b><br/>
      Pada periode <b>${escapeHtml(period)}</b>, sistem MoNEv Adaptasi menyajikan ringkasan kemajuan adaptasi
      berbasis keluaran komputasi (pekerjaan <b>${escapeHtml(job.job_id)}</b>) dengan jejak audit metode
      <b>${escapeHtml(job.method_version)}</b> dan parameter <b>${escapeHtml(job.parameter_set_id)}</b>.
      Keluaran mencakup <b>${fi.length}</b> baris indikator (${eligibleText}) dan <b>${fa.length}</b> baris agregasi (${scopeText}).
      Kemajuan utama tercatat <b>${headline == null ? "—" : headline + "%"}</b> (berdasarkan agregasi nasional jika tersedia).<br/>
      <span class="muted">Catatan: angka ini adalah indikator kemajuan berbasis data tervalidasi, bukan klaim atribusi kausal penuh.</span>
    `;
  }

  return `
    <b>Draf narasi (Komunikasi Nasional/NC):</b><br/>
    Untuk pelaporan Komunikasi Nasional pada periode <b>${escapeHtml(period)}</b>, ringkasan kemajuan adaptasi dihimpun
    dari keluaran Impact Engine (pekerjaan <b>${escapeHtml(job.job_id)}</b>) yang terdokumentasi dengan versi metode
    <b>${escapeHtml(job.method_version)}</b> dan set parameter <b>${escapeHtml(job.parameter_set_id)}</b>.
    Analisis mencakup <b>${fi.length}</b> keluaran indikator (${eligibleText}) dan <b>${fa.length}</b> agregasi sektor/wilayah
    untuk mendukung narasi capaian, pembelajaran, dan kebutuhan tindak lanjut.
    Kemajuan utama yang dapat dipakai sebagai ringkasan nasional adalah <b>${headline == null ? "—" : headline + "%"}</b>
    (jika agregasi nasional tersedia).<br/>
    <span class="muted">Catatan: hasil agregasi disajikan untuk transparansi dan konsistensi pelaporan lintas periode.</span>
  `;
}

function renderTables(job, fi, fa, f){
  // --- BTR view table ---
  const btrRows = fa.length ? fa : [{
    job_id: job.job_id, period_id: f.period_id, agg_type: "NATIONAL", agg_key: "NATIONAL",
    progress_pct: "—", n_eligible: fi.length
  }];

  const btrBody = els.tblBTR.querySelector("tbody");
  btrBody.innerHTML = btrRows.map(r => `
    <tr>
      <td>${escapeHtml(r.period_id)}</td>
      <td>${escapeHtml(r.agg_type || "—")}</td>
      <td><b>${escapeHtml(r.agg_key || "—")}</b></td>
      <td><b>${escapeHtml(r.progress_pct ?? "—")}</b></td>
      <td>${escapeHtml(r.n_eligible ?? "—")}</td>
      <td>${escapeHtml(r.job_id || job.job_id)}</td>
    </tr>
  `).join("");

  // --- NC view table ---
  const ncRows = fa.filter(a => (a.agg_key || "").toUpperCase() !== "NATIONAL");
  const useNc = ncRows.length ? ncRows : fa;

  const ncBody = els.tblNC.querySelector("tbody");
  ncBody.innerHTML = useNc.length ? useNc.map(r => `
    <tr>
      <td>${escapeHtml(r.period_id)}</td>
      <td><b>${escapeHtml(r.agg_key || "—")}</b> <span class="muted">(${escapeHtml(r.agg_type || "—")})</span></td>
      <td><b>${escapeHtml(r.progress_pct ?? "—")}</b></td>
      <td>${escapeHtml(r.n_actions ?? "—")}</td>
      <td>${escapeHtml(r.n_eligible ?? "—")}</td>
      <td class="muted">${escapeHtml(r.notes || "")}</td>
    </tr>
  `).join("") : `<tr><td colspan="6" class="muted">Tidak ada data agregat untuk tampilan NC.</td></tr>`;

  // --- Raw outputs ---
  const raw = [];
  fa.forEach(a => raw.push({
    type: "AGREGAT",
    job_id: a.job_id,
    key: `${a.agg_type}:${a.agg_key}`,
    level: a.period_id,
    progress: a.progress_pct,
    eligible: "—",
    quality: "—"
  }));

  fi.slice(0, 200).forEach(o => raw.push({
    type: "INDIKATOR",
    job_id: o.job_id,
    key: `${o.action_id}`,
    level: o.indicator_id,
    progress: o.progress_pct,
    eligible: o.eligibility_flag ? "YA" : "TIDAK",
    quality: o.quality_flag || "—"
  }));

  const rawBody = els.tblRaw.querySelector("tbody");
  rawBody.innerHTML = raw.length ? raw.map(r => `
    <tr>
      <td>${escapeHtml(r.type)}</td>
      <td>${escapeHtml(r.job_id)}</td>
      <td><b>${escapeHtml(r.key)}</b></td>
      <td>${escapeHtml(r.level)}</td>
      <td><b>${escapeHtml(r.progress ?? "—")}</b></td>
      <td>${escapeHtml(r.eligible)}</td>
      <td>${escapeHtml(r.quality)}</td>
    </tr>
  `).join("") : `<tr><td colspan="7" class="muted">Tidak ada rincian output.</td></tr>`;
}

function exportDataset(){
  const f = currentFilters();
  const jobs = readJSON(STORAGE.jobs, []);
  const outsI = readJSON(STORAGE.outIndicator, []);
  const outsA = readJSON(STORAGE.outAggregate, []);
  const job = jobs.find(j => j.job_id === f.job_id) || getLatestJob(jobs);

  if (!job) return { manifest:null, data: { indicator: [], aggregate: [] } };

  let fi = outsI.filter(o => o.job_id === job.job_id && o.period_id === f.period_id);
  let fa = outsA.filter(a => a.job_id === job.job_id && a.period_id === f.period_id);

  if (f.eligibleOnly) fi = fi.filter(o => !!o.eligibility_flag);
  if (f.scope !== "ALL") fa = fa.filter(a => (a.agg_type || "").toUpperCase() === f.scope.toUpperCase());

  if (f.key){
    const q = f.key.toLowerCase();
    fa = fa.filter(a => (`${a.agg_key}`.toLowerCase()).includes(q));
    fi = fi.filter(o => (`${o.action_id} ${o.indicator_id}`.toLowerCase()).includes(q));
  }

  const manifest = {
    exported_at: new Date().toISOString(),
    report_mode: f.mode,
    filters: f,
    lineage: {
      job_id: job.job_id,
      period_id: job.period_id,
      method_version: job.method_version,
      parameter_set_id: job.parameter_set_id,
      job_type: job.job_type,
      scope: job.scope,
      scope_id: job.scope_id
    },
    counts: { indicator: fi.length, aggregate: fa.length }
  };

  return { manifest, data: { indicator: fi, aggregate: fa } };
}

function downloadText(filename, text, mime="text/plain"){
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 800);
}

function toCSV(rows, cols){
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const head = cols.map(c => esc(c)).join(",");
  const body = rows.map(r => cols.map(c => esc(r[c])).join(",")).join("\n");
  return head + "\n" + body;
}

function exportCSV(){
  const pack = exportDataset();
  if (!pack.manifest){
    logExport("Tidak ada pekerjaan terpilih. Jalankan Komputasi/Impact Engine terlebih dahulu.");
    return;
  }

  const { manifest, data } = pack;
  const baseName = `MoNEv_${manifest.report_mode}_${manifest.lineage.period_id}_${manifest.lineage.job_id}`;

  const indCols = [
    "job_id","action_id","indicator_id","period_id","method_used",
    "readiness_score","eligibility_flag","progress_value","progress_pct","quality_flag"
  ];
  const indCsv = toCSV(data.indicator, indCols);
  downloadText(`${baseName}_indicator.csv`, indCsv, "text/csv");

  const aggCols = [
    "job_id","agg_type","agg_key","period_id","n_actions","n_eligible","progress_value","progress_pct","notes"
  ];
  const aggCsv = toCSV(data.aggregate, aggCols);
  downloadText(`${baseName}_aggregate.csv`, aggCsv, "text/csv");

  downloadText(`${baseName}_manifest.json`, JSON.stringify(manifest, null, 2), "application/json");

  logExport(`Ekspor CSV selesai: ${baseName}_indicator.csv, ${baseName}_aggregate.csv + manifest.json`);
}

function exportJSON(){
  const pack = exportDataset();
  if (!pack.manifest){
    logExport("Tidak ada pekerjaan terpilih. Jalankan Komputasi/Impact Engine terlebih dahulu.");
    return;
  }
  const { manifest, data } = pack;
  const baseName = `MoNEv_${manifest.report_mode}_${manifest.lineage.period_id}_${manifest.lineage.job_id}`;
  const payload = { manifest, data };
  downloadText(`${baseName}.json`, JSON.stringify(payload, null, 2), "application/json");
  logExport(`Ekspor JSON selesai: ${baseName}.json`);
}

function copyNarrative(){
  const txt = els.narrativeBox.innerText || "";
  navigator.clipboard.writeText(txt).then(()=>{
    logExport("Narasi berhasil disalin ke clipboard.");
  }).catch(()=>{
    logExport("Gagal menyalin (izin browser). Silakan salin secara manual.");
  });
}

function logExport(line){
  const prev = els.exportLog.textContent || "";
  const stamp = `[${new Date().toLocaleString()}] `;
  els.exportLog.textContent = (prev ? prev + "\n" : "") + stamp + line;
  els.exportLog.scrollTop = els.exportLog.scrollHeight;
}

function openMeta(){
  const pack = exportDataset();
  if (!pack.manifest){
    els.metaJob.textContent = "Tidak ada pekerjaan terpilih.";
    els.metaManifest.textContent = "—";
    modal(els.metaModal, true);
    return;
  }
  const jobs = readJSON(STORAGE.jobs, []);
  const job = jobs.find(j => j.job_id === pack.manifest.lineage.job_id);

  els.metaJob.textContent = JSON.stringify(job, null, 2);
  els.metaManifest.textContent = JSON.stringify(pack.manifest, null, 2);
  modal(els.metaModal, true);
}

function runSearch(){
  const q = (els.globalSearch.value || "").trim().toLowerCase();
  if (!q) return;

  const scope = els.searchScope.value;
  const jobs = readJSON(STORAGE.jobs, []);
  const outsI = readJSON(STORAGE.outIndicator, []);
  const outsA = readJSON(STORAGE.outAggregate, []);

  const res = [];

  if (scope === "all" || scope === "jobs"){
    const hit = jobs.filter(j => (`${j.job_id} ${j.scope} ${j.period_id} ${j.method_version} ${j.parameter_set_id}`.toLowerCase()).includes(q));
    res.push(section("Pekerjaan", hit.map(h => `${h.job_id} • ${h.status} • ${h.period_id}`)));
  }
  if (scope === "all" || scope === "indicator"){
    const hit = outsI.filter(o => (`${o.job_id} ${o.action_id} ${o.indicator_id} ${o.period_id}`.toLowerCase()).includes(q));
    res.push(section("Keluaran indikator", hit.slice(0,15).map(x => `${x.action_id} • ${x.indicator_id} • ${x.progress_pct}% • layak=${x.eligibility_flag}`)));
  }
  if (scope === "all" || scope === "aggregate"){
    const hit = outsA.filter(a => (`${a.job_id} ${a.agg_type} ${a.agg_key} ${a.period_id}`.toLowerCase()).includes(q));
    res.push(section("Keluaran agregat", hit.slice(0,15).map(x => `${x.agg_type}:${x.agg_key} • ${x.progress_pct}%`)));
  }
  if (scope === "all" || scope === "help"){
    res.push(section("Bantuan", [
      "Tampilan BTR: menonjolkan kemajuan utama nasional + ringkasan agregasi.",
      "Tampilan NC: menonjolkan rincian sektor/wilayah untuk narasi evaluatif & pembelajaran.",
      "Ekspor selalu menghasilkan manifest.json untuk jejak audit."
    ].filter(x => x.toLowerCase().includes(q) || q.length < 3)));
  }

  els.searchTitle.textContent = `Hasil Pencarian: "${els.globalSearch.value}"`;
  els.searchBody.innerHTML = res.join("") || `<div class="muted">Tidak ada hasil.</div>`;
  modal(els.searchModal, true);
}

function section(title, items){
  const arr = (items || []).filter(Boolean);
  return `
    <div style="margin-bottom:12px">
      <div style="font-weight:900; margin-bottom:6px">${title} (${arr.length})</div>
      ${arr.length ? `<ul>${arr.map(i => `<li>${escapeHtml(i)}</li>`).join("")}</ul>` : `<div class="muted">Tidak ada hasil.</div>`}
    </div>
  `;
}


// ---------- Sidebar toggle (opsional; aman walau elemennya belum ada) ----------
function sidebarBehavior() {
  const btn = document.getElementById("burgerBtn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  if (!btn || !sidebar) return;

  const isMobile = () => window.matchMedia("(max-width: 980px)").matches;

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
  // tabs
  els.tabs.forEach(t => t.addEventListener("click", ()=> setActiveTab(t.dataset.tab)));
  setActiveTab("btr");

  hydrateSelectors();
  sidebarBehavior();

  // mode (UI-only)
  els.reportMode.addEventListener("change", ()=> {
    els.tagMode.textContent = `MODUS: ${els.reportMode.value}`;
  });

  // actions
  els.applyBtn.addEventListener("click", applyFilters);
  els.resetBtn.addEventListener("click", ()=>{
    const jobs = readJSON(STORAGE.jobs, []);
    const latest = getLatestJob(jobs);
    els.reportMode.value = "BTR";
    els.scope.value = "ALL";
    els.keyFilter.value = "";
    els.eligibleOnly.value = "YES";
    if (latest){
      els.period.value = latest.period_id;
      els.jobId.value = latest.job_id;
    }
    applyFilters();
    logExport("Filter diatur ulang.");
  });

  els.refreshBtn.addEventListener("click", ()=>{
    hydrateSelectors();
    applyFilters();
    logExport("Data dimuat ulang dari localStorage.");
  });

  els.exportCsvBtn.addEventListener("click", exportCSV);
  els.exportJsonBtn.addEventListener("click", exportJSON);
  els.copyNarrativeBtn.addEventListener("click", copyNarrative);

  els.openMetaBtn.addEventListener("click", openMeta);
  els.closeMeta.addEventListener("click", ()=> modal(els.metaModal, false));

  // search
  els.searchBtn.addEventListener("click", runSearch);
  els.globalSearch.addEventListener("keydown", (e)=>{ if(e.key==="Enter") runSearch(); });
  els.closeSearch.addEventListener("click", ()=> modal(els.searchModal, false));

  // lang toggle (placeholder)
  els.langToggle.addEventListener("click", ()=>{
    els.langToggle.textContent = (els.langToggle.textContent === "ID") ? "EN" : "ID";
  });

  // initial apply
  applyFilters();
  els.exportLog.textContent = "";
}

init();
