// Help Center + Global Search (frontend-only)
// - FAQ, Panduan (walkthrough), Glosarium
// - Pencarian global lintas: help + glosarium + impact jobs + outputs
// - Audit modal: menampilkan job terbaru + headline agregasi nasional (jika ada)

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
    title:"Dashboard (Beranda) – apa fungsi utamanya?",
    meta:"FAQ • Modul Dashboard",
    body: `
<b>Fungsi utama Dashboard:</b>
<ul>
  <li>Ringkasan status sistem: Input → Review → Komputasi → Pelaporan.</li>
  <li>Navigasi cepat (single entry point).</li>
  <li>Quick filter dan shortcut ke aksi/indikator/wilayah prioritas.</li>
</ul>
<b>Prinsip desain:</b> satu halaman beranda untuk menghindari redundansi dan duplikasi tampilan.
    `,
    tip:`Jika Anda menemukan lebih dari satu “beranda”, satukan menjadi <b>Dashboard (Beranda)</b> sebagai pintu masuk utama.`
  },
  {
    id:"faq-input",
    type:"help",
    title:"Input Sektoral & Kewilayahan – apa bedanya?",
    meta:"FAQ • Input Data",
    body: `
<b> Sektoral (Horizontal):</b> fokus pada baseline–target–realisasi per indikator (aksi–indikator–periode).
<br/><b>Kewilayahan (Vertical):</b> fokus pada implementasi wilayah, status, dan konteks spasial (aksi–periode–lokasi).
<br/><br/>
<b>Luaran utama Input:</b> data siap diverifikasi di modul Review. <b>Komputasi tidak dilakukan di Input.</b>
    `,
    tip:`Gunakan wizard (bertahap) agar pengguna hanya mengisi field yang relevan.`
  },
  {
    id:"faq-review",
    type:"help",
    title:"Verifikasi & Validasi – kenapa wajib?",
    meta:"FAQ • Review & QA/QC",
    body: `
Review memastikan hanya data berstatus <b>APPROVED</b> yang masuk komputasi.
<ul>
  <li>Cek kelengkapan minimum (identitas, periode, lokasi, indikator, satuan).</li>
  <li>Cek konsistensi satuan & nilai.</li>
  <li>Evidence minimum untuk jejak audit.</li>
</ul>
<b>Luaran Review:</b> status (APPROVED/RETURNED/REJECTED) + checklist_score.
    `,
    tip:`Inbox terpusat membantu mengurangi banyaknya halaman review per modul.`
  },
  {
    id:"faq-engine",
    type:"help",
    title:"Komputasi (Impact Engine) – apakah menghitung rumus di frontend?",
    meta:"FAQ • Impact Engine",
    body: `
Tidak. <b>Frontend tidak menghitung rumus resmi</b>.
Frontend hanya:
<ul>
  <li>Memilih <i>method_version</i> & <i>parameter_set</i></li>
  <li>Menjalankan job (nanti via API backend)</li>
  <li>Menampilkan output + lineage (job_id, versi metode)</li>
</ul>
<b>Backend</b> yang melakukan perhitungan dan menyimpan hasil ke skema output.
    `,
    tip:`Ini penting untuk konsistensi audit dan mencegah angka berbeda antar-browser.`
  },
  {
    id:"faq-reporting",
    type:"help",
    title:"Pelaporan & Ekspor – BTR vs National Communication (NC)?",
    meta:"FAQ • Pelaporan",
    body: `
<b>BTR:</b> ringkas dan konsisten; menekankan transparansi progres & status data (headline nasional + agregasi).
<br/><b>NC:</b> lebih naratif dan evaluatif; menonjolkan sektor/wilayah, pembelajaran, dan kebutuhan dukungan.
<br/><br/>
Semua ekspor harus menyertakan <b>manifest lineage</b>: job_id, method_version, parameter_set, period, dan filter.
    `,
    tip:`Simpan manifest.json bersama file ekspor untuk kebutuhan audit.`
  },
];

const WALKTHROUGH = [
  {
    id:"walk-1",
    type:"walk",
    title:"Panduan 1 – Alur cepat end-to-end",
    meta:"Panduan • 6 langkah",
    body: `
<ol>
  <li><b>Input</b>: isi Sektoral (Horizontal)/Kewilayahan (Vertical).</li>
  <li><b>Unggah evidence</b> jika diperlukan.</li>
  <li><b>Review</b>: verifikasi → APPROVE/RETURN.</li>
  <li><b>Impact Engine</b>: pilih method_version & parameter_set → Run Job.</li>
  <li><b>Pelaporan</b>: pilih job terbaru → tampilan BTR/NC.</li>
  <li><b>Ekspor</b>: CSV/JSON + manifest lineage.</li>
</ol>
    `,
    tip:`Jika tidak ada data di Pelaporan, cek: job SUCCEEDED dan period yang dipilih sama.`
  },
  {
    id:"walk-2",
    type:"walk",
    title:"Panduan 2 – Menangani data tidak lengkap",
    meta:"Panduan • Data gap",
    body: `
<ul>
  <li>Jika baseline/actual kosong: lakukan RETURN dengan alasan spesifik.</li>
  <li>Jika target tidak ada: bisa gunakan mode delta (Before–After) <i>di backend</i> sesuai metode.</li>
  <li>Jika bukti minim: record tetap disimpan, tetapi dapat ditandai <b>ineligible</b> untuk komputasi.</li>
</ul>
    `,
    tip:`Pisahkan “ada data tapi belum layak dihitung” vs “data tidak tersedia”.`
  },
];

const GLOSSARY = [
  { id:"g-1", type:"gloss", title:"Action ID", meta:"Glosarium", body:"ID unik aksi adaptasi yang distandardisasi di MPC agar data Horizontal & Vertikal bisa terintegrasi." },
  { id:"g-2", type:"gloss", title:"Indicator ID", meta:"Glosarium", body:"ID indikator resmi (Lampiran/MPC registry) untuk menjaga konsistensi definisi dan satuan." },
  { id:"g-3", type:"gloss", title:"Readiness Score", meta:"Glosarium", body:"Skor kelengkapan/kualitas data untuk menentukan kelayakan (eligibility) saat gate komputasi." },
  { id:"g-4", type:"gloss", title:"Eligibility", meta:"Glosarium", body:"Status apakah record boleh dihitung di Impact Engine (APPROVED + memenuhi ambang readiness)." },
  { id:"g-5", type:"gloss", title:"Lineage / Manifest", meta:"Glosarium", body:"Metadata ekspor (job_id, method_version, parameter_set, period, filter) untuk jejak audit." },
  { id:"g-6", type:"gloss", title:"Job", meta:"Glosarium", body:"Satu eksekusi komputasi Impact Engine untuk periode dan scope tertentu, menghasilkan keluaran." },
];

let INDEX = []; // unified index untuk listing & search
let CURRENT_ITEMS = [];


function buildIndex(){
  INDEX = [
    ...HELP_ARTICLES,
    ...WALKTHROUGH,
    ...GLOSSARY,
  ];
}

function renderList(items){
  CURRENT_ITEMS = items || [];

  els.list.innerHTML = CURRENT_ITEMS.map(a => `
    <div class="article" data-id="${a.id}">
      <div class="title">${escapeHtml(a.title)}</div>
      <div class="meta">${escapeHtml(a.meta)}</div>
      <div class="snippet">${escapeHtml(stripHtml(a.body)).slice(0,120)}${stripHtml(a.body).length>120?"…":""}</div>
    </div>
  `).join("") || `<div class="muted">Tidak ada item.</div>`;

  Array.from(els.list.querySelectorAll(".article")).forEach(el=>{
    el.addEventListener("click", ()=> openArticle(el.dataset.id));
  });
}


function stripHtml(html){
  return String(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function openArticle(id){
  const a = CURRENT_ITEMS.find(x => x.id === id) || INDEX.find(x => x.id === id);
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

  if(type === "help") { renderList(HELP_ARTICLES); openArticle(HELP_ARTICLES[0]?.id); }
  if(type === "walk") { renderList(WALKTHROUGH); openArticle(WALKTHROUGH[0]?.id); }
  if(type === "gloss") { renderList(GLOSSARY); openArticle(GLOSSARY[0]?.id); }
  if(type === "audit") {
    const items = makeAuditItems();
    renderList(items);
    openArticle(items[0]?.id);
  }
}


function makeAuditItems(){
  const jobs = readJSON(STORAGE.jobs, []);
  const aggs = readJSON(STORAGE.outAggregate, []);
  const latest = jobs[0];

  const items = [];
  items.push({
    id:"audit-what",
    type:"audit",
    title:"Audit cepat – apa yang dicek sebelum ekspor?",
    meta:"Audit • Checklist",
    body: `
<ul>
  <li>Pastikan <b>job_id</b> sesuai periode pelaporan.</li>
  <li>Cek <b>status job</b> = SUCCEEDED.</li>
  <li>Pastikan <b>method_version</b> & <b>parameter_set</b> terdokumentasi.</li>
  <li>Gunakan eligible-only jika dipakai untuk headline resmi.</li>
</ul>
    `,
    tip:`Simpan manifest.json bersama file ekspor.`
  });

  if (latest){
    const nat = aggs.find(a => a.job_id === latest.job_id && String(a.agg_key||"").toUpperCase()==="NATIONAL");
    items.push({
      id:"audit-latest",
      type:"audit",
      title:`Job Terbaru: ${latest.job_id}`,
      meta:`Audit • ${latest.period_id} • ${latest.status}`,
      body: `
<b>job_id:</b> ${escapeHtml(latest.job_id)}<br/>
<b>periode:</b> ${escapeHtml(latest.period_id)}<br/>
<b>metode:</b> ${escapeHtml(latest.method_version)}<br/>
<b>parameter:</b> ${escapeHtml(latest.parameter_set_id)}<br/>
<b>status:</b> ${escapeHtml(latest.status)}<br/>
<b>headline nasional:</b> ${nat ? `<b>${escapeHtml(nat.progress_pct)}%</b>` : "—"}
      `,
      tip:`Jika headline “—”, jalankan job yang menghasilkan agregasi NATIONAL.`
    });
  } else {
    items.push({
      id:"audit-none",
      type:"audit",
      title:"Belum ada job Impact Engine",
      meta:"Audit • Perlu tindakan",
      body:`Jalankan <b>Impact Engine</b> terlebih dahulu untuk menghasilkan keluaran yang bisa diekspor.`,
      tip:`Buka engine.html → Run Job.`
    });
  }

  return items;
}

function search(){
  const q = (els.q.value || "").trim().toLowerCase();
  const scope = els.scope.value;

  const jobs = readJSON(STORAGE.jobs, []);
  const outsI = readJSON(STORAGE.outIndicator, []);
  const outsA = readJSON(STORAGE.outAggregate, []);

  const hits = [];

  // help/glosarium
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
          meta:`Job • ${j.period_id} • ${j.status}`,
          body: `<pre>${escapeHtml(JSON.stringify(j, null, 2))}</pre>`
        });
      }
    });
  }

  // outputs (keluaran)
  if (scope === "all" || scope === "outputs"){
    outsA.forEach(a => {
      const text = `${a.job_id} ${a.agg_type} ${a.agg_key} ${a.period_id} ${a.progress_pct}`.toLowerCase();
      if (q && text.includes(q)){
        hits.push({
          id:`agg-${a.agg_id}`,
          type:"outputs",
          title:`Agregasi: ${a.agg_type}:${a.agg_key}`,
          meta:`Keluaran • ${a.period_id} • job ${a.job_id}`,
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
          title:`Indikator: ${o.action_id} • ${o.indicator_id}`,
          meta:`Keluaran • ${o.period_id} • job ${o.job_id}`,
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
    latest_national_aggregate: latest
      ? aggs.find(a => a.job_id === latest.job_id && String(a.agg_key||"").toUpperCase()==="NATIONAL")
      : null,
    jobs_count: jobs.length,
    aggregates_count: aggs.length,
  };

  els.auditBox.textContent = JSON.stringify(payload, null, 2);
  modal(els.auditModal, true);
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
  buildIndex();
  setTab("help");
  openArticle("faq-home");
  sidebarBehavior();

  // tabs
  els.tabs.forEach(t => t.addEventListener("click", ()=> setTab(t.dataset.tab)));

  // search
  els.searchBtn.addEventListener("click", search);
  els.q.addEventListener("keydown", (e)=>{ if(e.key==="Enter") search(); });

  // re-index
  els.reindexBtn.addEventListener("click", ()=>{
    buildIndex();
    els.state.className = "pill good";
    els.state.innerHTML = "<span>●</span> Indeks diperbarui";
    setTimeout(()=>{ els.state.innerHTML = "<span>●</span> Siap"; }, 900);
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
