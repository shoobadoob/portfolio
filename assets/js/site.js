/* Research portfolio, shared behaviour (no dependencies)
   - contents column + scroll-spy, sticky heading offsets
   - parallax chapter openers, reading progress
   - citation / definition margin notes (from window.REFS / window.GLOSS)
   - lightbox, mobile drawer, shared tooltip (window.Tip)            */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  };

  /* ---------------- tooltip ---------------- */
  const tip = document.createElement("div");
  tip.className = "tip"; tip.setAttribute("role", "tooltip");
  document.body.appendChild(tip);
  window.Tip = {
    show(html, x, y) {
      tip.innerHTML = html; tip.classList.add("on");
      const w = tip.offsetWidth, h = tip.offsetHeight;
      let left = x + 14, top = y + 14;
      if (left + w > innerWidth - 8) left = x - w - 14;
      if (top + h > innerHeight - 8) top = y - h - 14;
      tip.style.left = Math.max(8, left) + "px"; tip.style.top = Math.max(8, top) + "px";
    },
    hide() { tip.classList.remove("on"); }
  };

  /* ---------------- margin notes: dropdowns for citations & definitions ---------------- */
  const REFS = window.REFS || {};
  const GLOSS = window.GLOSS || {};
  const strip = s => String(s).replace(/<[^>]+>/g, "");
  const SKIP = ".note, table, .chart, .cap, .wide, .stickies, .tasks, .stages, .thread, .symptoms, .metrics";
  function refLink(r) {
    if (r.doi) return `<a class="src" href="https://doi.org/${r.doi}" target="_blank" rel="noopener">DOI ↗</a>`;
    if (r.url) return `<a class="src" href="${r.url}" target="_blank" rel="noopener">Link ↗</a>`;
    const q = encodeURIComponent(r.q || strip(r.c).replace(/^.*?\(\w*\.?\s?\w*\)\.\s*/, "").split(".")[0]);
    return `<a class="src" href="https://scholar.google.com/scholar?q=${q}" target="_blank" rel="noopener">Scholar ↗</a>`;
  }
  const isNumeric = Object.keys(REFS).every(k => /^\d+$/.test(k));
  function refLabel(k) { return isNumeric ? `[${k}]` : (REFS[k] && REFS[k].s) || k; }
  // short "Author et al. 2018" title for the collapsed header
  function shortRef(k) {
    const r = REFS[k]; if (!r) return k;
    if (r.s) return r.s;
    const t = strip(r.c).replace(/&amp;/g, "&");
    const m = t.match(/^(.+?)\s\((\d{4}|n\.d\.)[^)]*\)/);
    if (!m) return t.split(". ")[0];
    const auth = m[1], year = m[2] === "n.d." ? "" : " " + m[2];
    if (!/,\s*[A-Z]\./.test(auth)) return auth.replace(/\.\s/, " · ") + year;     // organization / web source
    const first = auth.split(",")[0].trim();
    const commas = (auth.match(/,/g) || []).length;
    if (/et al/.test(auth) || commas >= 4) return `${first} et al.${year}`;
    if (auth.includes("&")) return `${first} & ${auth.split("&")[1].trim().split(",")[0]}${year}`;
    return first + year;
  }
  // a note for an anchor inside a column-3 steps box goes below the panel, not inside it
  function placeNote(a, after, n) {
    const st = a.closest(".stepbox");
    if (st) { n.classList.add("st"); (st._tail || st).after(n); st._tail = n; } else after.after(n);
  }
  let uid = 0;
  function makeNote(kind, key, label, title, body) {
    const n = document.createElement("span");
    const id = "nb-" + (++uid);
    n.className = `note dd ${kind}`; n.setAttribute("role", "note");
    if (kind === "ref") n.dataset.refs = key; else n.dataset.def = key;
    n.innerHTML = `<button class="nh" type="button" aria-expanded="false" aria-controls="${id}"><span class="nk">${label}</span><span class="nt">${title}</span><span class="chev" aria-hidden="true"></span></button><span class="nb" id="${id}"><span class="nbi"><span class="nbc">${body}</span></span></span>`;
    return n;
  }
  function syncAria(n) {
    const b = n.querySelector(".nh");
    if (b) b.setAttribute("aria-expanded", String(n.classList.contains("is-open") || n.classList.contains("is-peek")));
  }
  function setOpen(n, open) { n.classList.toggle("is-open", open); syncAria(n); }

  // citation anchors: one dropdown per reference, first use per (sub)section
  const seen = new Map();
  $$(".cite").forEach(a => {
    const keys = (a.dataset.ref || "").split(/[\s,]+/).filter(Boolean);
    if (!keys.length) return;
    if (isNumeric && !a.textContent.trim()) a.textContent = "[" + compressNums(keys) + "]";
    if (!a.getAttribute("href")) a.setAttribute("href", "#ref-" + keys[0]);
    a._notes = [];
    if (a.closest(SKIP)) return;
    const box = a.closest(".sub") || a.closest(".sec") || document.body;
    if (!seen.has(box)) seen.set(box, new Set());
    const set = seen.get(box);
    let after = a;
    keys.filter(k => REFS[k] && !set.has(k)).forEach(k => {
      set.add(k);
      const r = REFS[k];
      const n = makeNote("ref", k, isNumeric ? `<b>[${k}]</b>` : "Ref", shortRef(k), `${r.c} ${refLink(r)}`);
      n._anchor = a;
      placeNote(a, after, n); after = n;
      a._notes.push(n);
    });
  });
  function compressNums(keys) {
    const n = keys.map(Number).sort((x, y) => x - y);
    const out = []; let s = n[0], p = n[0];
    for (let i = 1; i <= n.length; i++) {
      if (n[i] === p + 1) { p = n[i]; continue; }
      out.push(s === p ? String(s) : (p === s + 1 ? s + ", " + p : s + "-" + p));
      s = p = n[i];
    }
    return out.join(", ");
  }

  // definition anchors: first use per chapter
  const defined = new Set();
  $$("dfn.term").forEach(d => {
    const k = d.dataset.def; const g = GLOSS[k];
    d._notes = [];
    if (!g) return;
    d.tabIndex = 0;
    const ch = d.closest(".chapter");
    const scope = (ch ? ch.id : "page") + ":" + k;
    if (defined.has(scope) || d.closest(SKIP)) return;
    defined.add(scope);
    const src = g.url ? ` <a class="src" href="${g.url}" target="_blank" rel="noopener">${g.src || "Source"} ↗</a>` : (g.src ? ` <span class="src" style="color:var(--muted)">${g.src}</span>` : "");
    const n = makeNote("def", k, "Def", g.t, `<dfn>${g.t}</dfn>: ${g.d}${src}`);
    n._anchor = d;
    placeNote(d, d, n);
    d._notes.push(n);
  });

  // the notes an anchor drives: its own, or the matching note earlier in the section / chapter
  function notesFor(el) {
    if (el._notes && el._notes.length) return el._notes;
    if (el.classList.contains("cite")) {
      const keys = (el.dataset.ref || "").split(/[\s,]+/);
      const scope = el.closest(".sec") || document;
      return $$(".note.ref", scope).filter(x => keys.includes(x.dataset.refs));
    }
    const ch = el.closest(".chapter") || document;
    return $$(`.note.def[data-def="${el.dataset.def}"]`, ch);
  }
  const wide = () => innerWidth >= 820;
  function near(n, el) {
    if (!n || n.offsetParent === null) return false;
    const r = n.getBoundingClientRect();
    return r.bottom > 0 && r.top < innerHeight && Math.abs(r.top - el.getBoundingClientRect().top) < innerHeight * .6;
  }
  function peek(n, on) {
    clearTimeout(n._t);
    n.classList.toggle("is-peek", on);
    n.classList.toggle("is-hl", on);
    syncAria(n);
  }
  function tipHtml(el) {
    if (el.classList.contains("cite")) {
      const keys = (el.dataset.ref || "").split(/[\s,]+/);
      return keys.filter(k => REFS[k]).map(k => `<span class="k">${refLabel(k)}</span>${REFS[k].c}`).join("<br><br>");
    }
    const g = GLOSS[el.dataset.def];
    return g ? `<span class="k">Definition</span><b>${g.t}</b>: ${g.d}` : "";
  }
  function hoverIn(el, e) {
    const ns = wide() ? notesFor(el).filter(n => near(n, el)) : [];
    el.classList.add("is-hl");
    if (ns.length) { ns.forEach(n => peek(n, true)); el._peeked = ns; return; }
    const html = tipHtml(el); if (html) Tip.show(html, e.clientX, e.clientY);
  }
  function hoverOut(el) {
    el.classList.remove("is-hl"); Tip.hide();
    (el._peeked || []).forEach(n => { n._t = setTimeout(() => { if (!n.matches(":hover")) peek(n, false); }, 220); });
    el._peeked = null;
  }
  $$(".cite, dfn.term").forEach(el => {
    el.addEventListener("mouseenter", e => hoverIn(el, e));
    el.addEventListener("mouseleave", () => hoverOut(el));
    el.addEventListener("focus", () => { const r = el.getBoundingClientRect(); hoverIn(el, { clientX: r.left, clientY: r.bottom }); });
    el.addEventListener("blur", () => hoverOut(el));
    el.addEventListener("click", e => {
      const ns = notesFor(el).filter(n => wide() ? near(n, el) : (el._notes || []).includes(n));
      if (!ns.length) return;                       // no note nearby: follow the link to the reference list
      e.preventDefault();
      const open = !ns.every(n => n.classList.contains("is-open"));
      ns.forEach(n => setOpen(n, open));
    });
    el.addEventListener("keydown", e => { if (el.tagName === "DFN" && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); el.click(); } });
  });
  // the note itself: click the header to open/close; hovering it keeps a peek open and highlights its anchor
  $$(".note.dd").forEach(n => {
    n.querySelector(".nh").addEventListener("click", () => setOpen(n, !n.classList.contains("is-open")));
    n.addEventListener("mouseenter", () => { clearTimeout(n._t); if (n._anchor) n._anchor.classList.add("is-hl"); });
    n.addEventListener("mouseleave", () => { if (n._anchor) n._anchor.classList.remove("is-hl"); if (n.classList.contains("is-peek")) peek(n, false); });
  });

  /* ---------------- reference list + glossary ---------------- */
  const refList = $("#ref-list");
  if (refList) {
    const keys = Object.keys(REFS);
    if (isNumeric) keys.sort((a, b) => a - b); else { refList.classList.add("ay"); keys.sort((a, b) => strip(REFS[a].c).localeCompare(strip(REFS[b].c))); }
    refList.innerHTML = keys.map(k => `<li id="ref-${k}">${isNumeric ? `<span class="rk">[${k}]</span>` : ""}<span>${REFS[k].c} ${refLink(REFS[k]).replace('class="src"', 'class="src"')}</span></li>`).join("");
  }
  const glossList = $("#gloss-list");
  if (glossList) {
    const ks = Object.keys(GLOSS).sort((a, b) => GLOSS[a].t.localeCompare(GLOSS[b].t));
    glossList.innerHTML = ks.map(k => { const g = GLOSS[k]; return `<dt id="def-${k}">${g.t}</dt><dd>${g.d}${g.url ? ` <a class="src" style="font-family:var(--mono);font-size:.68rem;color:var(--accent);text-decoration:none" href="${g.url}" target="_blank" rel="noopener">${g.src || "Source"} ↗</a>` : ""}</dd>`; }).join("");
  }

  /* ---------------- sticky heading labels + offsets ---------------- */
  $$(".chapter").forEach(ch => {
    const num = ch.dataset.num || "";
    const short = ch.dataset.short || ch.dataset.title || "";
    $$(".sec-h", ch).forEach(h => {
      if (h.querySelector(".ch")) return;
      const s = document.createElement("span"); s.className = "ch";
      s.innerHTML = `<b>${num}</b> ${short}`;
      h.prepend(s);
    });
  });
  // --h2h / --h3h: heights of the section and subsection bars, so subsection bars
  // and sticky table heads can stack underneath them
  let stickyTop = 0;
  function measure() {
    stickyTop = parseFloat(getComputedStyle(root).getPropertyValue("--sticky-top")) || 0;
    $$(".sec").forEach(sec => { const h = sec.querySelector(":scope > .sec-h"); if (h) sec.style.setProperty("--h2h", h.offsetHeight + "px"); });
    $$(".sub").forEach(sub => { const h = sub.querySelector(":scope > .sub-h"); if (h) sub.style.setProperty("--h3h", h.offsetHeight + "px"); });
  }
  measure();
  if ("ResizeObserver" in window) { const ro = new ResizeObserver(() => measure()); $$(".sec-h, .sub-h").forEach(h => ro.observe(h)); }
  window.addEventListener("load", measure);

  /* ---------------- contents column ---------------- */
  const tocList = $("#toc-list");
  const chapters = $$(".chapter, [data-toc-chapter]");
  if (tocList) {
    tocList.innerHTML = chapters.map(ch => {
      const secs = $$(".sec", ch).filter(s => s.id && s.querySelector(".sec-h"));
      const sub = secs.length ? `<div class="toc-secs"><div><ol>${secs.map(s => {
        const h = s.querySelector(".sec-h");
        const txt = h.dataset.short || Array.from(h.childNodes).filter(n => !(n.classList && n.classList.contains("ch"))).map(n => n.textContent).join("").trim();
        return `<li><a href="#${s.id}" data-sec="${s.id}">${txt}</a></li>`;
      }).join("")}</ol></div></div>` : "";
      return `<li class="toc-ch" data-ch="${ch.id}"><a href="#${ch.id}"><span class="n">${ch.dataset.num || ""}</span><span>${ch.dataset.title || ""}</span></a>${sub}</li>`;
    }).join("");
  }
  const tocLinks = $$(".toc-secs a");
  const barCur = $(".bar .cur");
  let activeSec = null;
  function setActive(sec) {
    if (!sec || sec === activeSec) return;
    activeSec = sec;
    const ch = sec.closest(".chapter, [data-toc-chapter]");
    $$(".toc-ch").forEach(li => li.classList.toggle("is-active", ch && li.dataset.ch === ch.id));
    tocLinks.forEach(a => a.classList.toggle("is-active", a.dataset.sec === sec.id));
    if (barCur && ch) barCur.textContent = (ch.dataset.num ? ch.dataset.num + " · " : "") + (ch.dataset.title || "");
    const link = tocLinks.find(a => a.dataset.sec === sec.id);
    const toc = $(".toc");
    if (link && toc && innerWidth >= 1180) {
      const lr = link.getBoundingClientRect(), tr = toc.getBoundingClientRect();
      if (lr.top < tr.top + 80 || lr.bottom > tr.bottom - 120) toc.scrollTo({ top: toc.scrollTop + lr.top - tr.top - tr.height / 3, behavior: reduce ? "auto" : "smooth" });
    }
  }
  const spyTargets = $$(".sec[id], .chapter, [data-toc-chapter]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const t = en.target;
        if (t.classList.contains("sec")) setActive(t);
        else { const first = t.querySelector(".sec[id]"); if (first && (!activeSec || !t.contains(activeSec))) { setActive(first); } }
      });
    }, { rootMargin: "-38% 0px -58% 0px" });
    spyTargets.forEach(s => io.observe(s));
  }
  // mobile drawer
  document.addEventListener("click", e => {
    if (e.target.closest("[data-toc-open]")) { document.body.classList.add("toc-open"); return; }
    if (e.target.closest(".scrim") || (e.target.closest(".toc a") && innerWidth < 1180)) document.body.classList.remove("toc-open");
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") document.body.classList.remove("toc-open"); });

  /* ---------------- sticky table headers ----------------
     A table that fits its column gets .is-fit (no sideways scroller), so its head
     row uses native position: sticky (see site.css). A table that has to scroll
     sideways keeps its scroller, which would trap sticky, so frame() slides its
     head row down with --thy instead. */
  const tboxes = $$(".tbl-scroll").filter(b => b.querySelector("table > thead"));
  tboxes.forEach(b => { b._tbl = b.querySelector("table"); b._head = b._tbl.tHead; });
  function fitTables() {
    tboxes.forEach(b => {
      b.classList.remove("is-fit");
      if (b.offsetParent !== null && b._tbl.offsetWidth <= b.clientWidth + 1) b.classList.add("is-fit");
    });
  }
  fitTables();
  window.addEventListener("load", fitTables);
  $$("details").forEach(d => d.addEventListener("toggle", () => { fitTables(); onScroll(); }));
  /* Table titles start level with their tables. A column-3 title floats beside the
     top of its table unless margin notes from the text above still fill that spot;
     then the table moves down to meet its title. Measured with every note closed,
     so opening a note later never shifts the text column. */
  const capTables = $$("figure.tbl:not(.wide)").filter(f => f.querySelector(":scope > .cap"));
  function alignTableTitles() {
    capTables.forEach(f => {
      f.style.marginTop = "";
      if (!wide()) return;
      const cap = f.querySelector(":scope > .cap"), body = cap.nextElementSibling;
      if (!body) return;
      const push = cap.getBoundingClientRect().top - body.getBoundingClientRect().top;
      if (push > 1) f.style.marginTop = `calc(1.4rem + ${Math.ceil(push)}px)`;
    });
  }
  alignTableTitles();
  window.addEventListener("load", alignTableTitles);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignTableTitles);
  /* Tutorial page: a picture right after a column-3 steps box keeps its title level with
     its top (.cap-beside); the steps box starts below that title. */
  const stepFigs = $$(".sec.has-steps > .stepbox").map(st => {
    let f = st.nextElementSibling;
    while (f && f.matches(".note")) f = f.nextElementSibling;
    return f && f.matches(".fig") && f.querySelector(":scope > .cap") ? { st, f, cap: f.querySelector(":scope > .cap") } : null;
  }).filter(Boolean);
  function seatStepCaps() {
    stepFigs.forEach(({ st, f, cap }) => {
      st.style.marginTop = "";
      f.classList.toggle("cap-beside", wide());
      if (!wide()) return;
      const gap = cap.getBoundingClientRect().bottom - st.getBoundingClientRect().top;
      st.style.marginTop = Math.ceil(gap + 26) + "px";
    });
  }
  seatStepCaps();
  window.addEventListener("load", seatStepCaps);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(seatStepCaps);
  // bottom edge of the heading bars stuck above a table
  function stackBottom(b) {
    let y = stickyTop;
    const sec = b.closest(".sec"), sub = b.closest(".sub");
    const sh = sec && sec.querySelector(":scope > .sec-h"), uh = sub && sub.querySelector(":scope > .sub-h");
    if (sh) y = Math.max(y, sh.getBoundingClientRect().bottom);
    if (uh) y = Math.max(y, uh.getBoundingClientRect().bottom);
    return y;
  }

  /* ---------------- parallax + progress ---------------- */
  const openers = $$(".opener");
  const hero = $(".hero");
  const heroH1 = hero && $("h1", hero);
  const heroImg = hero && $(".hero-figure img", hero);
  const prog = $$(".progress span, .toc-meter span");
  const pct = $("[data-pct]");
  let ticking = false;
  function frame() {
    ticking = false;
    const vh = innerHeight, y = scrollY;
    const max = document.documentElement.scrollHeight - vh;
    const p = max > 0 ? Math.min(1, y / max) : 0;
    prog.forEach(s => s.style.setProperty("--p", p.toFixed(4)));
    if (pct) pct.textContent = Math.round(p * 100) + "%";
    // sideways-scrolling tables: measure every table first, then move the head rows
    const moves = [];
    for (const b of tboxes) {
      let off = 0;
      if (!b.classList.contains("is-fit")) {
        const r = b._tbl.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) off = Math.max(0, Math.min(r.height - b._head.offsetHeight, stackBottom(b) - r.top));
      }
      if (off !== (b._thy || 0)) moves.push([b, off]);
    }
    moves.forEach(([b, off]) => { b._thy = off; if (off) b.style.setProperty("--thy", off.toFixed(1) + "px"); else b.style.removeProperty("--thy"); });
    if (reduce) return;
    if (hero && y < vh * 1.2) {
      if (heroH1) heroH1.style.setProperty("--hy", (y * -0.18).toFixed(1) + "px");
      if (heroImg) heroImg.style.setProperty("--hiy", (y * 0.22).toFixed(1) + "px");
    }
    // openers scroll with the page; --t runs -1 (entering) .. 0 (filling the screen) .. 1 (leaving)
    for (const op of openers) {
      const r = op.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      const t = Math.max(-1.2, Math.min(1.2, -r.top / vh));
      if (op._t !== undefined && Math.abs(op._t - t) < 0.001) continue;
      op._t = t;
      op.style.setProperty("--t", t.toFixed(4));
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", () => { measure(); fitTables(); seatStepCaps(); alignTableTitles(); onScroll(); });
  frame();

  /* ---------------- slow motion at each new chapter ----------------
     Wheel and keyboard scrolling are eased, and their speed falls smoothly to SLOW
     as a chapter opener fills the screen, then recovers: one continuous motion
     with a slow-motion beat at every new chapter. Touch, the scrollbar, links and
     reduced-motion users keep the browser's native scrolling. */
  if (!reduce && openers.length) (function slowMotion() {
    const SLOW = 0.3;               // slowest speed, as a share of normal
    const BEFORE = 1, AFTER = 0.8;  // reach of the slow zone before/after an opener fills the screen, in screen heights
    const EASE = 240;               // easing time constant, ms (longer = a softer, more fluid glide)
    const WHEEL = 0.6;              // distance per wheel notch, as a share of the browser's (lower = slower)
    let zones = [];
    const findZones = () => { zones = openers.map(op => op.getBoundingClientRect().top + scrollY); };
    findZones();
    addEventListener("load", findZones);
    addEventListener("resize", findZones);
    if ("ResizeObserver" in window) new ResizeObserver(findZones).observe(document.body);
    // 1 = normal speed; dips along a cosine curve to SLOW where an opener fills the screen
    function speed(y) {
      const vh = innerHeight; let w = 0;
      for (const z of zones) {
        const d = (y - z) / vh, reach = d < 0 ? BEFORE : AFTER;
        if (Math.abs(d) < reach) w = Math.max(w, 0.5 + 0.5 * Math.cos(Math.PI * d / reach));
      }
      return 1 - (1 - SLOW) * w;
    }
    let target = 0, pos = 0, last = 0, running = false, written = null;
    function stop() { running = false; written = null; root.style.scrollBehavior = ""; }
    function step(now) {
      if (!running) return;
      const dt = last ? Math.min(50, now - last) : 16; last = now;
      pos += (target - pos) * (1 - Math.exp(-dt / EASE));
      if (Math.abs(target - pos) < 0.5) pos = target;
      written = pos;
      scrollTo(0, pos);
      frame();
      if (pos === target) stop(); else requestAnimationFrame(step);
    }
    function glide(dy) {
      if (!running) pos = target = scrollY;
      // walk the distance in small steps so a long jump still slows through a zone
      for (let left = Math.abs(dy), s = Math.sign(dy); left > 0; left -= 24) target += s * Math.min(24, left) * speed(target);
      target = Math.max(0, Math.min(document.documentElement.scrollHeight - innerHeight, target));
      if (!running) { running = true; last = 0; root.style.scrollBehavior = "auto"; requestAnimationFrame(step); }
    }
    // something else moved the page (scrollbar, link, find-in-page): let go
    addEventListener("scroll", () => { if (running && written !== null && Math.abs(scrollY - written) > 3) stop(); }, { passive: true });
    ["pointerdown", "touchstart"].forEach(t => addEventListener(t, () => { if (running) stop(); }, { passive: true }));
    function scrollsInside(el, dy) {
      for (; el && el !== document.body && el !== root; el = el.parentElement) {
        if (el.scrollHeight <= el.clientHeight + 1) continue;
        const oy = getComputedStyle(el).overflowY;
        if (oy !== "auto" && oy !== "scroll") continue;
        if (dy > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0) return true;
      }
      return false;
    }
    const blocked = () => document.body.classList.contains("toc-open") || document.querySelector("dialog[open]");
    addEventListener("wheel", e => {
      if (e.defaultPrevented || e.ctrlKey || e.shiftKey || blocked()) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;   // sideways: tables, trackpads
      if (scrollsInside(e.target, e.deltaY)) return;
      const dy = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? innerHeight : 1);
      if (!dy) return;
      e.preventDefault();
      glide(dy * WHEEL);
    }, { passive: false });
    addEventListener("keydown", e => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || blocked()) return;
      const el = e.target;
      if (el.closest && el.closest("input, textarea, select, [contenteditable]")) return;
      const page = innerHeight * 0.85;
      const dy = { ArrowDown: 80, ArrowUp: -80, PageDown: page, PageUp: -page, " ": e.shiftKey ? -page : page }[e.key];
      if (dy === undefined) { if (running) stop(); return; }   // Home, End, Tab, Enter: native
      if (e.key === " " && el.closest && el.closest("button, summary, a, [role=button]")) return;
      if (scrollsInside(el, dy)) return;
      e.preventDefault();
      glide(dy);
    });
  })();

  /* ---------------- tabs (participant sticky-note boards) ----------------
     Click or arrow keys switch panels. If the tab row is pinned (the reader is
     part-way down a long board), the page jumps back to the top of the new board. */
  $$(".ptabs[role=tablist]").forEach(list => {
    const tabs = $$("[role=tab]", list);
    const panels = tabs.map(t => document.getElementById(t.getAttribute("aria-controls")));
    const anchor = list.previousElementSibling && list.previousElementSibling.classList.contains("ptabs-anchor") ? list.previousElementSibling : null;
    function select(i, focus) {
      const pinned = anchor && anchor.getBoundingClientRect().top < list.getBoundingClientRect().top - 1;
      const pinTop = list.getBoundingClientRect().top;
      tabs.forEach((t, k) => {
        const on = k === i;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        if (panels[k]) panels[k].hidden = !on;
      });
      if (focus) tabs[i].focus({ preventScroll: true });
      if (pinned) scrollTo({ top: scrollY + anchor.getBoundingClientRect().top - pinTop, behavior: "auto" });
      dispatchEvent(new Event("resize"));
    }
    tabs.forEach((t, i) => t.addEventListener("click", () => select(i, false)));
    list.addEventListener("keydown", e => {
      const i = tabs.indexOf(document.activeElement); if (i < 0) return;
      const k = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (k === undefined) return;
      e.preventDefault();
      select((k + tabs.length) % tabs.length, true);
    });
    select(Math.max(0, tabs.findIndex(t => t.getAttribute("aria-selected") === "true")), false);
  });

  /* ---------------- task matrix (gloves Fig. 2.1): hover or focus a task to show its card in the caption ---------------- */
  $$(".tmatrix").forEach(mx => {
    const fig = mx.closest("figure"), out = fig && $(".cap-d", fig);
    if (!out) return;
    const empty = out.innerHTML;
    const STEP = { 1: "Step 1: aligning the zipper uses fine hand + fine finger movement.", 2: "Step 2: pulling the zipper up and pushing in the snap buttons uses fine hand + gross finger movement." };
    let pinned = null;
    function show(btn) {
      const n = btn.dataset.task;
      $$(".tm-task", mx).forEach(b => b.classList.toggle("is-on", b.dataset.task === n));
      mx.classList.add("is-hovering");
      const card = document.querySelector(`.task[data-task="${n}"]`);
      out.innerHTML = "";
      if (card) out.appendChild(card.cloneNode(true));
      if (btn.dataset.step) { const s = document.createElement("span"); s.className = "step"; s.textContent = STEP[btn.dataset.step]; out.appendChild(s); }
    }
    function clear() {
      if (pinned) { show(pinned); return; }
      $$(".tm-task", mx).forEach(b => b.classList.remove("is-on"));
      mx.classList.remove("is-hovering");
      out.innerHTML = empty;
    }
    $$(".tm-task", mx).forEach(b => {
      b.setAttribute("aria-label", `Task ${b.dataset.task}, ${$("span", b).textContent}: show details`);
      b.addEventListener("mouseenter", () => show(b));
      b.addEventListener("mouseleave", clear);
      b.addEventListener("focus", () => show(b));
      b.addEventListener("blur", clear);
      b.addEventListener("click", () => { pinned = pinned === b ? null : b; show(b); });
    });
  });

  /* ---------------- magnifying lens (gloves Fig. 2.9): follows the pointer over .magnify ----------------
     The lens holds a scaled copy of the figure, shifted so the point under the pointer sits in its middle.
     Mouse and pen only; on touch screens the map is laid out larger instead. */
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) $$(".magnify").forEach(box => {
    const src = box.firstElementChild;
    if (!src) return;
    const Z = 2.6, D = 240, R = D / 2;
    const lens = document.createElement("div"); lens.className = "lens"; lens.setAttribute("aria-hidden", "true");
    const inner = document.createElement("div"); inner.className = "lens-in";
    lens.appendChild(inner); box.appendChild(lens);
    function build() {
      const c = src.cloneNode(true);
      [c, ...c.querySelectorAll("[id], [role], [aria-label]")].forEach(e => { e.removeAttribute("id"); e.removeAttribute("role"); e.removeAttribute("aria-label"); });
      c.style.width = src.offsetWidth + "px"; c.style.margin = "0";
      inner.replaceChildren(c);
    }
    let built = false, px = 0, py = 0, raf = 0, rt = 0;
    function place() {
      raf = 0;
      lens.style.left = (src.offsetLeft + px - R) + "px";
      lens.style.top = (src.offsetTop + py - R) + "px";
      inner.style.transform = `translate(${R - px * Z}px, ${R - py * Z}px) scale(${Z})`;
    }
    box.addEventListener("mousemove", e => {
      const r = src.getBoundingClientRect();
      px = e.clientX - r.left; py = e.clientY - r.top;
      if (!raf) raf = requestAnimationFrame(place);
    });
    box.addEventListener("mouseenter", e => {
      if (!built) { build(); built = true; }
      const r = src.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; place();
      lens.classList.add("on"); box.classList.add("has-lens");
    });
    box.addEventListener("mouseleave", () => { lens.classList.remove("on"); box.classList.remove("has-lens"); });
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (built) build(); }, 200); });
  });

  /* ---------------- hero turntable: autoplays and loops; pause / play button ---------------- */
  $$(".hero-figure[data-anim]").forEach(fig => {
    const img = $("img", fig), btn = $(".hero-play", fig);
    if (!img || !btn) return;
    const still = img.getAttribute("src"), anim = fig.dataset.anim;
    const ICON = {
      pause: '<svg viewBox="0 0 10 10" aria-hidden="true"><rect x="1.5" y="1" width="2.4" height="8"/><rect x="6.1" y="1" width="2.4" height="8"/></svg>',
      play: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1l7 4-7 4z"/></svg>'
    };
    function set(on) {
      img.src = on ? anim : still;
      btn.innerHTML = on ? ICON.pause + "Pause" : ICON.play + "Play";
      btn.setAttribute("aria-label", (on ? "Pause" : "Play") + " the rotating glove");
      fig.classList.toggle("is-playing", on);
    }
    btn.hidden = false;
    btn.addEventListener("click", () => set(!fig.classList.contains("is-playing")));
    set(true);   // always plays and loops; the button pauses it
  });

  /* ---------------- Lottie figure (armband Fig. 4.17): loads when near the screen, loops,
     pauses while off screen; pause / play button. The poster <img> shows until it loads
     (and stays if scripts fail, or in print). Player: lottie-web light, in assets/js/vendor. ---------------- */
  const PLAY_ICON = {
    pause: '<svg viewBox="0 0 10 10" aria-hidden="true"><rect x="1.5" y="1" width="2.4" height="8"/><rect x="6.1" y="1" width="2.4" height="8"/></svg>',
    play: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1l7 4-7 4z"/></svg>'
  };
  const scriptOnce = {};
  const loadScript = src => scriptOnce[src] || (scriptOnce[src] = new Promise((ok, no) => {
    const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s);
  }));
  $$("[data-lottie]").forEach(box => {
    const stage = $(".lottie-stage", box), btn = $(".hero-play", box);
    let anim = null, started = false, onScreen = false, paused = false;
    const sync = () => { if (anim) (onScreen && !paused) ? anim.play() : anim.pause(); };
    function setBtn() {
      btn.innerHTML = paused ? PLAY_ICON.play + "Play" : PLAY_ICON.pause + "Pause";
      btn.setAttribute("aria-label", (paused ? "Play" : "Pause") + " the animation");
    }
    function start() {
      if (started) return; started = true;
      loadScript(box.dataset.player).then(() => loadScript(box.dataset.lottie)).then(() => {
        anim = window.lottie.loadAnimation({
          container: stage, renderer: "svg", loop: true, autoplay: false,
          animationData: window[box.dataset.var], assetsPath: box.dataset.assets,
          rendererSettings: { preserveAspectRatio: "xMidYMid meet" }
        });
        anim.addEventListener("DOMLoaded", () => { box.classList.add("is-live"); btn.hidden = false; setBtn(); sync(); });
      }).catch(() => {});   // the poster stays
    }
    btn.addEventListener("click", () => { paused = !paused; setBtn(); sync(); });
    new IntersectionObserver(es => es.forEach(e => {
      onScreen = e.isIntersecting;
      if (onScreen) start();
      sync();
    }), { rootMargin: "400px 0px" }).observe(box);
  });

  /* ---------------- lightbox ---------------- */
  const dlg = document.createElement("dialog");
  dlg.className = "lightbox";
  dlg.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure><button class="btn-ghost" type="button" aria-label="Close image">Close ✕</button>';
  document.body.appendChild(dlg);
  const dImg = $("img", dlg), dCap = $("figcaption", dlg);
  document.addEventListener("click", e => {
    const img = e.target.closest(".fig img:not(.lottie-poster), .gallery img, .op-img img, .tform .tf-img img");
    if (!img || !dlg.showModal) return;
    const fig = img.closest("figure");
    const cap = fig && fig.querySelector(".cap-t");
    const n = fig && fig.querySelector(".cap-n");
    dImg.src = img.currentSrc || img.src; dImg.alt = img.alt;
    dCap.textContent = (n ? n.textContent + ": " : "") + (cap ? cap.textContent : img.alt);
    dlg.showModal();
  });
  dlg.addEventListener("click", e => { if (e.target === dlg || e.target.closest("button")) dlg.close(); });

})();
