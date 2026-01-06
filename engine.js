// Impact Engine UI (frontend-only)
// - pipeline steps + run controls
// - dry pre-check: counts approved vs missing
// - job run stub: generates fake outputs following schema
// - persists to localStorage: impact_jobs, impact_output_indicator, impact_output_aggregate
//
// IMPORTANT: no formulas computed here (only mock numbers). Backend will do official computations.

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
  records: "monev_records",              // merged records from review.js
  jobs: "impact_jobs",
  outIndicator: "impact_output_indicator",
  outAggregate: "impact_output_aggregate",
  engineLogs: "impact_engine_logs",
};

const PIPELINE = [
  { id:"ingest", title:"1) Ingest Approved Inputs", desc:"Ambil data APPROVED dari Horizontal & Vertical (latest review).", state:"IDLE" },
  { id:"standardize", title:"2) Standardize & Map Keys", desc:"Normalize action_id, indicator_id, location_id, period_id.", state:"IDLE" },
  { id:"gate", title:"3) Readiness & Eligibility Gate", desc:"Filter record eligible sesuai parameter threshold.", state:"IDLE" },
  { id:"compute", title:"4) Compute (Backend)", desc:"Jalankan formula set (progress / delta / others).", state:"IDLE" },
  { id:"aggregate", title:"5) Aggregate", desc:"Hitung agregasi sektor/wilayah/nasional.", state:"IDLE" },
  { id:"publish", title:"6) Publish Outputs", desc:"Simpan outputs + lineage (job_id, method_version).", state:"IDLE" },
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
      <div class="${badgeClass(s.state)}">${s.state}</div>
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
  // records are maintained by review module; include statuses
  return readJSON(STORAGE.records, []);
}

function countReadiness(records, threshold){
  const approved = records.filter(r => (r.status || "").toUpperCase() === "APPROVED");
  const returned = records.filter(r => (r.status || "").toUpperCase() === "RETURNED");
  const rejected = records.filter(r => (r.status || "").toUpperCase() === "REJECTED");
  const submitted = records.filter(r => (r.status || "").toUpperCase() === "SUBMITTED");

  // readiness heuristic for UI only (not official): based on readiness field if present, else 0
  const eligible = approved.filter(r => Number(r.readiness || 0) >= threshold);

  return {
    approved: approved.length,
    eligible: eligible.length,
    returned: returned.length,
    rejected: rejected.length,
    submitted: submitted.length
  };
}

function getThreshold(paramSet){
  // parameter sets from data dictionary
  // default_v1: 0.8; strict_v1: 0.9
  if (paramSet.startsWith("strict")) return 0.9;
  return 0.8;
}

function updateKPIs(){
  const threshold = getThreshold(els.parameterSet.value);
  const records = loadRecords();
  const c = countReadiness(records, threshold);
  els.kReady.textContent = `${c.approved} approved / ${c.eligible} eligible (≥${Math.round(threshold*100)}%)`;
  els.kMissing.textContent = `${c.submitted} submitted, ${c.returned} returned, ${c.rejected} rejected`;
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
      <td>${j.job_type}</td>
      <td>${j.scope}${j.scope_id ? ` • ${j.scope_id}` : ""}</td>
      <td>${j.period_id}</td>
      <td>${j.method_version}</td>
      <td>${j.parameter_set_id}</td>
      <td>${j.status}</td>
      <td>${fmtDate(j.started_at)}</td>
    </tr>
  `).join("") || `<tr><td colspan="8" class="muted">No jobs yet.</td></tr>`;
}

function renderOutputs(){
  const outsI = readJSON(STORAGE.outIndicator, []);
  const outsA = readJSON(STORAGE.outAggregate, []);

  // latest job filter (show latest by default)
  const j = latestJob();
  const jobId = j?.job_id;

  const showI = jobId ? outsI.filter(o => o.job_id === jobId) : outsI.slice(0, 10);
  const showA = jobId ? outsA.filter(o => o.job_id === jobId) : outsA.slice(0, 10);

  const tbI = els.tblIndicator.querySelector("tbody");
  tbI.innerHTML = showI.map(o => `
    <tr>
      <td>${o.job_id}</td>
      <td><b>${o.action_id}</b></td>
      <td>${o.indicator_id}</td>
      <td>${o.period_id}</td>
      <td>${o.method_used}</td>
      <td>${o.readiness_score}</td>
      <td>${o.eligibility_flag ? "YES" : "NO"}</td>
      <td><b>${o.progress_pct}</b></td>
      <td>${o.quality_flag}</td>
    </tr>
  `).join("") || `<tr><td colspan="9" class="muted">No indicator outputs yet.</td></tr>`;

  const tbA = els.tblAggregate.querySelector("tbody");
  tbA.innerHTML = showA.map(a => `
    <tr>
      <td>${a.job_id}</td>
      <td>${a.agg_type}</td>
      <td><b>${a.agg_key}</b></td>
      <td>${a.period_id}</td>
      <td>${a.n_actions}</td>
      <td>${a.n_eligible}</td>
      <td><b>${a.progress_pct}</b></td>
      <td class="muted">${a.notes || ""}</td>
    </tr>
  `).join("") || `<tr><td colspan="8" class="muted">No aggregate outputs yet.</td></tr>`;
}

function setActiveTab(name){
  els.tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === name));
  els.tabIndicator.classList.toggle("hidden", name !== "indicator");
  els.tabAggregate.classList.toggle("hidden", name !== "aggregate");
  els.tabJobs.classList.toggle("hidden", name !== "jobs");
}

function runPrecheck(){
  setEngineState("Pre-check", "warn");
  log("Running pre-check (eligibility gate)…");

  setStep("ingest", "OK");
  setStep("standardize", "OK");
  setStep("gate", "WARN");
  setStep("compute", "IDLE");
  setStep("aggregate", "IDLE");
  setStep("publish", "IDLE");

  const threshold = getThreshold(els.parameterSet.value);
  const c = countReadiness(loadRecords(), threshold);
  log(`Pre-check results: approved=${c.approved}, eligible=${c.eligible} (threshold=${threshold})`);
  log(`Gaps: submitted=${c.submitted}, returned=${c.returned}, rejected=${c.rejected}`);

  setEngineState("Ready", "good");
  updateKPIs();
}

function runJob(){
  const period_id = els.period.value;
  const job_type = els.jobType.value;
  const scope = els.scope.value;
  const scope_id = (els.scopeId.value || "").trim();
  const method_version = els.methodVersion.value;
  const parameter_set_id = els.parameterSet.value;

  const threshold = getThreshold(parameter_set_id);
  const records = loadRecords();

  // simulate
  const job_id = rid("JOB");
  const job = {
    job_id,
    job_type,
    scope,
    scope_id: scope_id || null,
    period_id,
    method_version,
    parameter_set_id,
    triggered_by: "User (stub)",
    started_at: nowIso(),
    ended_at: null,
    status: "RUNNING",
    log: ""
  };

  // store job
  const jobs = readJSON(STORAGE.jobs, []);
  jobs.unshift(job);
  writeJSON(STORAGE.jobs, jobs);

  els.kLastJob.textContent = job_id;

  // pipeline animation (simple)
  setEngineState("Running", "warn");
  clearPipelineStates();
  log(`Job started: ${job_id} type=${job_type} scope=${scope}${scope_id?`(${scope_id})`:""} period=${period_id}`);
  log(`Method=${method_version}, ParamSet=${parameter_set_id} (readiness_threshold=${threshold})`);

  setStep("ingest", "OK");
  log("Step 1 ingest: collected APPROVED submissions.");

  setStep("standardize", "OK");
  log("Step 2 standardize: mapped action_id / indicator_id / location_id / period_id.");

  // gate
  const approved = records.filter(r => (r.status || "").toUpperCase() === "APPROVED");
  const eligible = approved.filter(r => Number(r.readiness || 0) >= Math.round(threshold * 100)); // records store readiness as %
  const ineligible = approved.length - eligible.length;

  setStep("gate", eligible.length ? "OK" : "WARN");
  log(`Step 3 gate: approved=${approved.length}, eligible=${eligible.length}, ineligible=${ineligible}`);

  // compute (stub)
  setStep("compute", eligible.length ? "OK" : "WARN");
  log("Step 4 compute: (stub) generating outputs following schema…");

  // create mock outputs per eligible record (limit to avoid huge table)
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
  log("Step 5 aggregate: (stub) aggregating by scope…");

  const agg = makeAggregate(job_id, period_id, scope, scope_id, rows);
  setStep("publish", "OK");
  log("Step 6 publish: saved outputs with lineage (job_id, method_version, parameter_set_id).");

  // persist outputs
  const outI = readJSON(STORAGE.outIndicator, []);
  writeJSON(STORAGE.outIndicator, [...rows, ...outI]);

  const outA = readJSON(STORAGE.outAggregate, []);
  writeJSON(STORAGE.outAggregate, [agg, ...outA]);

  // finish job
  job.status = "SUCCEEDED";
  job.ended_at = nowIso();
  job.log = `eligible=${eligible.length}, outputs=${rows.length}`;
  jobs[0] = job;
  writeJSON(STORAGE.jobs, jobs);

  setEngineState("Succeeded", "good");
  updateKPIs();
  renderJobs();
  renderOutputs();
}

function mockProgressPct(jobType, readinessPct){
  // purely illustrative, NOT formula
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
    agg_type: scope === "ACTION" ? "NATIONAL" : scope, // keep simple stub
    agg_key: key,
    progress_value: +(mean/100).toFixed(2),
    progress_pct: mean,
    n_actions: n,
    n_eligible: n,
    notes: "Stub aggregation (frontend-only)"
  };
}

function clearPipelineStates(){
  PIPELINE.forEach(s => s.state = "IDLE");
  renderPipeline();
}

function resetEngine(){
  if (!confirm("Reset engine UI state? (does not delete stored jobs unless you clear storage manually)")) return;
  clearPipelineStates();
  setEngineState("Idle", "");
  updateKPIs();
  log("Engine reset (UI state).");
}

function clearAllEngineStorage(){
  // not used by default (too destructive)
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
    res.push(section("Jobs", hit.map(h => `${h.job_id} • ${h.status} • ${h.period_id}`)));
  }
  if (scope === "all" || scope === "outputs"){
    const hitI = outsI.filter(o => (`${o.job_id} ${o.action_id} ${o.indicator_id} ${o.period_id}`.toLowerCase()).includes(q));
    const hitA = outsA.filter(a => (`${a.job_id} ${a.agg_type} ${a.agg_key} ${a.period_id}`.toLowerCase()).includes(q));
    res.push(section("Outputs (Indicator)", hitI.slice(0,12).map(x => `${x.action_id} • ${x.indicator_id} • ${x.progress_pct}%`)));
    res.push(section("Outputs (Aggregate)", hitA.slice(0,12).map(x => `${x.agg_type}:${x.agg_key} • ${x.progress_pct}%`)));
  }
  if (scope === "all" || scope === "help"){
    res.push(section("Help", q.includes("method") ? ["Method versioning: keep impact_v1, impact_v1_1, etc."] : []));
  }

  els.searchTitle.textContent = `Search Results: "${els.globalSearch.value}"`;
  els.searchBody.innerHTML = res.join("") || `<div class="muted">No results.</div>`;
  modal(els.searchModal, true);
}

function section(title, items){
  const arr = (items || []).filter(Boolean);
  return `
    <div style="margin-bottom:12px">
      <div style="font-weight:900; margin-bottom:6px">${title} (${arr.length})</div>
      ${arr.length ? `<ul>${arr.map(i => `<li>${escapeHtml(i)}</li>`).join("")}</ul>` : `<div class="muted">No results</div>`}
    </div>
  `;
}
function escapeHtml(s){
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
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
    request: "POST /engine/jobs",
    body,
    response_example: { job_id: "JOB-XXXX", status: "RUNNING" }
  }, null, 2);

  els.apiGet.textContent = JSON.stringify({
    request: "GET /engine/jobs/JOB-XXXX",
    response_example: {
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
    request: "GET /engine/outputs",
    query_params: {
      type: "indicator|aggregate",
      job_id: "JOB-XXXX",
      period_id: els.period.value,
      scope: els.scope.value,
      scope_id: (els.scopeId.value || "").trim() || null
    },
    response_example: [
      { out_id:"OUT-..", job_id:"JOB-..", action_id:"ACT-..", indicator_id:"IND-..", progress_pct: 72, eligibility_flag:true }
    ]
  }, null, 2);

  modal(els.apiModal, true);
}

function init(){
  renderPipeline();
  setEngineState("Idle", "");
  els.logbox.textContent = readJSON(STORAGE.engineLogs, []).join("\n");
  updateKPIs();
  renderJobs();
  renderOutputs();
  bindTabs();

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

  els.langToggle.addEventListener("click", ()=>{
    els.langToggle.textContent = (els.langToggle.textContent === "ID") ? "EN" : "ID";
  });

  // set default tab
  setActiveTab("indicator");

  // small banner logs
  const lj = latestJob();
  els.kLastJob.textContent = lj ? lj.job_id : "—";
}

init();
