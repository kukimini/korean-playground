// KOREAN PLAYGROUND: renders pages from data/*.json.
// To add or change lessons, edit data/lessons.json only.

const state = { site: {}, t: {}, courses: [], lessons: [], lang: "my" };
const LANGS = ["my", "ko", "en"];
const app = document.getElementById("app");

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);
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
function t(key) {
  return (state.t[state.lang] || {})[key] || (state.t.my || {})[key] || key;
}

function course(id) { return state.courses.find(c => c.id === id) || {}; }
function published() { return state.lessons.filter(l => l.published); }

function lessonLabel(l) {
  return state.lang === "ko" ? `${l.number}${t("lesson")}` : `${t("lesson")} ${l.number}`;
}

function waitlistBlock() {
  if (!state.site.waitlistUrl) return "";
  return `
    <section class="waitlist">
      <h2>${esc(t("waitlistTitle"))}</h2>
      <p>${esc(t("waitlistText"))}</p>
      <a class="button" href="${esc(state.site.waitlistUrl)}" target="_blank" rel="noopener">${esc(t("waitlistButton"))}</a>
    </section>`;
}

function adBlock() {
  return state.site.showAds ? `<aside class="ad-slot">${esc(t("adLabel"))}</aside>` : "";
}

function renderHome() {
  const roadmap = state.courses.map((c, i) => `
    <li class="unit-${esc(c.color)} ${c.status === "soon" ? "soon" : ""}">
      <span class="step">${i + 1}</span>
      <div>
        <h3>${esc(pick(c.title))}</h3>
        <p>${esc(pick(c.desc))}</p>
      </div>
      <span class="status">${esc(t(c.status === "open" ? "open" : "soon"))}</span>
    </li>`).join("");

  const groups = state.courses
    .map(c => ({ c, items: published().filter(l => l.course === c.id) }))
    .filter(g => g.items.length)
    .map(({ c, items }) => `
      <h2 class="section-title">${esc(pick(c.title))}</h2>
      <div class="lesson-grid">
        ${items.map(l => `
          <a class="lesson-card unit-${esc(c.color)}" href="#/lesson/${esc(l.id)}">
            <span class="tag">${esc(pick(c.title))} · ${esc(lessonLabel(l))}</span>
            <span class="free">${esc(t("free"))}</span>
            <h3>${esc(pick(l.title))}</h3>
            <p class="sub">${esc(helper(l.title))}</p>
            <p class="jamo">${esc(pick(l.summary))}</p>
          </a>`).join("")}
      </div>`).join("");

  const first = published()[0];
  app.innerHTML = `
    <section class="hero">
      <div>
        <h1>${esc(t("tagline"))}</h1>
        <p>${esc(t("heroSub"))}</p>
        ${first ? `<a class="button" href="#/lesson/${esc(first.id)}">${esc(t("startHangul"))}</a>` : ""}
      </div>
      <img src="assets/img/logo-symbol-wordmark.png" alt="KOREAN PLAYGROUND">
    </section>
    <h2 class="section-title">${esc(t("roadmap"))}</h2>
    <ol class="roadmap">${roadmap}</ol>
    ${groups}
    ${waitlistBlock()}
    ${adBlock()}`;
  document.title = state.site.name || "KOREAN PLAYGROUND";
}

function renderLesson(id) {
  const list = published();
  const i = list.findIndex(l => l.id === id);
  if (i < 0) {
    app.innerHTML = `<p class="crumb"><a href="#/">← ${esc(t("back"))}</a></p><h1>${esc(t("notFound"))}</h1>`;
    return;
  }
  const l = list[i];
  const c = course(l.course);
  const prev = list[i - 1];
  const next = list[i + 1];

  const video = l.youtube
    ? `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(l.youtube)}" title="${esc(pick(l.title))}" allowfullscreen loading="lazy"></iframe>`
    : `<span>${esc(t("videoSoon"))}</span>`;

  const files = (l.files || []).map(f => `
    <div class="file">
      <div>
        <strong>${esc(t(f.type))}</strong>
        <small>${esc(t("free"))} · PDF</small>
      </div>
      ${f.path
        ? `<a class="button" href="${esc(f.path)}" download>${esc(t("download"))}</a>`
        : `<span class="button" aria-disabled="true">${esc(t("preparing"))}</span>`}
    </div>`).join("");

  app.innerHTML = `
    <a class="crumb" href="#/">← ${esc(t("back"))}</a>
    <div class="lesson-head unit-${esc(c.color)}">
      <span class="tag">${esc(pick(c.title))} · ${esc(lessonLabel(l))}</span>
      <h1>${esc(pick(l.title))}</h1>
      <p class="sub">${esc(helper(l.title))}</p>
      <p class="jamo-hero">${esc(pick(l.summary))}</p>
    </div>
    <div class="lesson-body unit-${esc(c.color)}">
      <div class="video">${video}</div>
      <div class="files">${files}</div>
    </div>
    <nav class="pager">
      ${prev ? `<a href="#/lesson/${esc(prev.id)}">← ${esc(t("prev"))}: ${esc(pick(prev.title))}</a>` : "<span></span>"}
      ${next ? `<a href="#/lesson/${esc(next.id)}">${esc(t("next"))}: ${esc(pick(next.title))} →</a>` : "<span></span>"}
    </nav>
    ${waitlistBlock()}
    ${adBlock()}`;
  document.title = `${pick(l.title)} · ${state.site.name || "KOREAN PLAYGROUND"}`;
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
  route();
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
    Object.assign(state, { site, t: i18n, courses: data.courses, lessons: data.lessons });
  } catch (e) {
    app.innerHTML = `<p>Could not load data. ${esc(e.message)}</p>`;
    return;
  }
  renderFooter();
  document.querySelectorAll(".lang button").forEach(b =>
    b.addEventListener("click", () => setLang(b.dataset.lang)));
  window.addEventListener("hashchange", route);

  let saved = null;
  try { saved = localStorage.getItem("kp-lang"); } catch (e) {}
  setLang(saved || state.site.defaultLang);
}

init();
