/* Small, dependency-free chart helpers.
   Colors come from CSS custom properties (var(--series-1) etc.), so light/dark
   themes swap without re-rendering. Marks follow: <=24px bars with a 4px rounded
   data end, 2px surface gaps, >=8px dots with a 2px surface ring, hairline grid. */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) {
      if (k === "style") n.setAttribute("style", attrs[k]);
      else if (k === "text") n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    if (parent) parent.appendChild(n);
    return n;
  };
  const fmt = (v, d = 1) => (Math.round(v * 10 ** d) / 10 ** d).toFixed(d);
  const tipOn = (node, html) => {
    node.addEventListener("mousemove", e => window.Tip && Tip.show(typeof html === "function" ? html() : html, e.clientX, e.clientY));
    node.addEventListener("mouseleave", () => window.Tip && Tip.hide());
  };
  // horizontal bar path: square at x0, 4px rounded at the data end
  const barPath = (x0, y, w, h, r = 4) => {
    r = Math.min(r, w, h / 2);
    if (w <= 0) return "";
    return `M${x0},${y}H${x0 + w - r}Q${x0 + w},${y} ${x0 + w},${y + r}V${y + h - r}Q${x0 + w},${y + h} ${x0 + w - r},${y + h}H${x0}Z`;
  };
  const niceMax = (m, step) => Math.ceil(m / step) * step;
  function onResize(fn) {
    let w = 0, t;
    const ro = new ResizeObserver(entries => {
      const nw = Math.round(entries[0].contentRect.width);
      if (Math.abs(nw - w) < 4) return;
      w = nw; clearTimeout(t); t = setTimeout(fn, 60);
    });
    return ro;
  }
  function legend(host, items) {
    const lg = document.createElement("div");
    lg.className = "chart-legend";
    lg.innerHTML = items.map(i => `<span><i style="background:${i.color}"></i>${i.name}</span>`).join("");
    host.appendChild(lg);
  }
  /* legend whose chips isolate one series (emphasis: the rest fade back); click again for all */
  function pickLegend(host, items, get, set) {
    const lg = document.createElement("div");
    lg.className = "chart-legend is-pick";
    lg.setAttribute("role", "group");
    lg.setAttribute("aria-label", "Highlight one series");
    lg.innerHTML = items.map(i => `<button type="button" data-s="${i.name}" aria-pressed="${get() === i.name}"><i style="background:${i.color}"></i>${i.name}</button>`).join("") +
      `<span class="lg-hint">${get() ? "Click again to show all" : "Click to isolate"}</span>`;
    lg.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      set(get() === b.dataset.s ? null : b.dataset.s);
      lg.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(get() === x.dataset.s)));
      lg.querySelector(".lg-hint").textContent = get() ? "Click again to show all" : "Click to isolate";
    });
    host.appendChild(lg);
  }
  const dim = (host, focus) => host.querySelectorAll(".mark[data-s]").forEach(m => m.classList.toggle("is-dim", !!focus && m.dataset.s !== focus));
  const swatchRows = (series, val) => series.map(s => `<span class="tr"><i class="sw" style="background:${s.color}"></i>${s.name}<b>${val(s)}</b></span>`).join("");

  /* ---------- grouped horizontal bars ----------
     cats: strings, or {n, t} (number + name). groups: [{at, label}] headers above a
     category (dividers/dividerLabel still work). nameFirst: series names printed at
     the bar ends of the first category (direct labels). groupTip: one hover target
     per category listing every series. pick: legend chips isolate a series.
     notes: [{cat, s, text}] short annotations at a bar end. */
  function hbars(host, cfg) {
    let focus = null;
    const heads = {};
    (cfg.dividers || []).forEach(i => { heads[i] = cfg.dividerLabel || ""; });
    (cfg.groups || []).forEach(g => { heads[g.at] = g.label; });
    const dec = cfg.decimals == null ? 1 : cfg.decimals;
    const catTip = c => typeof c === "string" ? c : `#${c.n} ${c.t}`;
    const draw = () => {
      host.innerHTML = "";
      if (cfg.series.length > 1) {
        if (cfg.pick) pickLegend(host, cfg.series, () => focus, f => { focus = f; dim(host, focus); });
        else legend(host, cfg.series);
      }
      const W = Math.max(300, host.clientWidth - 36);
      const labelW = cfg.labelW || (cfg.cats.some(c => c.img) ? Math.min(160, W * .4) : Math.min(170, W * .34));
      const barH = cfg.barH || 11, inner = 2, groupGap = cfg.groupGap || 14;
      const gH = cfg.series.length * barH + (cfg.series.length - 1) * inner;
      const top = 6, bottom = 26, headH = 20;
      const H = top + cfg.cats.length * (gH + groupGap) + Object.keys(heads).length * headH + bottom;
      const max = cfg.max || niceMax(Math.max(...cfg.series.flatMap(s => s.values)), cfg.step || 10);
      const x = v => labelW + (v / max) * (W - labelW - 44);
      const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": cfg.label || "" }, host);
      const step = cfg.step || 20;
      for (let v = 0; v <= max; v += step) {
        el("line", { class: "gridline", x1: x(v), x2: x(v), y1: top - 4, y2: H - bottom + 2 }, svg);
        el("text", { class: "tick", x: x(v), y: H - 8, "text-anchor": "middle", text: v }, svg);
      }
      el("text", { class: "tick", x: labelW - 10, y: H - 8, "text-anchor": "end", text: (cfg.unit || "") + " →" }, svg);
      let y = top;
      cfg.cats.forEach((c, i) => {
        if (i in heads) {
          if (y > top) el("line", { x1: 0, x2: W, y1: y + 4, y2: y + 4, style: "stroke:var(--rule)" }, svg);
          el("text", { class: "tick", x: 0, y: y + 15, text: heads[i].toUpperCase(), style: "letter-spacing:.06em" }, svg);
          y += headH;
        }
        if (c.img) {
          // icon + name, left-aligned in the label column
          const sz = Math.min(30, gH + 4);
          el("image", { href: c.img, x: 0, y: y + gH / 2 - sz / 2, width: sz, height: sz }, svg);
          el("text", { x: sz + 7, y: y + gH / 2 + 4, text: c.t, style: "fill:var(--ink);font-size:11.5px" }, svg);
        } else {
          const ct = el("text", { x: labelW - 10, y: y + gH / 2 + 4, "text-anchor": "end", style: "fill:var(--ink);font-size:11.5px" }, svg);
          if (typeof c === "string") ct.textContent = c;
          else { el("tspan", { style: "fill:var(--muted);font-family:var(--mono);font-size:10px", text: c.n + "  " }, ct); el("tspan", { text: c.t }, ct); }
        }
        const groupMarks = [];
        cfg.series.forEach((s, si) => {
          const v = s.values[i]; const by = y + si * (barH + inner);
          const g = el("g", { class: "mark", "data-s": s.name }, svg);
          groupMarks.push(g);
          el("path", { d: barPath(x(0), by, x(v) - x(0), barH), style: `fill:${s.color}` }, g);
          let endX = x(v) + 6;
          if (s.label !== false) { el("text", { x: endX, y: by + barH - 1.5, text: fmt(v, dec), style: "fill:var(--ink-2);font-size:10.5px;font-family:var(--mono)" }, g); endX += 34; }
          if (cfg.nameFirst && i === 0) el("text", { x: endX, y: by + barH - .5, text: s.name, style: "fill:var(--ink-2);font-size:9.5px;font-family:var(--mono)" }, g);
          (cfg.notes || []).filter(n => n.cat === i && n.s === si).forEach(n => {
            const fits = endX + n.text.length * 5.8 + 12 <= W;
            el("text", { x: endX, y: by + barH - .5, text: fits ? "✕ " + n.text : "✕", style: "fill:var(--ink-2);font-size:9.5px;font-family:var(--mono)" }, g);
          });
          if (!cfg.groupTip) {
            const hit = el("rect", { class: "hit", x: 0, y: by - 1, width: W, height: barH + 2 }, g);
            tipOn(hit, `<span class="k">${catTip(c)}</span>${s.name}: <b>${fmt(v, dec)} ${cfg.unitShort || ""}</b>`);
            hit.addEventListener("mouseenter", () => { host.classList.add("is-hovering"); g.classList.add("is-on"); });
            hit.addEventListener("mouseleave", () => { host.classList.remove("is-hovering"); g.classList.remove("is-on"); });
          }
        });
        if (cfg.groupTip) {
          const hit = el("rect", { class: "hit", x: 0, y: y - groupGap / 2, width: W, height: gH + groupGap }, svg);
          const note = (cfg.notes || []).filter(n => n.cat === i).map(n => `<span class="tn">✕ ${cfg.series[n.s].name}: ${n.text}</span>`).join("");
          tipOn(hit, `<span class="k">${catTip(c)}</span>` + swatchRows(cfg.series, s => fmt(s.values[i], dec) + " " + (cfg.unitShort || "")) + note);
          hit.addEventListener("mouseenter", () => { host.classList.add("is-hovering"); groupMarks.forEach(g => g.classList.add("is-on")); });
          hit.addEventListener("mouseleave", () => { host.classList.remove("is-hovering"); groupMarks.forEach(g => g.classList.remove("is-on")); });
        }
        y += gH + groupGap;
      });
      el("line", { class: "baseline", x1: x(0), x2: x(0), y1: top - 4, y2: H - bottom + 2 }, svg);
      dim(host, focus);
    };
    draw(); onResize(draw).observe(host);
  }

  /* ---------- radar (one closed shape per series) ----------
     axes: [{n, t}] clockwise from the top. Rating 0 sits at the center, so a
     shape's area reads as "how easy overall". labelAt: the spoke where the series
     are direct-labeled (pick one where they spread apart). Hovering a spoke shows
     every series' value there; narrow screens show spoke numbers only. */
  function radar(host, cfg) {
    let focus = null;
    const n = cfg.axes.length, max = cfg.max || 10, rings = cfg.rings || [2, 4, 6, 8, 10];
    const draw = () => {
      host.innerHTML = "";
      if (cfg.series.length > 1) {
        if (cfg.pick) pickLegend(host, cfg.series, () => focus, f => { focus = f; dim(host, focus); });
        else legend(host, cfg.series);
      }
      const W = Math.max(280, host.clientWidth - 36);
      const narrow = W < 470;
      const padX = narrow ? 26 : 104, padY = narrow ? 22 : 34;
      const R = Math.max(90, Math.min((W - 2 * padX) / 2, cfg.maxR || 210));
      const H = 2 * R + 2 * padY;
      const cx = W / 2, cy = padY + R;
      const ang = i => -Math.PI / 2 + i * 2 * Math.PI / n;
      const at = (i, v) => [cx + Math.cos(ang(i)) * R * v / max, cy + Math.sin(ang(i)) * R * v / max];
      const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": cfg.label || "" }, host);
      rings.forEach(v => el("circle", { class: "gridline", cx, cy, r: R * v / max, style: "fill:none" }, svg));
      cfg.axes.forEach((a, i) => {
        const [ex, ey] = at(i, max);
        el("line", { class: "gridline", x1: cx, y1: cy, x2: ex, y2: ey }, svg);
        const c = Math.cos(ang(i)), s = Math.sin(ang(i)), off = narrow ? 9 : 13;
        const t = el("text", {
          x: cx + c * (R + off), y: cy + s * (R + off) + (s > .6 ? 11 : s < -.95 ? -9 : s < -.6 ? -3 : 4),
          "text-anchor": c > .3 ? "start" : c < -.3 ? "end" : "middle", style: "fill:var(--ink);font-size:11.5px"
        }, svg);
        el("tspan", { style: "fill:var(--muted);font-family:var(--mono);font-size:10px", text: a.n }, t);
        if (!narrow) el("tspan", { text: " " + a.t }, t);
      });
      cfg.series.forEach(s => {
        const g = el("g", { class: "mark", "data-s": s.name }, svg);
        const d = s.values.map((v, i) => (i ? "L" : "M") + at(i, v).map(q => q.toFixed(1)).join(",")).join("") + "Z";
        el("path", { d, style: `fill:${s.color};fill-opacity:${cfg.fill == null ? .06 : cfg.fill};stroke:${s.color};stroke-width:2;stroke-linejoin:round` }, g);
      });
      // direct labels where the series spread apart
      if (cfg.labelAt != null) {
        const i = cfg.labelAt, side = cfg.labelSide || 1;
        const px = -Math.sin(ang(i)) * side, py = Math.cos(ang(i)) * side;
        cfg.series.forEach(s => {
          const g = svg.querySelector(`.mark[data-s="${s.name}"]`);
          const [vx, vy] = at(i, s.values[i]);
          el("circle", { cx: vx, cy: vy, r: 6, style: "fill:var(--surface)" }, g);
          el("circle", { cx: vx, cy: vy, r: 4, style: `fill:${s.color}` }, g);
          el("text", {
            x: vx + px * 10, y: vy + py * 10 + 3.5, "text-anchor": px >= 0 ? "start" : "end", text: s.name,
            style: "fill:var(--ink-2);font-family:var(--mono);font-size:10px;paint-order:stroke;stroke:var(--surface);stroke-width:3px;stroke-linejoin:round"
          }, g);
        });
      }
      rings.forEach(v => el("text", { class: "tick", x: cx + 4, y: cy - R * v / max - 3, text: v, style: "paint-order:stroke;stroke:var(--surface);stroke-width:3px;stroke-linejoin:round" }, svg));
      // hover: one wedge per spoke; shows the spoke and every series' point on it
      const guide = el("g", { style: "pointer-events:none" });
      cfg.axes.forEach((a, i) => {
        const a0 = ang(i) - Math.PI / n, a1 = ang(i) + Math.PI / n, rr = R + (narrow ? 8 : 12);
        const d = `M${cx},${cy}L${(cx + Math.cos(a0) * rr).toFixed(1)},${(cy + Math.sin(a0) * rr).toFixed(1)}A${rr},${rr} 0 0 1 ${(cx + Math.cos(a1) * rr).toFixed(1)},${(cy + Math.sin(a1) * rr).toFixed(1)}Z`;
        const hit = el("path", { class: "hit", d }, svg);
        tipOn(hit, () => `<span class="k">#${a.n} ${a.t}</span>` + swatchRows(cfg.series, s => s.values[i] + " / " + max));
        hit.addEventListener("mouseenter", () => {
          guide.innerHTML = "";
          const [ex, ey] = at(i, max);
          el("line", { x1: cx, y1: cy, x2: ex, y2: ey, style: "stroke:var(--ink-2);stroke-width:1" }, guide);
          cfg.series.forEach(s => {
            const [vx, vy] = at(i, s.values[i]);
            const op = focus && focus !== s.name ? .25 : 1;
            el("circle", { cx: vx, cy: vy, r: 6, style: `fill:var(--surface);opacity:${op}` }, guide);
            el("circle", { cx: vx, cy: vy, r: 4, style: `fill:${s.color};opacity:${op}` }, guide);
          });
        });
        hit.addEventListener("mouseleave", () => { guide.innerHTML = ""; });
      });
      svg.appendChild(guide);
      dim(host, focus);
    };
    draw(); onResize(draw).observe(host);
  }

  /* ---------- dot strip (beeswarm-stacked) ---------- */
  function strip(host, cfg) {
    const draw = () => {
      host.innerHTML = "";
      legend(host, cfg.rows.map(r => ({ name: r.name, color: r.color })));
      const W = Math.max(300, host.clientWidth - 36);
      const labelW = 70, rowH = cfg.rowH || 74, top = 8, bottom = 26;
      const H = top + cfg.rows.length * rowH + bottom;
      const max = cfg.max;
      const x = v => labelW + (v / max) * (W - labelW - 16);
      const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": cfg.label || "" }, host);
      for (let v = 0; v <= max; v += cfg.step) {
        el("line", { class: "gridline", x1: x(v), x2: x(v), y1: top, y2: H - bottom }, svg);
        el("text", { class: "tick", x: x(v), y: H - 8, "text-anchor": "middle", text: v }, svg);
      }
      el("text", { class: "tick", x: labelW - 10, y: H - 8, "text-anchor": "end", text: cfg.unit + " →" }, svg);
      cfg.rows.forEach((r, ri) => {
        const cy = top + ri * rowH + rowH / 2;
        el("text", { x: 0, y: cy + 4, text: r.name, style: "fill:var(--ink);font-size:11.5px" }, svg);
        const counts = {};
        const rad = 4.5;
        r.points.forEach(p => {
          const k = p.v; counts[k] = (counts[k] || 0) + 1; const n = counts[k] - 1;
          const dy = (n % 2 ? 1 : -1) * Math.ceil(n / 2) * (rad * 2 + 2.5);
          const g = el("g", { class: "mark" }, svg);
          el("circle", { cx: x(p.v), cy: cy + dy, r: rad + 2, style: "fill:var(--surface)" }, g);
          el("circle", { cx: x(p.v), cy: cy + dy, r: rad, style: `fill:${r.color}` }, g);
          const hit = el("circle", { class: "hit", cx: x(p.v), cy: cy + dy, r: 10 }, g);
          tipOn(hit, `<span class="k">${p.label}</span>${r.name}: <b>${p.v} ${cfg.unitShort || ""}</b>`);
          hit.addEventListener("mouseenter", () => { host.classList.add("is-hovering"); g.classList.add("is-on"); });
          hit.addEventListener("mouseleave", () => { host.classList.remove("is-hovering"); g.classList.remove("is-on"); });
        });
        if (r.mean != null) {
          el("line", { x1: x(r.mean), x2: x(r.mean), y1: cy - rowH / 2 + 6, y2: cy + rowH / 2 - 6, style: "stroke:var(--ink);stroke-width:1.5" }, svg);
          el("text", { x: x(r.mean) + 5, y: cy - rowH / 2 + 14, text: `avg ${r.mean} ${cfg.unitShort || ""}`, style: "fill:var(--ink);font-size:10.5px;font-family:var(--mono)" }, svg);
        }
      });
    };
    draw(); onResize(draw).observe(host);
  }

  /* ---------- heat-table coloring (sequential blue, one hue) ---------- */
  const STEPS = [100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700];
  function heat(table, cfg) {
    const { min, max, invert } = cfg;
    table.querySelectorAll("td.h").forEach(td => {
      const v = parseFloat(td.textContent); if (isNaN(v)) return;
      let t = (v - min) / (max - min); t = Math.max(0, Math.min(1, t)); if (invert) t = 1 - t;
      const s = STEPS[Math.round(t * (STEPS.length - 1))];
      td.style.background = `var(--seq-${s})`;
      td.classList.toggle("dk", s >= 450);
    });
  }

  /* ---------- tolerance strip ---------- */
  function tolerance(host, cfg) {
    const draw = () => {
      host.innerHTML = "";
      const W = Math.max(320, host.clientWidth - 36), H = 196, l = 8, r = 12, axisY = 150;
      const max = cfg.max;
      const x = v => l + (v / max) * (W - l - r);
      const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": cfg.label }, host);
      cfg.bands.forEach(b => {
        el("rect", { x: x(b.from), y: 24, width: x(Math.min(b.to, max)) - x(b.from), height: axisY - 24, style: `fill:${b.color};opacity:.13` }, svg);
        el("rect", { x: x(b.from), y: axisY - 3, width: x(Math.min(b.to, max)) - x(b.from) - 2, height: 6, rx: 3, style: `fill:${b.color}` }, svg);
        el("text", { x: x(b.from) + 6, y: 16, text: b.label, style: "fill:var(--ink-2);font-size:10.5px;font-family:var(--mono)" }, svg);
      });
      for (let v = 0; v <= max; v += 1) el("text", { class: "tick", x: x(v), y: axisY + 22, "text-anchor": "middle", text: v }, svg);
      el("text", { class: "tick", x: W - r, y: axisY + 38, "text-anchor": "end", text: cfg.unit }, svg);
      // place labels in rows to avoid collisions
      const rows = [];
      const pts = cfg.points.slice().sort((a, b) => a.v - b.v);
      pts.forEach(p => {
        const px = x(p.v); const w = p.name.length * 6.4 + 34;
        let row = 0; while (rows[row] && rows[row] > px - 4) row++;
        rows[row] = px + w; p._row = row;
      });
      pts.forEach(p => {
        const px = x(p.v), ly = 48 + p._row * 26;
        const g = el("g", { class: "mark" }, svg);
        el("line", { x1: px, x2: px, y1: ly + 4, y2: axisY - 7, style: "stroke:var(--ink-2);stroke-width:1" }, g);
        el("text", { x: px + 6, y: ly + 2, text: p.name, style: "fill:var(--ink);font-size:11.5px;font-weight:600" }, g);
        el("text", { x: px + 6, y: ly + 15, text: p.note, style: "fill:var(--muted);font-size:10px;font-family:var(--mono)" }, g);
        el("circle", { cx: px, cy: axisY, r: 7, style: "fill:var(--surface)" }, g);
        el("circle", { cx: px, cy: axisY, r: 5, style: "fill:var(--ink)" }, g);
        const hit = el("rect", { class: "hit", x: px - 10, y: ly - 12, width: Math.max(80, p.name.length * 7), height: axisY - ly + 20 }, g);
        tipOn(hit, `<span class="k">${p.name}</span>${p.tip}`);
        hit.addEventListener("mouseenter", () => { host.classList.add("is-hovering"); g.classList.add("is-on"); });
        hit.addEventListener("mouseleave", () => { host.classList.remove("is-hovering"); g.classList.remove("is-on"); });
      });
    };
    draw(); onResize(draw).observe(host);
  }

  /* ---------- MCDA: nondimensional scaling + additive weighting ---------- */
  function mcda(host, cfg) {
    const A = cfg.alts, C = cfg.criteria;
    // scaled ratings (eq. 13 / 14)
    const R = A.map((_, i) => C.map(c => {
      const col = A.map((__, k) => c.raw[k]);
      const best = c.higher ? Math.max(...col) : Math.min(...col);
      const worst = c.higher ? Math.min(...col) : Math.max(...col);
      return c.higher ? (c.raw[i] - worst) / (best - worst) : (worst - c.raw[i]) / (worst - best);
    }));
    const ctlWrap = document.createElement("div");
    const presetBar = document.createElement("div");
    presetBar.className = "seg"; presetBar.setAttribute("role", "group"); presetBar.setAttribute("aria-label", "Weighting scenario");
    presetBar.innerHTML = cfg.presets.map((p, i) => `<button type="button" data-i="${i}" aria-pressed="${i === 0}">${p.name}</button>`).join("") + `<button type="button" data-i="custom" aria-pressed="false">Custom</button>`;
    const ctl = document.createElement("div"); ctl.className = "controls c2"; ctl.style.marginTop = "14px";   // two sliders per row
    ctl.innerHTML = C.map((c, j) => `<div class="ctl"><label for="w-${j}">${c.name}<output id="o-${j}"></output></label><input type="range" id="w-${j}" min="0" max="100" step="1"></div>`).join("");
    const chartBox = document.createElement("div");
    const note = document.createElement("p"); note.style.cssText = "font-size:.8rem;color:var(--ink-2);margin:10px 0 0";
    ctlWrap.append(presetBar, ctl);
    host.append(ctlWrap, chartBox, note);
    const sliders = C.map((_, j) => ctl.querySelector(`#w-${j}`));
    const outs = C.map((_, j) => ctl.querySelector(`#o-${j}`));
    let weights = cfg.presets[0].w.slice();
    function setPreset(i) {
      presetBar.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.i === String(i))));
      if (i !== "custom") { weights = cfg.presets[i].w.slice(); sliders.forEach((s, j) => s.value = Math.round(weights[j] * 100)); }
      render();
    }
    presetBar.addEventListener("click", e => { const b = e.target.closest("button"); if (b) setPreset(b.dataset.i === "custom" ? "custom" : +b.dataset.i); });
    sliders.forEach((s, j) => s.addEventListener("input", () => {
      const raw = sliders.map(x => +x.value);
      const sum = raw.reduce((a, b) => a + b, 0) || 1;
      weights = raw.map(v => v / sum);
      presetBar.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.i === "custom")));
      render();
    }));
    sliders.forEach((s, j) => s.value = Math.round(weights[j] * 100));
    function render() {
      outs.forEach((o, j) => o.textContent = Math.round(weights[j] * 100) + "%");
      const S = A.map((_, i) => C.reduce((acc, c, j) => acc + weights[j] * R[i][j], 0));
      const best = S.indexOf(Math.max(...S));
      chartBox.innerHTML = "";
      const W = Math.max(300, chartBox.clientWidth || host.clientWidth - 36);
      const labelW = 120, barH = 20, gap = 14, top = 4, bottom = 24;
      const H = top + A.length * (barH + gap) + bottom;
      const x = v => labelW + v * (W - labelW - 90);
      const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Weighted decision score per scanner" }, chartBox);
      for (let v = 0; v <= 1.0001; v += .25) {
        el("line", { class: "gridline", x1: x(v), x2: x(v), y1: 0, y2: H - bottom + 2 }, svg);
        el("text", { class: "tick", x: x(v), y: H - 6, "text-anchor": "middle", text: v.toFixed(2) }, svg);
      }
      A.forEach((a, i) => {
        const y = top + i * (barH + gap);
        el("text", { x: labelW - 10, y: y + barH / 2 + 4, "text-anchor": "end", text: a, style: "fill:var(--ink);font-size:11.5px" }, svg);
        const g = el("g", { class: "mark" }, svg);
        el("path", { d: barPath(x(0), y, Math.max(0.5, x(S[i]) - x(0)), barH), style: "fill:var(--series-1);transition:d .3s" }, g);
        el("text", { x: x(S[i]) + 7, y: y + barH / 2 + 4, text: S[i].toFixed(3) + (i === best ? "  ▲ highest" : ""), style: `fill:var(--ink);font-size:11px;font-family:var(--mono);font-weight:${i === best ? 600 : 400}` }, g);
        const hit = el("rect", { class: "hit", x: 0, y: y - 4, width: W, height: barH + 8 }, g);
        tipOn(hit, () => `<span class="k">${a}</span>Score <b>${S[i].toFixed(3)}</b><br>` + C.map((c, j) => `${c.name}: ${R[i][j].toFixed(3)} × ${(weights[j] * 100).toFixed(0)}%`).join("<br>"));
      });
      el("line", { class: "baseline", x1: x(0), x2: x(0), y1: 0, y2: H - bottom + 2 }, svg);
      note.innerHTML = `Highest score with these weights: <b>${A[best]}</b> (${S[best].toFixed(3)}).`;
    }
    setPreset(0);
    onResize(render).observe(host);
  }

  /* ---------- parametric armband pattern (eqs. 1-12) ---------- */
  function pattern(host, cfg) {
    const state = Object.assign({ s1: 300, s2: 262, d: 100, A: 4, N: 2, env: true }, cfg.initial || {});
    const defs = [
      { k: "s1", name: "s₁ upper circumference", min: 100, max: 700, step: 1, unit: "mm" },
      { k: "s2", name: "s₂ lower circumference", min: 80, max: 680, step: 1, unit: "mm" },
      { k: "d", name: "d band width", min: 20, max: 300, step: 1, unit: "mm" },
      { k: "A", name: "A wave amplitude", min: 0, max: 12, step: .5, unit: "mm" }
    ];   // N (wave cycles) is fixed by cfg.initial / the default: 2, as in the thesis
    const ctl = document.createElement("div"); ctl.className = "controls";
    ctl.innerHTML = defs.map(d => `<div class="ctl"><label for="p-${d.k}">${d.name}<output id="po-${d.k}"></output></label><input type="range" id="p-${d.k}" min="${d.min}" max="${d.max}" step="${d.step}" value="${state[d.k]}"></div>`).join("");
    const box = document.createElement("div");
    const warn = document.createElement("div"); warn.className = "warn"; warn.setAttribute("aria-live", "polite");
    const read = document.createElement("div"); read.className = "readout";
    const tools = document.createElement("div"); tools.style.cssText = "display:flex;gap:10px;flex-wrap:wrap;margin-top:12px";
    tools.innerHTML = `<button type="button" class="btn-ghost" data-act="env" aria-pressed="true" style="font-family:var(--mono);font-size:.68rem">Envelope arcs: on</button><button type="button" class="btn-ghost" data-act="dl" style="font-family:var(--mono);font-size:.68rem">Download pattern (.svg, 1:1 mm)</button>`;
    host.append(ctl, box, warn, read, tools);
    defs.forEach(d => ctl.querySelector(`#p-${d.k}`).addEventListener("input", e => { state[d.k] = +e.target.value; render(); }));
    tools.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.act === "env") { state.env = !state.env; b.textContent = "Envelope arcs: " + (state.env ? "on" : "off"); b.setAttribute("aria-pressed", String(state.env)); render(); }
      if (b.dataset.act === "dl") download();
    });
    function geom() {
      let { s1, s2, d, A, N } = state;
      const th = (s1 - s2) / d;                        // eq. 1 / 9
      const R1 = s1 / th, R2 = s2 / th;                // eq. 2, 3, 10
      const n = 2 * Math.PI * N / th;                  // eq. 5 / 6 / 11
      const a0 = Math.PI / 2 - th / 2, a1 = Math.PI / 2 + th / 2; // eq. 4 / 12
      const M = 360, out = [], inn = [], e1 = [], e2 = [];
      for (let i = 0; i <= M; i++) {
        const t = a0 + (a1 - a0) * i / M;
        const r1 = (R1 - A) + A * Math.cos(n * (t - Math.PI / 2)); // eq. 7
        const r2 = (R2 - A) + A * Math.cos(n * (t - Math.PI / 2)); // eq. 8
        out.push([r1 * Math.cos(t), -r1 * Math.sin(t)]);
        inn.push([r2 * Math.cos(t), -r2 * Math.sin(t)]);
        e1.push([R1 * Math.cos(t), -R1 * Math.sin(t)]);
        e2.push([R2 * Math.cos(t), -R2 * Math.sin(t)]);
      }
      return { th, R1, R2, n, out, inn, e1, e2 };
    }
    const pathOf = pts => pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(2) + "," + p[1].toFixed(2)).join("");
    const outline = g => pathOf(g.out) + "L" + g.inn.slice().reverse().map(p => p[0].toFixed(2) + "," + p[1].toFixed(2)).join("L") + "Z";
    function render() {
      defs.forEach(d => ctl.querySelector(`#po-${d.k}`).textContent = state[d.k] + (d.unit ? " " + d.unit : ""));
      if (state.s1 - state.s2 < 4) { warn.textContent = "s₁ must exceed s₂: the model assumes a taper (a cylinder would need an infinite radius)."; box.innerHTML = ""; read.innerHTML = ""; return; }
      if ((state.s1 - state.s2) / state.d >= 2 * Math.PI) { warn.textContent = "Taper too steep for this band width: θ total would reach 360°, but an unrolled frustum’s sector is always smaller than a full circle (θ = 2π sin γ). Lower s₁ − s₂ or raise d."; box.innerHTML = ""; read.innerHTML = ""; return; }
      warn.textContent = state.A * 2 >= state.d ? "Amplitude is large relative to band width; edges will nearly touch." : "";
      const g = geom();
      const all = g.out.concat(g.inn, g.e1, g.e2);
      const xs = all.map(p => p[0]), ys = all.map(p => p[1]);
      const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
      const spanW = maxX - minX, spanH = maxY - minY;
      const Wpx = Math.max(280, box.clientWidth || host.clientWidth - 36);
      const ppu = Math.min((Wpx - 150) / spanW, (360 - 70) / spanH);   // css px per mm
      const k = 1 / ppu;                                               // mm per css px
      const vb = [minX - 24 * k, minY - 34 * k, spanW + 120 * k, spanH + 68 * k];
      box.innerHTML = "";
      const svg = el("svg", { viewBox: vb.map(v => v.toFixed(2)).join(" "), role: "img", "aria-label": "Flat armband pattern generated from the measurements" }, box);
      svg.style.maxHeight = "380px";
      const fs = (px) => `font-size:${(px * k).toFixed(2)}px`;
      if (state.env) {
        const es = `fill:none;stroke:var(--muted);stroke-width:${(1 * k).toFixed(3)};stroke-dasharray:${(4 * k).toFixed(2)} ${(4 * k).toFixed(2)}`;
        el("path", { d: pathOf(g.e1), style: es }, svg);
        el("path", { d: pathOf(g.e2), style: es }, svg);
      }
      el("path", { d: outline(g), style: `fill:var(--accent-wash);stroke:var(--accent);stroke-width:${(2 * k).toFixed(3)};stroke-linejoin:round` }, svg);
      // d dimension along the right edge, outside the band
      const L1 = g.e1[0], L2 = g.e2[0];
      el("line", { x1: L1[0] + 10 * k, y1: L1[1], x2: L2[0] + 10 * k, y2: L2[1], style: `stroke:var(--ink-2);stroke-width:${k.toFixed(3)}` }, svg);
      el("text", { x: (L1[0] + L2[0]) / 2 + 16 * k, y: (L1[1] + L2[1]) / 2 + 4 * k, text: `d = ${state.d} mm`, style: `fill:var(--ink-2);${fs(11)};font-family:var(--mono)` }, svg);
      const midO = g.e1[180], midI = g.e2[180];
      el("text", { x: midO[0], y: midO[1] - 10 * k, "text-anchor": "middle", text: `s₁ = ${state.s1} mm`, style: `fill:var(--ink);${fs(11.5)};font-family:var(--mono)` }, svg);
      el("text", { x: midI[0], y: midI[1] + 22 * k, "text-anchor": "middle", text: `s₂ = ${state.s2} mm`, style: `fill:var(--ink);${fs(11.5)};font-family:var(--mono)` }, svg);
      read.innerHTML = [
        ["θ total", `${g.th.toFixed(3)} rad · ${(g.th * 180 / Math.PI).toFixed(1)}°`],
        ["R₁ outer", `${g.R1.toFixed(1)} mm`],
        ["R₂ inner", `${g.R2.toFixed(1)} mm`],
        ["n frequency", g.n.toFixed(2)],
        ["Edge range", `R − 2A … R`]
      ].map(([k, v]) => `<div>${k}<b>${v}</b></div>`).join("");
    }
    function download() {
      const g = geom();
      const all = g.out.concat(g.inn);
      const xs = all.map(p => p[0]), ys = all.map(p => p[1]);
      const minX = Math.min(...xs) - 5, minY = Math.min(...ys) - 5, w = Math.max(...xs) - minX + 5, h = Math.max(...ys) - minY + 5;
      const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${w.toFixed(2)}mm" height="${h.toFixed(2)}mm" viewBox="${minX.toFixed(2)} ${minY.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}">\n<!-- Armband flat pattern: s1=${state.s1}mm s2=${state.s2}mm d=${state.d}mm A=${state.A}mm N=${state.N} -->\n<path d="${outline(g)}" fill="none" stroke="#ff0000" stroke-width="0.1"/>\n</svg>`;
      const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
      const a = document.createElement("a"); a.href = url; a.download = `armband-pattern_s1-${state.s1}_s2-${state.s2}_d-${state.d}.svg`;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    render();
    onResize(render).observe(host);
  }

  window.Viz = { hbars, radar, strip, heat, tolerance, mcda, pattern };
})();
