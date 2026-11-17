# Research portfolio, Shubham Chomal

A static, dependency-free website that presents two theses and a tutorial as long-form, three-column web documents:

| Page | Thesis |
|---|---|
| `index.html` | Home page, one screen built like the project title pages: kicker lines, name, research-area tags, then four cards (00 Resume, 01 Gloves, 02 Armband, 03 Voting) with picture, year, type and title. Pictures stretch to fill the window on laptops and desktops; phones and tablets scroll |
| `resume/` | Resume as one continuous sheet with the structure of `Resume/Resume_V2.tex` (same rows, two columns, Education sub-columns, sections and text; layout values in points from the .tex, under "Resume page" in `site.css`). Not generated from the .tex: after editing the .tex, mirror the change here |
| `gloves/` | *Identifying and Designing User-Friendly Mechanisms in Gloves for Assessment of Parkinson's Disease*, M.Des, PDPM IIITDM Jabalpur, 2022 |
| `armband/` | *Design of Small-Scale Flexible Manufacturing System Pipeline to Make E-Textiles Customizable*, M.S. Systems Engineering, URI, 2026 |
| `voting/` | *Polling Station VR Simulation Instructional Guide* (Voting Simulation in Virtual Reality), ISE 521 Human Systems Engineering, URI Votes, 2025 |

## How the pages work

- **Text and headings come from the theses.** The running text is each thesis's own text (grammar corrected), and the chapters, sections and subsections follow the thesis structure and numbering: the gloves page has the thesis's four chapters (02 Design Methodology holds 2.1 Empathize to 2.8 Summary). Section numbers sit in `<span class="hn">` inside the heading; `data-short` on each `h2.sec-h` is the label in the contents column.
- **Column 1, contents.** Built automatically from the chapters (`.chapter[data-num][data-title]`) and sections (`.sec[id] > h2.sec-h`). It stays sticky, follows your scroll, and becomes a slide-out drawer on tablets and phones.
- **Column 2, text.** Section headings (`h2.sec-h`, with the chapter label on its own line above the title) and subheadings (`h3.sub-h`) stick to the top while their section is on screen. When the next heading arrives it meets the stuck one and pushes it off the top. The heading bars are opaque across columns 2 and 3, so margin notes scroll underneath them.
- **Chapter openers and slow motion.** Each chapter opens with a full-screen *opener* that scrolls with the page; it shows the chapter label and title, with the chapter numeral filled in light gray at the bottom-right corner of column 2; numeral and title drift at different speeds. Mouse-wheel, trackpad and keyboard scrolling is eased (a soft glide, with each wheel notch moving 60% of the browser's usual distance), and its speed falls smoothly to 30% as an opener fills the screen, then recovers: a slow-motion beat at every new chapter. Tune `WHEEL` (distance), `EASE` (glide), `SLOW`, `BEFORE` and `AFTER` in `assets/js/site.js`. Touch, the scrollbar and links scroll natively.
- **Tables.** A table's head row stays pinned under the section or subsection bar until the table has scrolled past (a *sticky table header*). The table title sits in column 3, level with the top of the table, with **Alt Text** below it. A table marked `.wide` (too wide for column 2) carries its title above the table in column 2, with **Alt Text** beside it in column 3.
- **Column 3, margin notes.** Generated automatically:
  - `<a class="cite" data-ref="12"></a>` → a numbered reference note (gloves page); `<a class="cite ay" data-ref="ruckdashel2022">Ruckdashel et al. 2022</a>` → an author-year note (armband page). Reference data lives in `assets/js/data-*.js`, which also builds the full reference list.
  - `<dfn class="term" data-def="bradykinesia">bradykinesia</dfn>` → a definition note with a source link (first use in each chapter), plus the glossary at the end.
  - Citation and definition notes are **dropdowns**: they start collapsed as a one-line header (e.g. `[4] Dorsey et al. 2018 ⌄`). Hovering the cited or defined text expands and highlights its note; moving onto the note keeps it open so its link can be clicked. Clicking the header, or the text itself, pins the note open until clicked again.
  - Every `<figure>` has a `figcaption.note.cap` with the figure title (`.cap-t`) and an **Alt Text** note (`.cap-h`) describing the figure; these stay expanded.
  - Subsections clear the notes above them (`.sub { clear: right }`), so an opened note pushes the next subsection down rather than sliding under its heading bar.
  - On phones the notes move inline: tap a citation or term to open its note.
- **Tutorial page (`voting/`).** Pictures (`<figure class="fig inline">`), paragraphs and the tip/note boxes run in column 2; figure titles and "Alt Text" sit in column 3, as on the other pages. Each section's steps sit in a `<div class="stepbox">` placed right after the section's `h2`, which floats into column 3; when a picture follows the steps box, its title stays level with the picture's top and the steps start below it (`seatStepCaps()` in `site.js`). Every step is numbered (`<ol>`, sub-steps lettered). Lead-in sentences (ending in a colon) stay inside the step box. Boxes in column 2 are `<div class="callout c-…">`: `c-tip` (yellow, bulb), `c-opt` (gray, optional), `c-info` (note), `c-done` (green), `c-warn` (red; add `c-safety` or `c-imp` for the shield or exclamation icon); the icons are CSS masks in `site.css`. Table 2.1 is an interactive checklist (tick boxes, progress bar, counts per group, "Hide ticked", "Reset"; ticks saved in the visitor's browser; script at the end of `voting/index.html`). Definitions for terms in the step box stack below it (`placeNote()` in `site.js`). Column widths: `--main` / `--notes` under `:root[data-project="voting"]` in `site.css`. On phones the step box returns to its place in the guide's order: blocks marked `.pre` come before it, everything else after. Text and pictures come from the guide's final version (its drafts and the unrelated pages at the end of the Google Doc were left out); definitions and their links were added for the site in `assets/js/data-voting.js`.
- **Abstract** is chapter 00, built like every other chapter (opener, sticky section headings, margin notes). Its key metrics are boxed cards (`.metrics > .metric`, with a small inline SVG icon), the same style as the task cards.
- **Interactive figures** (no libraries): on the gloves page, the Phase 1 task-time bars (Fig. 2.3) and difficulty radars (Figs. 2.4-2.5), the Test-stage time chart, the dot strip and the heat tables; on the armband page, a live **armband pattern generator** (equations 1-12, with a true-scale SVG download), a tolerance strip, and a re-weightable **MCDA** chart (equations 13-14). Charts show values on hover, have a "Show data" table, and the Phase 1 charts let you click a participant to isolate them.
- **Animated figure (armband Fig. 4.17).** A Lottie animation (made with the LottieFiles Figma plugin; source `Process.lottie` kept in `assets/img/armband/og_Images/`) loops in column 2 with a Pause / Play button. Its data is `assets/js/anim-fig-4-17.js` (a script, not a .json file, so it also plays when a page is opened straight from disk) with its images in `assets/img/armband/fig-4-17/`; the player is lottie-web (light build, MIT license) in `assets/js/vendor/`. Both load only when the reader nears the figure, playback pauses while it is off screen, and `poster.webp` (the finished layer stack) shows until it loads, in print, and if scripts fail. To replace the animation, export a new .lottie, unzip it (it is a zip archive) and rebuild those files.
- **Participant colors.** The four Empathize-study participants keep one color everywhere: P1 red, P2 green, P3 yellow, P4 pink, matching the original affinity-map sticky notes (Figs. 2.6, 2.8, 2.9 are still photos/images in those colors). Chart strengths are `--p1`…`--p4` and sticky tints `--p1-note`…`--p4-note` in `site.css`; the chart set was checked for color-blind separation.
- **Notes by task (Fig. 2.8).** The same 185 notes as Fig. 2.7, one tab per participant, sorted into task rows (task icon, name and number; the first row, with no task name, holds notes not about one task; tasks follow their numbers, then Phone and Writing as extra rows). The sorting is in `gloves/index.html`: move a `<div class="sticky">` to another `.tw-row` to re-file a note.
- **Affinity map (Fig. 2.9).** The hand × finger matrix of Fig. 2.1 with each task's notes (from Fig. 2.8) posted around its label, in participant colors, plus the purple insight notes read from the thesis figure. A magnifying lens follows the mouse over the map (`.magnify` in `gloves/index.html`, lens code in `site.js`; zoom `Z` and size `D`); touch screens get a larger two-column layout instead.
- **Previous / next.** Every page ends with a pair of links (`nav.pager`): Resume (00) → Gloves (01) → Armband (02) → Voting (03), with Home before the resume and after voting. Each link shows its project's label and title in that project's accent color.
- **Paragraphs** in column 2 are justified, without automatic hyphenation, on tablets and desktops; phones keep left-aligned text, which reads better in a narrow column.
- **Stages tabs (gloves 1.1.4).** One tab per Parkinson's stage (the same tab component as Fig. 2.7), each with the thesis text and the matching steps of the modified Hoehn and Yahr scale (reference 63, added on the site).
- **Task matrix (gloves Fig. 2.1) and movement tags.** Fig. 2.1 is a live 2 × 2 matrix built from the task icons; hovering, tapping or tabbing to a task shows its card from Table 2.2 in column 3. Movement tags share one color code everywhere (Table 2.2, Fig. 2.1, the table under Fig. 2.3): teal for hand, orange for finger, light for fine, solid for gross (`.tag.fh/.gh/.ff/.gf` in `site.css`).
- **Sticky-note board (Fig. 2.7).** All 185 Empathize observations, one tab per participant. The tab row pins under the section heading while a long board scrolls; switching tabs from part-way down jumps to the top of the new board. Each note is a `<div class="sticky">` inside its participant's `.sboard` panel in `gloves/index.html`.
- Light theme on a white background, print styles, and an image lightbox.
- **Gloves cover picture.** A 360° turntable of the Peekablue glove (`assets/img/gloves/hero-turntable.webp`, 0.6 MB, made from `Carousel_1.gif`, which is 83 MB and kept out of the repository by `.gitignore`), which plays and loops automatically, with a Pause / Play button. A still of the first frame (`hero-turntable-still.webp`) shows while it loads and when paused.
- **Reduced motion.** When the visitor's system asks for reduced motion, the parallax and the slow-motion scrolling switch off, the page scrolls normally. On Windows this follows *Settings → Accessibility → Visual effects → Animation effects*: turn it on to see the chapter animations.

## Publish on GitHub Pages

1. Create a repository, e.g. `<username>.github.io` for a root site, or any name (e.g. `portfolio`) for a project site.
2. Copy the **contents** of this folder into the repository root. Keep `.nojekyll`; it tells GitHub Pages to serve the files exactly as they are.
3. Commit and push, then open **Settings → Pages → Build and deployment** and choose **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. The site appears at `https://<username>.github.io/` (or `https://<username>.github.io/portfolio/`). All links are relative, so either works.

The thesis PDFs in this folder are **excluded by `.gitignore`**, so they won't be published by accident. To offer them for download, remove `*.pdf` from `.gitignore` and link to them from the pages.

## Preview locally

Opening `index.html` directly works in most browsers. For the closest match to GitHub Pages, serve the folder:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

## Editing

- Text: edit `gloves/index.html`, `armband/index.html` or `voting/index.html`. Wrap new sections as `<section class="sec" id="…"><h2 class="sec-h" data-short="Short TOC label">…</h2>…</section>`; the contents column updates by itself.
- References and definitions: `assets/js/data-gloves.js`, `assets/js/data-armband.js` and `assets/js/data-voting.js`.
- Chart data: in the `<script>` at the bottom of each page (Phase 1 task times and ratings are `TIME` and `RATE` in `gloves/index.html`, taken from the study spreadsheet). Chart drawing code is in `assets/js/viz.js`.
- Colors, fonts and spacing: the tokens at the top of `assets/css/site.css`. Each project has its own accent color (`data-project` on `<html>`).
- Figures were rendered from the thesis PDFs at about 216 dpi and saved as WebP in `assets/img/`.

Fonts: Segoe UI for headings and text (a Windows system font; Mac and iOS visitors see their system font, San Francisco, instead) and JetBrains Mono from Google Fonts for labels. Charts use a color-blind-checked palette.

## License

Copyright (c) 2022-2026 Shubham Chomal. All rights reserved. No reuse without written permission; see [LICENSE](LICENSE). Third-party pictures and the bundled animation player keep their own owners and licenses.
