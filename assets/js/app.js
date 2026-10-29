// KOREAN PLAYGROUND: renders pages from data/*.json.
// To add or change lessons, edit data/lessons.json only.

const state = { site: {}, t: {}, courses: [], lessons: [], lang: "my" };
const LANGS = ["my", "ko", "en"];
const app = document.getElementById("app");

const ICON = {
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>',
  pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>'
};

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);
}

// Myanmar digits in the Burmese UI.
function num(n) {
  return state.lang === "my" ? String(n).replace(/\d/g, d => "၀၁၂၃၄၅၆၇၈၉"[d]) : String(n);
}

// Text in the current language, falling back to Burmese then Korean.
function pick(obj) {
  if (!obj || typeof obj === "string") return obj || "";
  return obj[state.lang] || obj.my || obj.ko || "";
}
// Secondary line: Korean under Burmese, Burmese under the others.
function helper(obj) {
  if (!obj || typeof obj === "string") return "";
  return state.lang === "my" ? obj.ko || "" : obj.my || "";
}
function t(key, vars = {}) {
  const s = (state.t[state.lang] || {})[key] || (state.t.my || {})[key] || key;
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
}

function course(id) { return state.courses.find(c => c.id === id) || {}; }
function published() { return state.lessons.filter(l => l.published); }

function lessonLabel(l) {
  return state.lang === "ko" ? `${l.number}${t("lesson")}` : `${t("lesson")} ${num(l.number)}`;
}
// Accepts a full YouTube link (watch, youtu.be, shorts, live) or a bare video id.
function youtubeId(v) {
  const s = String(v || "").trim();
  const m = s.match(/(?:youtu\.be\/|[?&]v=|\/(?:embed|shorts|live)\/)([\w-]{11})/);
  return m ? m[1] : (/^[\w-]{11}$/.test(s) ? s : "");
}
function glyph(l) {
  return l.glyph || String(pick(l.summary)).split(/\s+/)[0] || "";
}

function waitlistBlock() {
  if (!state.site.waitlistUrl) return "";
  return `
    <section class="waitlist">
      <div>
        <h2>${esc(t("waitlistTitle"))}</h2>
        <p>${esc(t("waitlistText"))}</p>
      </div>
      <a class="btn btn-primary" href="${esc(state.site.waitlistUrl)}" target="_blank" rel="noopener">${esc(t("waitlistButton"))}</a>
    </section>`;
}

function adBlock() {
  return state.site.showAds ? `<aside class="ad-slot">${esc(t("adLabel"))}</aside>` : "";
}

function renderHome() {
  const lessons = published();
  const first = lessons[0];
  // "{word}" in the tagline is highlighted.
  const tagline = esc(t("tagline")).replace(/\{(.+?)\}/, "<em>$1</em>");

  const roadmap = (state.route || []).map(r => {
    const open = r.status === "open";
    const branches = (r.branches || []).map(b => `
      <span class="branch unit-${esc(b.color)}">
        <strong>${esc(pick(b.title))}</strong>
        <small>${esc(pick(b.canDo))}</small>
      </span>`).join("");
    return `
      <li class="unit-${esc(r.color)} ${open ? "" : "soon"}">
        <span class="block">${open ? num(r.step) : ICON.lock}</span>
        <div class="body">
          <span class="step-label">STEP ${num(r.step)}${r.range ? ` · ${esc(pick(r.range))}` : ""}</span>
          <h3>${esc(pick(r.title))}
            <span class="pill ${open ? "pill-open" : "pill-soon"}">${esc(t(open ? "open" : "soon"))}</span>
          </h3>
          ${r.canDo ? `<p><b>${esc(t("after"))}</b> ${esc(pick(r.canDo))}</p>` : ""}
          ${branches ? `<div class="branches">${branches}</div>` : ""}
          ${open && r.start ? `<a class="step-link" href="#/lesson/${esc(r.start)}">${esc(t("startHere"))} ${ICON.chevron}</a>` : ""}
        </div>
      </li>`;
  }).join("");

  const groups = state.courses
    .map(c => ({ c, items: lessons.filter(l => l.course === c.id) }))
    .filter(g => g.items.length)
    .map(({ c, items }) => `
      <section class="section unit-${esc(c.color)}" id="lessons">
        <div class="section-head">
          <div>
            <span class="eyebrow">${esc(t("allFree"))}</span>
            <h2>${esc(pick(c.title))}</h2>
          </div>
          <p>${esc(t("chipLessons", { n: num(items.length) }))}</p>
        </div>
        <div class="lesson-grid">
          ${items.map(l => `
            <a class="lesson-card" href="#/lesson/${esc(l.id)}">
              <span class="glyph" aria-hidden="true">${esc(glyph(l))}</span>
              <span>
                <span class="num">${esc(lessonLabel(l))}</span>
                <h3>${esc(pick(l.title))}</h3>
                <span class="sub">${esc(helper(l.title))}</span>
              </span>
              <span class="chev">${ICON.chevron}</span>
            </a>`).join("")}
        </div>
      </section>`).join("");

  app.innerHTML = `
    <section class="hero">
      <div class="hero-copy">
        <h1>${tagline}</h1>
        <p class="lead">${esc(t("heroSub"))}</p>
        <div class="actions">
          ${first ? `<a class="btn btn-primary" href="#/lesson/${esc(first.id)}">${esc(t("startHangul"))} ${ICON.chevron}</a>` : ""}
          <a class="btn btn-ghost" href="#lessons" data-scroll>${esc(t("getPdf"))}</a>
        </div>
        <ul class="chips">
          <li>${ICON.check}${esc(t("chipFree"))}</li>
          <li>${ICON.check}${esc(t("chipLessons", { n: num(lessons.length) }))}</li>
          <li>${ICON.check}${esc(t("chipLangs"))}</li>
        </ul>
      </div>
      <div class="hero-art" aria-hidden="true">
        <span class="tile tile-orange">한</span>
        <span class="tile tile-blue">국</span>
        <span class="tile tile-green">어</span>
        <span class="cube"></span>
      </div>
    </section>

    <section class="helper" id="helper" aria-live="polite"></section>

    <section class="section" id="roadmap">
      <div class="section-head">
        <h2>${esc(t("roadmap"))}</h2>
        <p>${esc(t("roadmapSub"))}</p>
      </div>
      <ol class="roadmap">${roadmap}</ol>
    </section>

    ${groups}
    ${waitlistBlock()}
    ${adBlock()}`;
  document.title = state.site.name || "한국어 PLAYGROUND";
  renderHelper();
}

// "Not sure where to start?" — two yes/no questions that point to a route step.
function renderHelper(stage = "q1") {
  const box = document.getElementById("helper");
  if (!box) return;
  const head = `
    <div>
      <h2>${esc(t("helperTitle"))}</h2>
      <p>${esc(t("helperSub"))}</p>
    </div>`;
  const ask = q => `
    <div class="helper-q">
      <p class="q">${esc(t(q))}</p>
      <div class="helper-actions">
        <button class="btn btn-ghost btn-sm" type="button" data-answer="${q}:no">${esc(t(q + "no"))}</button>
        <button class="btn btn-ghost btn-sm" type="button" data-answer="${q}:yes">${esc(t(q + "yes"))}</button>
      </div>
    </div>`;
  let body;
  if (stage === "q1" || stage === "q2") {
    body = ask(stage);
  } else {
    const n = Number(stage);
    const step = (state.route || []).find(r => r.step === n) || {};
    const open = step.status === "open" && step.start;
    const review = (state.route || []).find(r => r.step === 1) || {};
    body = `
      <div class="helper-q">
        <p class="q">${esc(t("result", { n: num(n) }))}</p>
        ${open ? "" : `<p class="note">${esc(t("resultSoon"))}</p>`}
        <div class="helper-actions">
          <button class="btn btn-ghost btn-sm" type="button" data-answer="restart">${esc(t("restart"))}</button>
          ${open
            ? `<a class="btn btn-primary btn-sm" href="#/lesson/${esc(step.start)}">${esc(t("go"))} ${ICON.chevron}</a>`
            : review.start ? `<a class="btn btn-primary btn-sm" href="#/lesson/${esc(review.start)}">${esc(t("review"))} ${ICON.chevron}</a>` : ""}
        </div>
      </div>`;
  }
  box.innerHTML = head + body;
}

function renderLesson(id) {
  const list = published();
  const i = list.findIndex(l => l.id === id);
  if (i < 0) {
    app.innerHTML = `<a class="crumb" href="#/">${ICON.back} ${esc(t("back"))}</a><h1>${esc(t("notFound"))}</h1>`;
    return;
  }
  const l = list[i];
  const c = course(l.course);
  const inCourse = list.filter(x => x.course === l.course);
  const pos = inCourse.indexOf(l) + 1;
  const prev = list[i - 1];
  const next = list[i + 1];

  // The standard youtube.com embed, so plays here count as YouTube views.
  const vid = youtubeId(l.youtube);
  const video = vid
    ? `<iframe src="https://www.youtube.com/embed/${vid}?rel=0" title="${esc(pick(l.title))}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>`
    : `<span class="play">${ICON.play}</span><span>${esc(t("videoSoon"))}</span>`;

  const files = (l.files || []).map(f => `
    <div class="file">
      <span class="icon">${f.type === "practice" ? ICON.pencil : ICON.file}</span>
      <div>
        <strong>${esc(t(f.type))}</strong>
        <small>${esc(t("free"))} · PDF</small>
      </div>
      ${f.path
        ? `<a class="btn btn-primary btn-sm" href="${esc(f.path)}" download>${ICON.download} ${esc(t("download"))}</a>`
        : `<span class="btn btn-sm" aria-disabled="true">${esc(t("preparing"))}</span>`}
    </div>`).join("");

  app.innerHTML = `
    <div class="unit-${esc(c.color)}">
      <a class="crumb" href="#/">${ICON.back} ${esc(t("back"))}</a>
      <div class="progress">
        <span>${esc(pick(c.title))} · ${esc(t("of", { i: num(pos), n: num(inCourse.length) }))}</span>
        <span class="bar"><span style="width:${Math.round(pos / inCourse.length * 100)}%"></span></span>
      </div>
      <div class="lesson-head">
        <span class="glyph" aria-hidden="true">${esc(glyph(l))}</span>
        <div>
          <span class="eyebrow">${esc(lessonLabel(l))}</span>
          <h1>${esc(pick(l.title))}</h1>
          <p class="sub">${esc(helper(l.title))}</p>
        </div>
      </div>
      <p class="jamo-row" lang="ko">${esc(l.summary?.ko || pick(l.summary))}</p>
      <div class="lesson-body">
        <div class="video">${video}</div>
        <div class="files">
          <h2>${esc(t("downloads"))}</h2>
          ${files}
        </div>
      </div>
      <nav class="pager">
        ${prev ? `<a href="#/lesson/${esc(prev.id)}"><small>← ${esc(t("prev"))}</small><strong>${esc(pick(prev.title))}</strong></a>` : ""}
        ${next ? `<a class="next" href="#/lesson/${esc(next.id)}"><small>${esc(t("next"))} →</small><strong>${esc(pick(next.title))}</strong></a>` : ""}
      </nav>
    </div>
    ${waitlistBlock()}
    ${adBlock()}`;
  document.title = `${pick(l.title)} · ${state.site.name || "한국어 PLAYGROUND"}`;
}

function renderFooter() {
  const links = [
    ["Facebook", state.site.facebookUrl],
    ["YouTube", state.site.youtubeUrl],
    ["TikTok", state.site.tiktokUrl]
  ].filter(([, url]) => url);
  document.getElementById("social").innerHTML = links
    .map(([name, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener">${name}</a>`).join("");
}

function route() {
  const m = location.hash.match(/^#\/lesson\/([\w-]+)/);
  if (m) renderLesson(m[1]); else renderHome();
  window.scrollTo(0, 0);
}

function setLang(lang) {
  state.lang = LANGS.includes(lang) ? lang : "my";
  document.documentElement.lang = state.lang;
  document.querySelectorAll(".lang button").forEach(b =>
    b.setAttribute("aria-pressed", String(b.dataset.lang === state.lang)));
  try { localStorage.setItem("kp-lang", state.lang); } catch (e) {}
  const y = window.scrollY;
  route();
  window.scrollTo(0, y);
}

async function load(path) {
  const res = await fetch(path, { cache: "no-cache" });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

async function init() {
  try {
    const [site, i18n, data] = await Promise.all([
      load("data/site.json"), load("data/i18n.json"), load("data/lessons.json")
    ]);
    Object.assign(state, { site, t: i18n, courses: data.courses, lessons: data.lessons, route: data.route });
  } catch (e) {
    app.innerHTML = `<p>Could not load data. ${esc(e.message)}</p>`;
    return;
  }
  renderFooter();
  document.querySelectorAll(".lang button").forEach(b =>
    b.addEventListener("click", () => setLang(b.dataset.lang)));
  window.addEventListener("hashchange", route);
  // In-page anchors (#lessons) scroll instead of routing.
  app.addEventListener("click", e => {
    const ans = e.target.closest("[data-answer]");
    if (ans) {
      const next = { "q1:no": "0", "q1:yes": "q2", "q2:no": "2", "q2:yes": "3", "restart": "q1" };
      renderHelper(next[ans.dataset.answer] || "q1");
      return;
    }
    const a = e.target.closest("a[data-scroll]");
    if (!a) return;
    e.preventDefault();
    document.querySelector(a.getAttribute("href"))?.scrollIntoView({ behavior: "smooth" });
  });

  let saved = null;
  try { saved = localStorage.getItem("kp-lang"); } catch (e) {}
  setLang(saved || state.site.defaultLang);
}

init();
