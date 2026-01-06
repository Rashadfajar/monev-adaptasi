// Help Center + Global Search (frontend-only)
// - FAQ articles, Walkthrough, Glossary
// - Global search across help + glossary + impact jobs + outputs
// - Audit modal: show latest jobs + aggregate headline

const $ = (id) => document.getElementById(id);

const els = {
  q: $("q"),
  scope: $("scope"),
  searchBtn: $("searchBtn"),
  state: $("state"),
  reindexBtn: $("reindexBtn"),
  list: $("list"),

  tabs: Array.from(document.querySelectorAll(".tab")),
  title: $("title"),
  meta: $("meta"),
  bodyText: $("bodyText"),
  tipBox: $("tipBox"),

  copyBtn: $("copyBtn"),
  openAuditBtn: $("openAuditBtn"),

  auditModal: $("auditModal"),
  closeAudit: $("closeAudit"),
  auditBox: $("auditBox"),

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

function escapeHtml(s){
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
}

function nowIso(){ return new Date().toISOString(); }

const HELP_ARTICLES = [
  {
    id:"faq-home",
    type:"help",
    title:"Dashboard (Home) – apa fungsi utamanya?",
    meta:"FAQ • Modul Home/Dashboard",
    body: `
<b>Fungsi utama Dashboard:</b>
<ul>
  <li>Ringkasan status sistem: input → review → impact → reporting.</li>
  <li>Kontrol navigasi (single home dashboard).</li>
  <li>Quick filters dan quick links ke aksi/indikator/wilayah prioritas.</li>
</ul>
<b>Prinsip desain:</b> dashboard tunggal (home = dashboard), menghindari redundansi halaman dan duplikasi visual.
    `,
    tip:`Jika Anda menemukan lebih dari satu “beranda”, satukan menjadi <b>Dashboard/Home</b> sebagai single entry point.`
  },
  {
    id:"faq-input",
    type:"help",
    title:"Input Horizontal & Vertical – apa bedanya?",
    meta:"FAQ • Input Data",
    body: `
<b>Horizontal:</b> fokus pada baseline–target–realisasi per indikator (aksi–indikator–periode).
<br/><b>Vertical:</b> fokus pada implementasi wilayah, status, dan konteks spasial (aksi–periode–lokasi).
<br/><br/>
<b>Output utama Input:</b> data siap validasi (Review Inbox). <b>Komputasi tidak dilakukan di input.</b>
    `,
    tip:`Gunakan wizard (step-by-step) agar user tidak mengisi field yang tidak relevan.`
  },
  {
    id:"faq-review",
    type:"help",
    title:"Review & Validasi – kenapa wajib?",
    meta:"FAQ • Review & QA/QC",
    body: `
Review memastikan hanya data yang <b>APPROVED</b> yang masuk komputasi.
<ul>
  <li>Check kelengkapan minimum (identity, period, location, indicator, unit).</li>
  <li>Check konsistensi unit & nilai.</li>
  <li>Evidence minimal untuk audit.</li>
</ul>
<b>Output Review:</b> status (APPROVED/RETURNED/REJECTED) + checklist_score.
    `,
    tip:`Inbox universal mengurangi banyaknya halaman review per modul.`
  },
  {
    id:"faq-engine",
    type:"help",
    title:"Impact Engine – apakah menghitung rumus di frontend?",
    meta:"FAQ • Impact Engine",
    body: `
Tidak. <b>Frontend tidak menghitung rumus resmi</b>.
Frontend hanya:
<ul>
  <li>Memilih <i>method_version</i> & <i>parameter_set</i></li>
  <li>Menjalankan job (via API backend nanti)</li>
  <li>Menampilkan output + lineage (job_id, versi metode)</li>
</ul>
<b>Backend</b> yang melakukan perhitungan dan menyimpan hasil ke schema output.
    `,
    tip:`Ini penting untuk konsistensi audit dan mencegah “angka liar” dari browser.`
  },
  {
    id:"faq-reporting",
    type:"help",
    title:"Pelaporan & Ekspor – BTR vs National Communication?",
    meta:"FAQ • Reporting",
    body: `
<b>BTR:</b> ringkas, konsisten, menekankan transparansi progres & status data (headline nasional + agregasi).
<br/><b>NC:</b> lebih naratif dan evaluatif: sektor/wilayah, pembelajaran, kebutuhan dukungan.
<br/><br/>
Semua ekspor harus menyertakan <b>manifest lineage</b>: job_id, method_version, parameter_set, period, filters.
    `,
    tip:`Export manifest.json wajib disimpan bersama file untuk audit.`
  },
];

const WALKTHROUGH = [
  {
    id:"walk-1",
    type:"walk",
    title:"Walkthrough 1 – Alur cepat end-to-end",
    meta:"Walkthrough • 6 langkah",
    body: `
<ol>
  <li><b>Input</b>: isi Horizontal/Vertical (wizard).</li>
  <li><b>Upload evidence</b> jika diperlukan.</li>
  <li><b>Review</b>: verifikasi → APPROVE/RETURN.</li>
  <li><b>Impact Engine</b>: pilih method_version & parameter_set → Run Job.</li>
  <li><b>Reporting</b>: pilih job terbaru → BTR/NC View.</li>
  <li><b>Export</b>: CSV/JSON + manifest lineage.</li>
</ol>
    `,
    tip:`Jika tidak ada output di Reporting, cek apakah job berhasil dan periode sama.`
  },
  {
    id:"walk-2",
    type:"walk",
    title:"Walkthrough 2 – Menangani data tidak lengkap",
    meta:"Walkthrough • data gap",
    body: `
<ul>
  <li>Jika baseline/actual kosong: lakukan RETURN dengan alasan spesifik.</li>
  <li>Jika target tidak ada: boleh gunakan mode delta (Before–After) <i>di backend</i> (sesuai metode).</li>
  <li>Jika bukti minim: tetap simpan record, tetapi <b>ineligible</b> untuk komputasi.</li>
</ul>
    `,
    tip:`Pisahkan “ada data tapi belum layak dihitung” vs “data tidak ada sama sekali”.`
  },
];

const GLOSSARY = [
  { id:"g-1", type:"gloss", title:"Action ID", meta:"Glossary", body:"ID unik aksi adaptasi yang distandardisasi di MPC agar Horizontal & Vertical bisa terintegrasi." },
  { id:"g-2", type:"gloss", title:"Indicator ID", meta:"Glossary", body:"ID indikator resmi (Lampiran/MPC registry) untuk menjaga konsistensi definisi dan satuan." },
  { id:"g-3", type:"gloss", title:"Readiness Score", meta:"Glossary", body:"Skor kelengkapan/kualitas data untuk menentukan eligibility komputasi (gate)." },
  { id:"g-4", type:"gloss", title:"Eligibility", meta:"Glossary", body:"Status apakah record boleh dihitung di Impact Engine (APPROVED + readiness threshold terpenuhi)." },
  { id:"g-5", type:"gloss", title:"Lineage / Manifest", meta:"Glossary", body:"Metadata ekspor: job_id, method_version, parameter_set, period, filter; untuk audit." },
  { id:"g-6", type:"gloss", title:"Job", meta:"Glossary", body:"Satu eksekusi komputasi Impact Engine untuk periode dan scope tertentu, menghasilkan outputs." },
];

let INDEX = []; // unified index for search & listing

function buildIndex(){
  INDEX = [
    ...HELP_ARTICLES,
    ...WALKTHROUGH,
    ...GLOSSARY,
  ];
}

function renderList(items){
  els.list.innerHTML = items.map(a => `
    <div class="article" data-id="${a.id}">
      <div class="title">${escapeHtml(a.title)}</div>
      <div class="meta">${escapeHtml(a.meta)}</div>
      <div class="snippet">${escapeHtml(stripHtml(a.body)).slice(0,120)}${stripHtml(a.body).length>120?"…":""}</div>
    </div>
  `).join("") || `<div class="muted">No items.</div>`;

  Array.from(els.list.querySelectorAll(".article")).forEach(el=>{
    el.addEventListener("click", ()=> openArticle(el.dataset.id));
  });
}

function stripHtml(html){
  return String(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function openArticle(id){
  const a = INDEX.find(x => x.id === id);
  if(!a) return;
  els.title.textContent = a.title;
  els.meta.textContent = a.meta;
  els.bodyText.innerHTML = a.body;

  if (a.tip){
    els.tipBox.style.display = "block";
    els.tipBox.innerHTML = `<b>Tip:</b> ${a.tip}`;
  } else {
    els.tipBox.style.display = "none";
    els.tipBox.innerHTML = "";
  }
}

function setTab(type){
  els.tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === type));
  if(type === "help") renderList(HELP_ARTICLES);
  if(type === "walk") renderList(WALKTHROUGH);
  if(type === "gloss") renderList(GLOSSARY);
  if(type === "audit") renderList(makeAuditItems());
}

function makeAuditItems(){
  const jobs = readJSON(STORAGE.jobs, []);
  const aggs = readJSON(STORAGE.outAggregate, []);
  const latest = jobs[0];

  const items = [];
  items.push({
    id:"audit-what",
    type:"audit",
    title:"Audit cepat – apa yang harus dicek sebelum ekspor?",
    meta:"Audit • checklist",
    body: `
<ul>
  <li>Pastikan <b>job_id</b> yang dipilih sesuai periode pelaporan.</li>
  <li>Cek <b>status job</b> = SUCCEEDED.</li>
  <li>Pastikan <b>method_version</b> & <b>parameter_set</b> terdokumentasi.</li>
  <li>Pastikan eligible-only jika dipakai untuk headline resmi.</li>
</ul>
    `,
    tip:`Simpan manifest.json bersama file ekspor.`
  });

  if (latest){
    const nat = aggs.find(a => a.job_id === latest.job_id && String(a.agg_key||"").toUpperCase()==="NATIONAL");
    items.push({
      id:"audit-latest",
      type:"audit",
      title:`Latest Job: ${latest.job_id}`,
      meta:`Audit • ${latest.period_id} • ${latest.status}`,
      body: `
<b>job_id:</b> ${escapeHtml(latest.job_id)}<br/>
<b>period:</b> ${escapeHtml(latest.period_id)}<br/>
<b>method:</b> ${escapeHtml(latest.method_version)}<br/>
<b>param:</b> ${escapeHtml(latest.parameter_set_id)}<br/>
<b>status:</b> ${escapeHtml(latest.status)}<br/>
<b>headline national:</b> ${nat ? `<b>${escapeHtml(nat.progress_pct)}%</b>` : "—"}
      `,
      tip:`Jika headline “—”, jalankan job yang menghasilkan aggregate NATIONAL.`
    });
  } else {
    items.push({
      id:"audit-none",
      type:"audit",
      title:"Belum ada job Impact Engine",
      meta:"Audit • action required",
      body:`Jalankan <b>Impact Engine</b> terlebih dahulu untuk menghasilkan output yang bisa diekspor.`,
      tip:`Masuk ke engine.html → Run Job.`
    });
  }

  return items;
}

function search(){
  const q = (els.q.value || "").trim().toLowerCase();
  const scope = els.scope.value;

  // data search from storage
  const jobs = readJSON(STORAGE.jobs, []);
  const outsI = readJSON(STORAGE.outIndicator, []);
  const outsA = readJSON(STORAGE.outAggregate, []);

  const hits = [];

  // help/glossary index
  if (scope === "all" || scope === "help" || scope === "glossary"){
    const subset = INDEX.filter(i => {
      if (scope === "help") return i.type === "help" || i.type === "walk";
      if (scope === "glossary") return i.type === "gloss";
      return true;
    });
    subset.forEach(i => {
      const text = `${i.title} ${stripHtml(i.body)} ${i.meta}`.toLowerCase();
      if (q && text.includes(q)) hits.push(i);
    });
  }

  // jobs
  if (scope === "all" || scope === "jobs"){
    jobs.forEach(j => {
      const text = `${j.job_id} ${j.period_id} ${j.scope} ${j.method_version} ${j.parameter_set_id} ${j.status}`.toLowerCase();
      if (q && text.includes(q)){
        hits.push({
          id:`job-${j.job_id}`,
          type:"jobs",
          title:`Job: ${j.job_id}`,
          meta:`Jobs • ${j.period_id} • ${j.status}`,
          body: `<pre>${escapeHtml(JSON.stringify(j, null, 2))}</pre>`
        });
      }
    });
  }

  // outputs
  if (scope === "all" || scope === "outputs"){
    outsA.forEach(a => {
      const text = `${a.job_id} ${a.agg_type} ${a.agg_key} ${a.period_id} ${a.progress_pct}`.toLowerCase();
      if (q && text.includes(q)){
        hits.push({
          id:`agg-${a.agg_id}`,
          type:"outputs",
          title:`Aggregate: ${a.agg_type}:${a.agg_key}`,
          meta:`Outputs • ${a.period_id} • job ${a.job_id}`,
          body: `<pre>${escapeHtml(JSON.stringify(a, null, 2))}</pre>`
        });
      }
    });
    outsI.slice(0, 200).forEach(o => {
      const text = `${o.job_id} ${o.action_id} ${o.indicator_id} ${o.period_id} ${o.progress_pct}`.toLowerCase();
      if (q && text.includes(q)){
        hits.push({
          id:`ind-${o.out_id}`,
          type:"outputs",
          title:`Indicator: ${o.action_id} • ${o.indicator_id}`,
          meta:`Outputs • ${o.period_id} • job ${o.job_id}`,
          body: `<pre>${escapeHtml(JSON.stringify(o, null, 2))}</pre>`
        });
      }
    });
  }

  // render
  if (!q){
    setTab("help");
    return;
  }
  renderList(hits.slice(0, 60));
  if (hits[0]) openArticle(hits[0].id);
}

function openAuditModal(){
  const jobs = readJSON(STORAGE.jobs, []);
  const aggs = readJSON(STORAGE.outAggregate, []);
  const latest = jobs[0];

  const payload = {
    generated_at: nowIso(),
    latest_job: latest || null,
    latest_national_aggregate: latest ? aggs.find(a => a.job_id === latest.job_id && String(a.agg_key||"").toUpperCase()==="NATIONAL") : null,
    jobs_count: jobs.length,
    aggregates_count: aggs.length,
  };
  els.auditBox.textContent = JSON.stringify(payload, null, 2);
  modal(els.auditModal, true);
}

function init(){
  buildIndex();
  setTab("help");
  openArticle("faq-home");

  // tabs
  els.tabs.forEach(t => t.addEventListener("click", ()=> setTab(t.dataset.tab)));

  // search
  els.searchBtn.addEventListener("click", search);
  els.q.addEventListener("keydown", (e)=>{ if(e.key==="Enter") search(); });

  // re-index (future: include dynamic glossary from docs)
  els.reindexBtn.addEventListener("click", ()=>{
    buildIndex();
    els.state.className = "pill good";
    els.state.textContent = "● Re-indexed";
    setTimeout(()=>{ els.state.textContent = "● Ready"; }, 900);
  });

  // copy selected article
  els.copyBtn.addEventListener("click", ()=>{
    const text = `${els.title.textContent}\n${els.meta.textContent}\n\n${stripHtml(els.bodyText.innerHTML)}\n\n${stripHtml(els.tipBox.innerHTML)}`;
    navigator.clipboard.writeText(text).catch(()=>{});
  });

  // audit quick view
  els.openAuditBtn.addEventListener("click", openAuditModal);
  els.closeAudit.addEventListener("click", ()=> modal(els.auditModal, false));

  // language toggle placeholder
  els.langToggle.addEventListener("click", ()=>{
    els.langToggle.textContent = (els.langToggle.textContent === "ID") ? "EN" : "ID";
  });
}

init();
