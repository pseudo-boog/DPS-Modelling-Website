// RE-ADD Modeler (web) - user interface. Mirrors the desktop GUI's Data, Model and Results tabs.
import * as E from "./engine.js";
import { EXAMPLE } from "./example.js";
import { METHODS, PARAMS, paramDefault, evaluationsPerRun, methodById, loadCopasiModule } from "./copasi.js";
import { runJob } from "./runner.js";

const { html, render, useState, useEffect, useRef, useMemo, useCallback } = window.htmPreact;
/** Where this site's source code lives. */
const SOURCE_URL = "https://github.com/pseudo-boog/re-add-modeler-web";
const Plotly = window.Plotly;
const JSZip = window.JSZip;

// ---------------------------------------------------------------- small helpers

let _uid = 0;
const uid = () => `f${Date.now().toString(36)}${(_uid++).toString(36)}`;
const lower = (s) => String(s).toLowerCase();
const byName = (a, b) => (lower(a) < lower(b) ? -1 : lower(a) > lower(b) ? 1 : 0); // Python sorted(key=str.lower)
const fmt = (x, d = 6) => (x === null || x === undefined || Number.isNaN(x) ? "nan" : !Number.isFinite(x) ? String(x) : Math.abs(x) !== 0 && (Math.abs(x) < 1e-3 || Math.abs(x) >= 1e6) ? x.toExponential(d - 1) : String(Number(x.toPrecision(d))));
const sig6 = (x) => Number(Number(x).toPrecision(6));
const stem = (name) => name.replace(/\.(csv|txt)$/i, "");
const isEventCol = (c) => c.startsWith("event");
const plural = (n, w, p = w + "s") => `${n} ${n === 1 ? w : p}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function timeStamp(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`;
}
function duration(s) {
  if (s < 60) return `${s.toFixed(s < 10 ? 1 : 0)} s`;
  const m = Math.floor(s / 60);
  return `${m} min ${Math.round(s - m * 60)} s`;
}
const readText = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => rej(r.error); r.readAsText(file); });

/** Species check boxes of the Data tab / statistics: not time, cat*, event*, and measured at row 3. */
function dataSpecies(table) {
  return table.columns.filter((c) => c !== "time" && !c.startsWith("cat") && !isEventCol(c) && !Number.isNaN(table.data[c][Math.min(3, table.nrows - 1)]));
}
/** Species check boxes of the Results plot: not time, cat*, event*. */
function plotSpecies(table) {
  return table.columns.filter((c) => c !== "time" && !c.startsWith("cat") && !isEventCol(c));
}
/** "Species COPASI uses": from the last file, columns other than time/event_/cat* measured at row 3. */
function defaultToMatch(files) {
  if (!files.length) return [];
  const last = [...files].sort((a, b) => byName(a.name, b.name)).at(-1);
  return dataSpecies(last.table);
}

// ---------------------------------------------------------------- session model

// Defaults are the desktop GUI's (py_copasi user_settings.txt). `mp` holds method options the user changed.
const DEFAULT_SETTINGS = {
  method: "genetic_algorithm", mp: {}, copies: "3", peNumber: "10",
  lower: "1e-06", upper: "1000000", seed: "", randomizeStart: true, startValue: "0.1",
};
const methodOf = (st) => methodById(st.method) || methodById("genetic_algorithm");
/** The value (as typed) of COPASI option `name` of the selected method. */
const optionText = (st, method, name) => { const v = st.mp && st.mp[method.id] && st.mp[method.id][name]; return v !== undefined ? v : String(paramDefault(method, name)); };
const DEFAULT_REACTIONS = ["A + cat -> cat1", "cat1 + B -> cat2", "cat2 -> P + cat"];
const emptyRows = (rx = DEFAULT_REACTIONS, n = 5) => {
  const rows = rx.map((r) => ({ rct: r, k: "", kN: "" }));
  while (rows.length < n) rows.push({ rct: "", k: "", kN: "" });
  return rows;
};

function newSession() {
  return {
    files: [], selectedFile: null, additions: [], mechanisms: [], fits: {},
    settings: { ...DEFAULT_SETTINGS }, toMatch: null, trainOff: [],
    editor: { name: "base", rows: emptyRows() },
    results: { model: null, file: null, errorPct: "2", sigma: "0.1", plotOff: [], statOff: [] },
    plotOff: [], example: false, stamp: timeStamp(),
  };
}

function exampleSession() {
  const S = newSession();
  S.example = true;
  S.files = EXAMPLE.files.map((f) => ({ id: uid(), name: f.name, table: E.parseCsv(f.csv, f.name), deleted: [] }));
  S.selectedFile = S.files[0].id;
  S.additions = EXAMPLE.additions.map((a) => ({ fileId: S.files.find((f) => f.name === a.file).id, events: E.parsePyJson(a.json) }));
  S.mechanisms = Object.entries(EXAMPLE.editorRows).map(([n, rows]) => E.makeMechanism(n, rows));
  S.fits = JSON.parse(JSON.stringify(EXAMPLE.fits));
  for (const m of S.mechanisms) S.fits[m.name].fingerprint = fingerprint(S, m);
  S.editor = { name: "", rows: emptyRows(EXAMPLE.editorRows.Inhibition.map((r) => r.rct)) };
  EXAMPLE.editorRows.Inhibition.forEach((r, i) => { S.editor.rows[i].k = r.k; S.editor.rows[i].kN = r.kN; });
  S.results.model = "Inhibition";
  S.results.file = S.files[0].id;
  return S;
}

/** Re-additions in the GUI's internal form ({file, events with event_index}), in the order added. */
function reAddsOf(S) {
  let idx = 0;
  const out = [];
  for (const a of S.additions) {
    const f = S.files.find((x) => x.id === a.fileId);
    if (!f || !a.events.length) continue;
    const p = E.prepareReAdditions(a.events, idx);
    idx = p.nextIndex;
    out.push({ file: f.name, fileId: f.id, events: p.events });
  }
  return out;
}
const sortedFiles = (S) => [...S.files].sort((a, b) => byName(a.name, b.name));
const sortedMechs = (S) => [...S.mechanisms].sort((a, b) => byName(a.name, b.name));
const toMatchOf = (S) => (S.toMatch ?? defaultToMatch(S.files)).filter((s) => S.files.some((f) => f.table.columns.includes(s)));
const trainingFiles = (S) => sortedFiles(S).filter((f) => !S.trainOff.includes(f.id));
function nanCount(table) { let n = 0; for (const c of table.columns) for (const v of table.data[c]) if (Number.isNaN(v)) n++; return n; }
/** Changes when anything that the fit of mechanism m depends on changes. */
function fingerprint(S, m) {
  return JSON.stringify([E.buildSbString(m, reAddsOf(S)), toMatchOf(S), trainingFiles(S).map((f) => [f.name, f.table.nrows, nanCount(f.table)])]);
}

/** Full parameter vector (problem order) for a mechanism from its best fit row. */
function bestParams(problem, fit) {
  const row = fit && fit.rows[0];
  return problem.paramNames.map((k, i) => (row && k in row.k ? row.k[k] : problem.values[i]));
}

/** Simulate mechanism m for one file; returns {atData: {species: []}, dense: {...}, failed}. */
function simulateFile(S, m, file, fit, dense = true) {
  const prob = E.buildProblem(m, [{ name: file.name, table: file.table }], reAddsOf(S), []);
  const exp = prob.experiments[0];
  const params = bestParams(prob, fit);
  const sim = E.createSimulator(prob);
  const n = prob.species.length;
  const pack = (times, out) => {
    const res = { time: times };
    prob.species.forEach((s, i) => { res[s] = out ? times.map((_, ti) => out[ti * n + i]) : times.map(() => NaN); });
    return res;
  };
  const outData = sim.simulate(exp, params);
  const atData = pack(exp.times, outData);
  let denseRes = null;
  if (dense && exp.times.length) {
    const t0 = exp.times[0], t1 = exp.times[exp.times.length - 1];
    const grid = new Set();
    for (let i = 0; i <= 400; i++) grid.add(t0 + (t1 - t0) * i / 400);
    exp.times.forEach((t) => grid.add(t));
    exp.events.forEach((ev) => { if (ev.t > t0 && ev.t <= t1) { grid.add(ev.t - Math.max(1e-9, Math.abs(ev.t) * 1e-9)); grid.add(ev.t); } });
    const times = [...grid].sort((a, b) => a - b);
    denseRes = pack(times, sim.simulate({ ...exp, times }, params));
  }
  return { atData, dense: denseRes, failed: !outData, species: prob.species, order: speciesOrder(m) };
}
/** Species in order of first appearance in the reactions (roadrunner's column order). */
function speciesOrder(m) {
  const seen = [];
  for (const s of m.m_steps) { const p = E.parseReaction(s); if (p.ok) for (const c of [...p.educts, ...p.products]) if (!seen.includes(c.name)) seen.push(c.name); }
  return seen;
}

// ---------------------------------------------------------------- serialisation (autosave + session zip)

function serialize(S) {
  return E.stringifyPy({
    v: 1, example: S.example, stamp: S.stamp, selectedFile: S.selectedFile,
    files: S.files.map((f) => ({ id: f.id, name: f.name, csv: E.toCsv(f.table), deleted: f.deleted })),
    additions: S.additions, mechanisms: S.mechanisms, fits: S.fits, settings: S.settings, toMatch: S.toMatch, trainOff: S.trainOff,
    editor: S.editor, results: S.results, plotOff: S.plotOff,
  }, 0);
}
function deserialize(text) {
  const o = E.parsePyJson(text);
  const num = (v) => (v && typeof v === "object" && "isFloat" in v ? Number(v) : v);
  const plain = (v) => JSON.parse(JSON.stringify(v, (k, x) => (x && typeof x === "object" && "isFloat" in x ? Number(x) : x)));
  const S = newSession();
  S.example = !!o.example; S.stamp = o.stamp || S.stamp; S.selectedFile = o.selectedFile;
  S.files = o.files.map((f) => ({ id: f.id, name: f.name, table: E.parseCsv(f.csv, f.name), deleted: plain(f.deleted || []).map((d) => ({ ...d, value: num(d.value) })) }));
  S.additions = o.additions; // keeps PyNum numbers (int vs float matters for the sb string)
  S.mechanisms = o.mechanisms.map((m) => E.completeMechanism(plain(m)));
  S.fits = plain(o.fits || {});
  const old = plain(o.settings || {});
  S.settings = { ...DEFAULT_SETTINGS, ...old, mp: old.mp || {} };
  if (!old.method && (old.generations || old.population)) { // sessions saved before the method choice: the genetic algorithm
    S.settings.mp = { genetic_algorithm: { "Number of Generations": String(old.generations ?? 50), "Population Size": String(old.population ?? 50), "Mutation Variance": String(old.mutationVariance ?? 0.1), "Stop after # Stalled Generations": String(old.stopAfterStalled ?? 0) } };
  }
  for (const k of ["generations", "population", "mutationVariance", "stopAfterStalled"]) delete S.settings[k];
  for (const k of ["copies", "peNumber", "lower", "upper", "seed", "startValue"]) S.settings[k] = String(S.settings[k]);
  S.toMatch = o.toMatch ? plain(o.toMatch) : null;
  S.trainOff = plain(o.trainOff || []);
  S.editor = plain(o.editor || S.editor);
  S.results = { ...S.results, ...plain(o.results || {}) };
  S.results.errorPct = String(S.results.errorPct); S.results.sigma = String(S.results.sigma);
  S.plotOff = plain(o.plotOff || []);
  return S;
}

const IDB = {
  open() {
    return new Promise((res) => {
      try {
        const rq = indexedDB.open("re-add-modeler", 1);
        rq.onupgradeneeded = () => rq.result.createObjectStore("kv");
        rq.onsuccess = () => res(rq.result);
        rq.onerror = () => res(null);
      } catch { res(null); }
    });
  },
  async get(key) {
    try {
      const db = await this.open(); if (!db) return null;
      return await new Promise((res) => { const rq = db.transaction("kv").objectStore("kv").get(key); rq.onsuccess = () => res(rq.result ?? null); rq.onerror = () => res(null); });
    } catch { return null; }
  },
  async set(key, value) {
    try {
      const db = await this.open(); if (!db) return;
      await new Promise((res) => { const tx = db.transaction("kv", "readwrite"); tx.objectStore("kv").put(value, key); tx.oncomplete = res; tx.onerror = res; });
    } catch { /* storage unavailable: nothing to do */ }
  },
};

/** The desktop GUI's output/<time stamp> folder, as a zip. */
async function buildSessionZip(S, resultsInfo) {
  const zip = new JSZip();
  const stamp = timeStamp();
  const root = zip.folder(stamp);
  const ras = reAddsOf(S);
  const tc = root.folder("time_courses");
  const desktopPath = (f) => `./output/${stamp}/time_courses/${stem(f.name)}_data_.csv`;
  for (const f of sortedFiles(S)) {
    const extra = {};
    ras.forEach((ra, n) => { if (ra.fileId === f.id) extra[`event_${n + 1}`] = 1; });
    const cols = f.table.columns.filter((c) => !isEventCol(c));
    tc.file(`${stem(f.name)}_data_.csv`, E.toCsv({ ...f.table, columns: cols }, extra));
  }
  if (ras.length) tc.file("re_add.json", E.stringifyPy(ras.map((ra) => ({ [desktopPath(S.files.find((f) => f.id === ra.fileId))]: ra.events }))));
  const models = root.folder("models");
  for (const m of sortedMechs(S)) {
    const dir = models.folder(m.name);
    dir.file("model.json", E.stringifyPy(m));
    dir.file("sb_string.txt", E.buildSbString(m, ras));
    const fit = S.fits[m.name];
    if (fit) dir.file("k_result.csv", kResultCsv(m, fit));
  }
  if (resultsInfo) {
    const res = root.folder("results");
    for (const [name, curve] of Object.entries(resultsInfo.curves)) res.file(`${name}_data.csv`, curveCsv(curve));
    if (resultsInfo.errors) res.file("errors.json", JSON.stringify(resultsInfo.errors, null, 4));
    if (resultsInfo.ftests) res.file("F_tests.json", JSON.stringify(resultsInfo.ftests, null, 4));
  }
  root.file("web_session.json", serialize(S));
  return { blob: await zip.generateAsync({ type: "blob", compression: "DEFLATE" }), name: `re-add-session_${stamp}.zip` };
}
function kResultCsv(m, fit) {
  const keys = fit.keys || Object.keys(fit.rows[0]?.k || {});
  const lines = [[...keys, "RSS"].join(",")];
  for (const r of fit.rows) lines.push([...keys.map((k) => E.pyFloat(r.k[k])), E.pyFloat(r.RSS)].join(","));
  return lines.join("\n") + "\n";
}
function curveCsv(curve) {
  const cols = ["time", ...curve.order.filter((s) => s in curve.atData)];
  const lines = [cols.join(",")];
  for (let i = 0; i < curve.atData.time.length; i++) lines.push(cols.map((c) => E.pyFloat(curve.atData[c][i])).join(","));
  return lines.join("\n") + "\n";
}

/** Load a session zip written by this page or a zipped desktop output/<time stamp> folder. */
async function loadSessionZip(blob) {
  const zip = await JSZip.loadAsync(blob);
  const entries = Object.values(zip.files).filter((e) => !e.dir && !e.name.includes("__MACOSX"));
  const web = entries.find((e) => /(^|\/)web_session\.json$/.test(e.name));
  if (web) return deserialize(await web.async("string"));
  const tcFiles = entries.filter((e) => /(^|\/)time_courses\/[^/]+\.(csv|txt)$/i.test(e.name));
  if (!tcFiles.length) throw new Error("this zip has no time_courses folder - choose a session saved here or a desktop output/<date> folder");
  const S = newSession();
  for (const e of tcFiles.sort((a, b) => byName(a.name.split("/").pop(), b.name.split("/").pop()))) {
    const base = e.name.split("/").pop();
    const name = base.replace(/_data_\.(csv|txt)$/i, "") + ".csv";
    const table = E.parseCsv(await e.async("string"), base);
    const cols = table.columns.filter((c) => !isEventCol(c));
    const data = {}; cols.forEach((c) => { data[c] = table.data[c]; });
    S.files.push({ id: uid(), name, table: { columns: cols, nrows: table.nrows, data }, deleted: [], base });
  }
  S.selectedFile = S.files[0].id;
  const ra = entries.find((e) => /(^|\/)time_courses\/re_add\.json$/.test(e.name));
  if (ra) {
    const list = E.parsePyJson(await ra.async("string"));
    for (const entry of list) {
      for (const [path, events] of Object.entries(entry)) {
        const base = path.split(/[\\/]/).pop();
        const f = S.files.find((x) => x.base === base);
        if (!f) continue;
        const existing = S.additions.find((a) => a.fileId === f.id);
        const clean = events.map((ev) => ev.map(({ event_index, ...rest }) => rest));
        if (existing) existing.events.push(...clean); else S.additions.push({ fileId: f.id, events: clean });
      }
    }
  }
  for (const e of entries.filter((x) => /(^|\/)models\/[^/]+\/model\.json$/.test(x.name))) {
    const m = E.completeMechanism(JSON.parse(await e.async("string")));
    S.mechanisms.push(m);
    const kr = entries.find((x) => x.name === e.name.replace(/model\.json$/, "k_result.csv"));
    if (kr) {
      const t = E.parseCsv(await kr.async("string"), "k_result.csv", { requireTime: false });
      const keys = t.columns.filter((c) => c !== "RSS");
      const rows = [];
      for (let i = 0; i < t.nrows; i++) rows.push({ k: Object.fromEntries(keys.map((k) => [k, t.data[k][i]])), RSS: t.data.RSS[i] });
      S.fits[m.name] = { rows, keys, imported: true };
    }
  }
  S.files.forEach((f) => delete f.base);
  for (const m of S.mechanisms) if (S.fits[m.name]) S.fits[m.name].fingerprint = fingerprint(S, m);
  const names = S.mechanisms.map((m) => m.name);
  S.results.model = names.find((n) => S.fits[n]) || null;
  S.results.file = S.selectedFile;
  return S;
}

// ---------------------------------------------------------------- downloads

const downloadsReady = (async () => {
  try { return window.claude && window.claude.use ? await window.claude.use("downloads") : null; } catch { return null; }
})();
async function saveFile(filename, data, toast) {
  const dl = await downloadsReady;
  if (dl) {
    try { await dl.save({ filename, data }); toast(`Saved ${filename}`); }
    catch (e) {
      if (e && e.code === "declined") return;
      if (e && e.code === "rate_limited") toast("Another save is still waiting for your answer.", "bad");
      else toast(`Could not save ${filename} here (${e && e.code || "unavailable"}).`, "bad");
    }
    return;
  }
  if (!window.claude) { // opened outside the Claude viewer: a normal browser download
    const url = URL.createObjectURL(data instanceof Blob ? data : new Blob([data]));
    const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return;
  }
  toast("Saving files isn't available in this view.", "bad");
}

// ---------------------------------------------------------------- fitting (worker pool)

let pageCopasiModule;
/** The COPASI module for runs on the page itself (no workers). */
function pageCopasi() {
  if (!pageCopasiModule) pageCopasiModule = loadCopasiModule(new URL("./copasi-opt.wasm", import.meta.url)).catch(() => null);
  return pageCopasiModule;
}

function spawnWorker() {
  return new Promise((resolve) => {
    let w;
    try { w = new Worker(new URL("./worker.js", import.meta.url), { type: "module" }); } catch { resolve(null); return; }
    const timer = setTimeout(() => { w.terminate(); resolve(null); }, 8000);
    w.onmessage = (e) => { if (e.data && e.data.type === "ready") { clearTimeout(timer); w.onmessage = null; resolve(w); } };
    w.onerror = (e) => { e.preventDefault && e.preventDefault(); clearTimeout(timer); w.terminate(); resolve(null); };
  });
}

/** Runs parameter-estimation jobs on a pool of workers (or on the page itself if workers are unavailable). */
function runJobs(jobs, { onStart = () => {}, onProgress, onDone, onError }) {
  let cancelled = false;
  const workers = [];
  const finished = (async () => {
    const want = Math.max(1, Math.min(8, (navigator.hardwareConcurrency || 4) - 1, jobs.length));
    const spawned = await Promise.all(Array.from({ length: want }, spawnWorker));
    workers.push(...spawned.filter(Boolean));
    if (cancelled) { workers.forEach((w) => w.terminate()); return { mode: "cancelled" }; }
    const queue = jobs.slice();
    onStart(workers.length || 1, workers.length ? "workers" : "page");
    if (!workers.length) { // page-thread fallback, sliced so the page stays responsive
      for (const job of queue) {
        if (cancelled) break;
        try {
          const out = runJob(job, await pageCopasi(), (m) => onProgress(m.id, m.frac, m.best));
          if (!cancelled) onDone(job.id, out.history, out.evals);
        } catch (e) { onError(job.id, e.message || String(e)); }
        await sleep(0); // one run at a time, letting the page repaint in between
      }
      return { mode: "page", threads: 1 };
    }
    await Promise.all(workers.map((w) => new Promise((resolve) => {
      const next = () => {
        if (cancelled || !queue.length) { resolve(); return; }
        const job = queue.shift();
        w.onmessage = (e) => {
          const m = e.data;
          if (m.type === "progress") onProgress(m.id, m.frac, m.best);
          else if (m.type === "done") { onDone(m.id, m.history, m.evals); next(); }
          else if (m.type === "error") { onError(m.id, m.message); next(); }
        };
        w.onerror = (e) => { e.preventDefault && e.preventDefault(); onError(job.id, e.message || "worker crashed"); resolve(); };
        w.postMessage({ type: "run", job });
      };
      next();
    })));
    workers.forEach((w) => w.terminate());
    return { mode: "workers", threads: workers.length };
  })();
  return { finished, cancel() { cancelled = true; workers.forEach((w) => w.terminate()); } };
}

function parseSettings(st) {
  const errs = [];
  const int = (v, name, min) => { const n = Number(String(v).trim()); if (!Number.isInteger(n) || n < min) errs.push(`${name} must be a whole number of at least ${min}`); return n; };
  const num = (v, name) => { const n = Number(String(v).trim()); if (String(v).trim() === "" || !Number.isFinite(n)) errs.push(`${name} must be a number`); return n; };
  const method = methodOf(st);
  const params = {};
  for (const name of [...method.params, ...method.extra]) {
    const spec = PARAMS[name], text = optionText(st, method, name);
    const v = spec.int ? int(text, name, spec.min ?? 0) : num(text, name);
    if (!spec.int && Number.isFinite(v) && ((spec.min !== undefined && v < spec.min) || (spec.max !== undefined && v > spec.max))) errs.push(`${name} must be between ${spec.min ?? "-∞"} and ${spec.max ?? "∞"}`);
    params[name] = v;
  }
  const s = {
    method, params,
    copies: int(st.copies, "Copies", 1), peNumber: int(st.peNumber, "Runs per copy", 1),
    lower: num(st.lower, "Lower bound"), upper: num(st.upper, "Upper bound"),
    randomizeStart: !!st.randomizeStart, startValue: num(st.startValue, "Start value"),
    seed: String(st.seed).trim() === "" ? null : int(st.seed, "Random seed", 0),
  };
  if (!errs.length && !(s.lower < s.upper)) errs.push("the lower bound must be smaller than the upper bound");
  return { s, errs };
}
/** A one-line description of a fit's method and settings. */
function methodSummary(fs) {
  if (!fs) return "";
  const m = methodById(fs.method || "genetic_algorithm");
  const p = fs.params || { "Number of Generations": fs.generations, "Population Size": fs.population };
  const shown = (m ? m.params : []).filter((n) => p[n] !== undefined).map((n) => `${n} ${p[n]}`);
  return `${m ? m.name : fs.method}${shown.length ? ` (${shown.join(", ")})` : ""}, ${fs.copies * fs.peNumber} runs`;
}

// ---------------------------------------------------------------- theme + plots

function useThemeTick() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const bump = () => setTick((t) => t + 1);
    mq.addEventListener ? mq.addEventListener("change", bump) : mq.addListener(bump);
    const mo = new MutationObserver(bump);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
    return () => { mo.disconnect(); mq.removeEventListener ? mq.removeEventListener("change", bump) : mq.removeListener(bump); };
  }, []);
  return tick;
}
function tokens() {
  const cs = getComputedStyle(document.documentElement);
  const g = (n) => cs.getPropertyValue(n).trim();
  return { surface: g("--chart-surface"), grid: g("--chart-grid"), axis: g("--chart-axis"), ink: g("--ink"), ink2: g("--ink-2"), muted: g("--muted"), rule: g("--rule"), accent: g("--accent"), series: [1, 2, 3, 4, 5, 6, 7, 8].map((i) => g(`--s${i}`)) };
}
function rgba(hex, a) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
/** Colour follows the species: slot by first appearance across all loaded files. */
function speciesColors(S, t) {
  const order = [];
  for (const f of S.files) for (const c of f.table.columns) if (c !== "time" && !isEventCol(c) && !order.includes(c)) order.push(c);
  const map = {};
  order.forEach((s, i) => { map[s] = i < 8 ? t.series[i] : t.muted; });
  return (s) => map[s] || t.muted;
}
function baseLayout(t, extra = {}) {
  const axis = { gridcolor: t.grid, linecolor: t.axis, showline: true, zeroline: false, tickcolor: t.axis, ticks: "outside", ticklen: 4, color: t.ink2, automargin: true, exponentformat: "e" };
  return {
    paper_bgcolor: t.surface, plot_bgcolor: t.surface,
    font: { family: '"IBM Plex Sans", system-ui, sans-serif', size: 12, color: t.ink2 },
    margin: { l: 56, r: 12, t: 12, b: 44 },
    xaxis: { ...axis, title: { text: "Time", standoff: 6 } }, yaxis: { ...axis, title: { text: "Value", standoff: 6 } },
    legend: { orientation: "h", x: 0, y: 1.02, yanchor: "bottom", font: { color: t.ink2 }, bgcolor: "rgba(0,0,0,0)" },
    hovermode: "closest", dragmode: "zoom", hoverlabel: { bgcolor: t.surface, bordercolor: t.rule, font: { color: t.ink, family: '"IBM Plex Mono", monospace', size: 12 } },
    ...extra,
  };
}
const PLOT_CONFIG = { displaylogo: false, responsive: true, modeBarButtonsToRemove: ["select2d", "lasso2d", "autoScale2d", "toggleSpikelines", "hoverClosestCartesian", "hoverCompareCartesian"], toImageButtonOptions: { format: "png", scale: 2 } };

function Plot({ traces, layout, onClick, onReset, label }) {
  const ref = useRef(null);
  const handlers = useRef({});
  handlers.current = { onClick, onReset };
  useEffect(() => {
    const el = ref.current;
    Plotly.newPlot(el, traces, layout, PLOT_CONFIG);
    el.on("plotly_click", (ev) => handlers.current.onClick && handlers.current.onClick(ev));
    return () => Plotly.purge(el);
  }, []);
  useEffect(() => { Plotly.react(ref.current, traces, layout, PLOT_CONFIG); }, [traces, layout]);
  return html`<div class="plot" ref=${ref} role="img" aria-label=${label}></div>`;
}

// ---------------------------------------------------------------- components

function Chip({ on, color, label, onToggle }) {
  return html`<label class=${"chip" + (on ? "" : " off")}>
    <input type="checkbox" checked=${on} onChange=${onToggle} />
    ${color && html`<i class="sw" style=${{ background: color }}></i>`}${label}
  </label>`;
}

function Modal({ title, onClose, children, hint, wide }) {
  const ref = useRef(null);
  useEffect(() => {
    const k = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", k);
    const first = ref.current && ref.current.querySelector("button, input, select, textarea");
    first && first.focus();
    return () => document.removeEventListener("keydown", k);
  }, []);
  return html`<div class="scrim" onClick=${(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div class="modal" role="dialog" aria-modal="true" aria-label=${title} ref=${ref} style=${wide ? { width: "min(920px, 100%)" } : null}>
      <div class="panel-h"><h2>${title}</h2>${hint && html`<span class="hint">${hint}</span>`}<span class="spacer"></span><button class="btn ghost small" onClick=${onClose}>Close</button></div>
      <div class="panel-b">${children}</div>
    </div>
  </div>`;
}

function Confirm({ text, yes, onYes, onClose }) {
  return html`<${Modal} title="Please confirm" onClose=${onClose}>
    <p style=${{ margin: 0 }}>${text}</p>
    <div class="row" style=${{ justifyContent: "flex-end" }}>
      <button class="btn" onClick=${onClose}>Cancel</button>
      <button class="btn primary" onClick=${() => { onClose(); onYes(); }}>${yes}</button>
    </div>
  <//>`;
}

// ---- Data tab -----------------------------------------------------------------

function DropZone({ onFiles, children, accept }) {
  const [over, setOver] = useState(false);
  const input = useRef(null);
  return html`<div class=${"drop" + (over ? " over" : "")}
      onDragOver=${(e) => { e.preventDefault(); setOver(true); }} onDragLeave=${() => setOver(false)}
      onDrop=${(e) => { e.preventDefault(); setOver(false); onFiles([...e.dataTransfer.files]); }}>
    ${children}
    <button class="btn small" onClick=${() => input.current.click()}>Choose files</button>
    <input type="file" multiple accept=${accept} hidden ref=${input} onChange=${(e) => { onFiles([...e.target.files]); e.target.value = ""; }} />
  </div>`;
}

function FilesPanel({ S, act }) {
  const ras = reAddsOf(S);
  return html`<section class="panel">
    <div class="panel-h"><h2>Time courses</h2><span class="hint">.csv or .txt with a “time” column</span></div>
    <div class="panel-b">
      <${DropZone} onFiles=${act.addFiles} accept=".csv,.txt,.json,.zip,.cdxml">
        <div><strong>Drop time courses here</strong></div>
        <div class="small muted">Also takes a re-addition .json, a model.json or a saved session .zip</div>
      <//>
      ${S.files.length > 0 && html`<div class="list" role="listbox" aria-label="Time courses">
        ${sortedFiles(S).map((f) => {
          const n = ras.find((r) => r.fileId === f.id)?.events.length || 0;
          return html`<div class="item" key=${f.id} role="option" aria-selected=${S.selectedFile === f.id} onClick=${() => act.set({ selectedFile: f.id })}>
            <div class="grow"><span class="name">${f.name}</span><span class="meta">${f.table.nrows} rows · ${f.table.columns.filter((c) => c !== "time").join(", ")}</span></div>
            <button class=${"btn small" + (n ? " on" : "")} onClick=${(e) => { e.stopPropagation(); act.openAdditions(f.id); }} title="Re-additions for this file">${n ? `Additions · ${n}` : "Addition"}</button>
            <button class="btn ghost small danger" aria-label=${"Remove " + f.name} onClick=${(e) => { e.stopPropagation(); act.confirm(`Remove ${f.name} and its additions from the session?`, "Remove", () => act.removeFile(f.id)); }}>✕</button>
          </div>`;
        })}
      </div>`}
    </div>
  </section>`;
}

function ReactionEditor({ S, act }) {
  const ed = S.editor;
  const [bad, setBad] = useState({});
  const setRow = (i, key, value) => act.setEditor({ rows: ed.rows.map((r, j) => (j === i ? { ...r, [key]: value } : r)) });
  const blurRct = (i) => {
    const v = ed.rows[i].rct;
    const ok = !v.trim() || E.parseReaction(v).ok;
    setBad((b) => ({ ...b, [`r${i}`]: !ok }));
  };
  const blurK = (i, key) => {
    const v = ed.rows[i][key];
    const n = E.normalizeK(v);
    if (n.ok && n.text !== v) setRow(i, key, n.text);
    setBad((b) => ({ ...b, [`${key}${i}`]: !n.ok }));
  };
  let step = 0;
  const jsonIn = useRef(null);
  return html`<section class="panel">
    <div class="panel-h"><h2>Reactions</h2><span class="hint">one step per line · <code>$</code> fixes a value, e.g. <code>$0</code></span></div>
    <div class="panel-b">
      <div class="rx rx-head"><span></span><span>Reaction</span><span>k</span><span>kN (reverse)</span><span></span></div>
      ${ed.rows.map((r, i) => {
        const valid = r.rct.trim() && E.parseReaction(r.rct).ok;
        if (valid) step++;
        return html`<div class="rx" key=${i}>
          <span class="idx">${valid ? step : ""}</span>
          <input id=${"rct" + i} class=${"input mono" + (bad["r" + i] ? " invalid" : "")} value=${r.rct} placeholder="A + B -> C" aria-label=${"Reaction " + (i + 1)} onInput=${(e) => setRow(i, "rct", e.target.value)} onBlur=${() => blurRct(i)} />
          <input id=${"k" + i} class=${"input mono" + (bad["k" + i] ? " invalid" : "")} value=${r.k} placeholder=${valid ? `k${step}` : ""} aria-label=${"k of reaction " + (i + 1)} onInput=${(e) => setRow(i, "k", e.target.value)} onBlur=${() => blurK(i, "k")} />
          <input id=${"kN" + i} class=${"input mono" + (bad["kN" + i] ? " invalid" : "")} value=${r.kN} placeholder=${valid ? `kN${step}` : ""} aria-label=${"kN of reaction " + (i + 1)} onInput=${(e) => setRow(i, "kN", e.target.value)} onBlur=${() => blurK(i, "kN")} />
          <button class="btn ghost small" aria-label=${"Clear row " + (i + 1)} onClick=${() => act.setEditor({ rows: ed.rows.length > 1 ? ed.rows.filter((_, j) => j !== i) : [{ rct: "", k: "", kN: "" }] })}>✕</button>
        </div>`;
      })}
      <div class="row">
        <button class="btn small" onClick=${() => act.setEditor({ rows: [...ed.rows, { rct: "", k: "", kN: "" }] })}>Add row</button>
        <span class="small muted">Empty k means “fit it”; reverse steps are fitted too unless fixed.</span>
      </div>
      <div class="row" style=${{ alignItems: "end" }}>
        <label class="field" style=${{ flex: "1 1 160px" }}><span>Mechanism name</span>
          <input id="mech-name" class="input" value=${ed.name} placeholder="e.g. base" onInput=${(e) => act.setEditor({ name: e.target.value })} onKeyDown=${(e) => { if (e.key === "Enter") act.addMechanism(); }} /></label>
        <button class="btn primary" onClick=${act.addMechanism}>Add mechanism</button>
        <button class="btn" onClick=${() => jsonIn.current.click()}>Open model.json</button>
        <input type="file" accept=".json,.cdxml" hidden ref=${jsonIn} onChange=${(e) => { act.addFiles([...e.target.files]); e.target.value = ""; }} />
      </div>
      <div class="small muted">Name one mechanism <b>base</b>: the Results tab compares every other mechanism with it (F-test).</div>
    </div>
  </section>`;
}

function DataPlot({ S, act, tick }) {
  const f = S.files.find((x) => x.id === S.selectedFile);
  const [sel, setSel] = useState(null); // {col, row}
  useEffect(() => setSel(null), [S.selectedFile]);
  const species = f ? dataSpecies(f.table) : [];
  const visible = species.filter((s) => !S.plotOff.includes(s));
  const t = useMemo(() => tokens(), [tick]);
  const color = speciesColors(S, t);
  const traces = useMemo(() => {
    if (!f) return [];
    const x = Array.from(f.table.data.time);
    const tr = visible.map((s) => ({
      type: "scatter", mode: "markers", name: s, x, y: Array.from(f.table.data[s]).map((v) => (Number.isNaN(v) ? null : v)),
      customdata: x.map((_, i) => i), meta: s,
      marker: { size: 8, color: color(s), line: { color: t.surface, width: 1.5 } },
      hovertemplate: `${s}<br>t = %{x}<br>%{y:.6g}<extra></extra>`,
    }));
    if (sel && visible.includes(sel.col) && !Number.isNaN(f.table.data[sel.col][sel.row])) {
      tr.push({ type: "scatter", mode: "markers", name: "Selected point", x: [f.table.data.time[sel.row]], y: [f.table.data[sel.col][sel.row]], hoverinfo: "skip", showlegend: false,
        marker: { size: 16, color: "rgba(0,0,0,0)", line: { color: t.ink, width: 2 } } });
    }
    return tr;
  }, [f, S.plotOff.join(), sel, t]);
  const layout = useMemo(() => baseLayout(t, { uirevision: f ? f.id : "none", showlegend: false }), [t, f && f.id]); // the chips above are the legend
  const del = () => { if (sel) { act.deletePoint(f.id, sel.col, sel.row); setSel(null); } };
  useEffect(() => {
    const k = (e) => {
      if (!sel || !["Delete", "Backspace"].includes(e.key)) return;
      if (e.target.closest && e.target.closest("input, textarea, select, [contenteditable]")) return;
      e.preventDefault(); del();
    };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  });
  if (!f) return html`<section class="panel"><div class="plot-empty">Load a time course to see it here.</div></section>`;
  const onClick = (ev) => {
    const p = ev.points && ev.points[0];
    if (!p || p.data.meta === undefined || p.data.name === "Selected point") return;
    setSel({ col: p.data.meta, row: p.customdata });
  };
  return html`<section class="panel">
    <div class="panel-h"><h2>${f.name}</h2><span class="hint">click a point, then Delete to drop it from the fit · drag to zoom, double-click to reset</span></div>
    <div class="panel-b">
      <div class="chips">${species.map((s) => html`<${Chip} key=${s} label=${s} color=${color(s)} on=${!S.plotOff.includes(s)} onToggle=${() => act.set({ plotOff: S.plotOff.includes(s) ? S.plotOff.filter((x) => x !== s) : [...S.plotOff, s] })} />`)}</div>
      <${Plot} traces=${traces} layout=${layout} onClick=${onClick} label=${`Time course ${f.name}`} />
      <div class="row">
        <button class="btn" disabled=${!sel} onClick=${del}>${sel ? `Delete ${sel.col} at t = ${fmt(f.table.data.time[sel.row])}` : "Delete point"}</button>
        <button class="btn" disabled=${!f.deleted.length} onClick=${() => act.undoDelete(f.id)}>Undo delete${f.deleted.length ? ` (${f.deleted.length})` : ""}</button>
        <span class="spacer"></span>
        <span class="small muted">${nanCount(f.table)} empty cells</span>
      </div>
    </div>
  </section>`;
}

function AdditionsModal({ S, act, fileId, staged, onClose }) {
  const f = S.files.find((x) => x.id === fileId);
  const entry = S.additions.find((a) => a.fileId === fileId);
  const events = entry ? entry.events : [];
  const ras = reAddsOf(S);
  const prepared = ras.find((r) => r.fileId === fileId);
  const cols = f ? f.table.columns.filter((c) => c !== "time" && !isEventCol(c)) : [];
  const [form, setForm] = useState({ time: "5000", rct: "10", species: [{ s: cols[0] || "", mmol: "1", vol: "2" }] });
  const [err, setErr] = useState("");
  const jsonIn = useRef(null);
  if (!f) return null;
  const addManual = () => {
    const t = Number(form.time), rct = Number(form.rct);
    if (!Number.isFinite(t) || t <= 0) return setErr("The time must be a number above 0 (in the units of the time column).");
    if (!(rct > 0)) return setErr("The reaction volume must be a number above 0 mL.");
    const sp = [];
    for (const r of form.species) {
      const mmol = Number(r.mmol), vol = Number(r.vol);
      if (!r.s) return setErr("Pick a species for every row.");
      if (!Number.isFinite(mmol) || mmol < 0) return setErr(`mmol of ${r.s} must be a number of at least 0.`);
      if (!Number.isFinite(vol) || vol < 0) return setErr(`Added volume of ${r.s} must be a number of at least 0 mL.`);
      sp.push({ species: r.s, rct_volume_ml: E.pyFloatNum(rct), added_vol_ml: E.pyFloatNum(vol), mmol: E.pyFloatNum(mmol), time_re_add: E.pyFloatNum(t) });
    }
    setErr("");
    act.addEvents(fileId, [sp]);
  };
  const fromJson = async (file) => {
    try {
      const raw = E.parsePyJson(await readText(file));
      E.prepareReAdditions(raw, 0); // validates
      act.addEvents(fileId, raw);
      setErr("");
    } catch (e) { setErr(`${file.name}: ${e.message}`); }
  };
  return html`<${Modal} title=${`Additions · ${f.name}`} hint="species added during the run (re-additions)" onClose=${onClose} wide>
    ${staged && html`<div class="note">
      <b>${staged.name}</b> has ${plural(staged.events.length, "addition event")}. Add them to ${f.name}?
      <div class="row" style=${{ marginTop: "8px" }}><button class="btn primary small" onClick=${() => { act.addEvents(fileId, staged.events); act.clearStaged(); }}>Add to ${f.name}</button><button class="btn small" onClick=${act.clearStaged}>Discard</button></div>
    </div>`}
    ${events.length ? html`<div class="tablewrap"><table>
      <thead><tr><th>#</th><th class="n">time</th><th>species</th><th class="n">mmol</th><th class="n">reactor mL</th><th class="n">added mL</th><th></th></tr></thead>
      <tbody>${events.map((ev, i) => {
        const p = prepared && prepared.events[i];
        return ev.map((ra, j) => html`<tr key=${i + "-" + j}>
          <td>${j === 0 ? html`<span class="pill">event ${p ? p[0].event_index : i + 1}</span>` : ""}</td>
          <td class="n">${j === 0 ? E.pyStr(ra.time_re_add) : ""}</td>
          <td>${E.pyStr(ra.species)}</td><td class="n">${E.pyStr(ra.mmol)}</td>
          <td class="n">${j === 0 ? E.pyStr(ra.rct_volume_ml) : ""}</td><td class="n">${p ? E.pyStr(p[j].added_vol_ml) : E.pyStr(ra.added_vol_ml)}</td>
          <td>${j === 0 ? html`<button class="btn ghost small danger" onClick=${() => act.removeEvent(fileId, i)}>Remove</button>` : ""}</td>
        </tr>`);
      })}</tbody></table></div>` : html`<div class="note">No additions yet. The simulation of ${f.name} then runs without events.</div>`}
    <div class="grid2" style=${{ alignItems: "start" }}>
      <div class="panel"><div class="panel-b">
        <div class="eyebrow">From JSON</div>
        <div class="small muted">A list of events; each event is a list of the species added at that moment, e.g.</div>
        <pre class="sb" style=${{ maxHeight: "150px", fontSize: "11.5px" }}>[[{"species": "A", "rct_volume_ml": 30.0,
  "added_vol_ml": 0.5, "mmol": 1.5, "time_re_add": "60"}]]</pre>
        <button class="btn" onClick=${() => jsonIn.current.click()}>Choose JSON file</button>
        <input type="file" accept=".json" hidden ref=${jsonIn} onChange=${(e) => { if (e.target.files[0]) fromJson(e.target.files[0]); e.target.value = ""; }} />
      </div></div>
      <div class="panel"><div class="panel-b">
        <div class="eyebrow">Add by hand</div>
        <div class="grid2">
          <label class="field"><span>Time</span><input id="ad-time" class="input mono" inputmode="decimal" value=${form.time} onInput=${(e) => setForm({ ...form, time: e.target.value })} /></label>
          <label class="field"><span>Reactor volume (mL)</span><input id="ad-rct" class="input mono" inputmode="decimal" value=${form.rct} onInput=${(e) => setForm({ ...form, rct: e.target.value })} /></label>
        </div>
        ${form.species.map((r, i) => html`<div class="grid3" key=${i} style=${{ alignItems: "end" }}>
          <label class="field"><span>Species</span><select id=${"ad-s" + i} class="input" value=${r.s} onChange=${(e) => setForm({ ...form, species: form.species.map((x, j) => (j === i ? { ...x, s: e.target.value } : x)) })}>${cols.map((c) => html`<option value=${c}>${c}</option>`)}</select></label>
          <label class="field"><span>mmol</span><input id=${"ad-m" + i} class="input mono" inputmode="decimal" value=${r.mmol} onInput=${(e) => setForm({ ...form, species: form.species.map((x, j) => (j === i ? { ...x, mmol: e.target.value } : x)) })} /></label>
          <label class="field"><span>Added mL</span><input id=${"ad-v" + i} class="input mono" inputmode="decimal" value=${r.vol} onInput=${(e) => setForm({ ...form, species: form.species.map((x, j) => (j === i ? { ...x, vol: e.target.value } : x)) })} /></label>
        </div>`)}
        <div class="row">
          <button class="btn small" onClick=${() => setForm({ ...form, species: [...form.species, { s: cols[0] || "", mmol: "1", vol: "0" }] })}>Add species to this event</button>
          ${form.species.length > 1 && html`<button class="btn small ghost" onClick=${() => setForm({ ...form, species: form.species.slice(0, -1) })}>Remove last</button>`}
        </div>
        <button class="btn primary" onClick=${addManual}>Add event</button>
      </div></div>
    </div>
    ${err && html`<div class="note bad">${err}</div>`}
    <div class="small muted">Each event dilutes every species by reactor/(reactor + added) volume and adds mmol/(new volume) of the species added. When several species go in together, the GUI books the whole added volume on the first one.</div>
  <//>`;
}

// ---- Model tab ----------------------------------------------------------------

function SbView({ text }) {
  const lines = text.split("\n");
  return html`<pre class="sb" aria-label="Antimony model">${lines.map((l, i) => html`<span key=${i} class=${/^(at\(|event_|rct_vol|add_vol|new_vol|ratio|\S+_added_mmol_)/.test(l) || /^\t\S+=/.test(l) ? "ev" : l.startsWith("$") ? "fx" : ""}>${l}${i < lines.length - 1 ? "\n" : ""}</span>`)}</pre>`;
}

function MechanismsPanel({ S, act, run }) {
  const mechs = sortedMechs(S);
  const [sel, setSel] = useState(null);
  const current = mechs.find((m) => m.name === sel) || mechs[0];
  const ras = reAddsOf(S);
  const copy = async (text) => { try { await navigator.clipboard.writeText(text); act.toast("Copied the Antimony model"); } catch { act.toast("Copy isn't available here; select the text instead.", "bad"); } };
  return html`<section class="panel">
    <div class="panel-h"><h2>Mechanisms</h2><span class="hint">all of these are fitted, in this order</span></div>
    <div class="panel-b">
      ${!mechs.length && html`<div class="note">No mechanisms yet. Write the reactions on the Data tab and press “Add mechanism”.</div>`}
      <div class="list" role="listbox" aria-label="Mechanisms">
        ${mechs.map((m) => {
          const fit = S.fits[m.name];
          const stale = fit && fit.fingerprint && fit.fingerprint !== fingerprint(S, m);
          const r = run && run.mechs[m.name];
          return html`<div class="item" key=${m.name} role="option" aria-selected=${current && current.name === m.name} onClick=${() => setSel(m.name)}>
            <div class="grow"><span class="name">${m.name}</span><span class="meta">${plural(m.m_steps.length, "step")} · fits ${m.k_to_fit.length ? m.k_to_fit.join(", ") : "nothing"}</span></div>
            ${r && !r.done ? html`<span class="pill run">${r.runsDone}/${r.runs} runs</span>`
              : fit ? html`<span class=${"pill " + (stale ? "warn" : "good")} title=${stale ? "Data, additions or settings changed since this fit" : "Best RSS"}>${stale ? "inputs changed · " : ""}RSS ${fmt(fit.rows[0]?.RSS, 4)}</span>` : html`<span class="pill">not fitted</span>`}
          </div>`;
        })}
      </div>
      ${current && html`<div class="row">
        <button class="btn small" onClick=${() => act.editMechanism(current.name)}>Edit in Reactions</button>
        <button class="btn small" onClick=${() => act.showJson(current)}>View model.json</button>
        <button class="btn small" onClick=${() => copy(E.buildSbString(current, ras))}>Copy model</button>
        <span class="spacer"></span>
        <button class="btn small danger" disabled=${!!run} onClick=${() => act.confirm(`Delete mechanism “${current.name}” and its fit results?`, "Delete", () => act.deleteMechanism(current.name))}>Delete</button>
      </div>`}
      ${current && html`<div class="field"><span>Antimony model of “${current.name}” (what COPASI receives)</span><${SbView} text=${E.buildSbString(current, ras)} /></div>`}
    </div>
  </section>`;
}

function FitPanel({ S, act, run }) {
  const st = S.settings;
  const set = (k, v) => act.set({ settings: { ...st, [k]: v } });
  const method = methodOf(st);
  const setOption = (name, v) => act.set({ settings: { ...st, mp: { ...st.mp, [method.id]: { ...(st.mp[method.id] || {}), [name]: v } } } });
  const candidates = [...new Set(S.files.flatMap((f) => f.table.columns.filter((c) => c !== "time" && !isEventCol(c))))];
  const toMatch = toMatchOf(S);
  const { s, errs } = parseSettings(st);
  const mechs = sortedMechs(S);
  const runsPer = errs.length ? 0 : s.copies * s.peNumber;
  const evalsPer = errs.length ? null : evaluationsPerRun(method, s.params);
  const num = (k, label, help) => html`<label class="field"><span>${label}</span><input id=${"st-" + k} class=${"input mono"} inputmode="decimal" value=${st[k]} onInput=${(e) => set(k, e.target.value)} />${help && html`<span class="small muted" style=${{ fontWeight: 400 }}>${help}</span>`}</label>`;
  const option = (name) => {
    const changed = st.mp[method.id] && st.mp[method.id][name] !== undefined && Number(st.mp[method.id][name]) !== paramDefault(method, name);
    return html`<label class="field" key=${method.id + name}><span>${name}${changed ? html` <span class="muted" style=${{ fontWeight: 400 }}>(default ${paramDefault(method, name)})</span>` : ""}</span>
      <input id=${"opt-" + name.replace(/[^A-Za-z0-9]+/g, "-")} class="input mono" inputmode="decimal" value=${optionText(st, method, name)} onInput=${(e) => setOption(name, e.target.value)} /></label>`;
  };
  const groups = ["Global", "Local", "No optimization"];
  return html`<section class="panel">
    <div class="panel-h"><h2>Fit</h2><span class="hint">COPASI's optimizers, run in your browser</span></div>
    <div class="panel-b">
      <div class="field"><span>Training files</span>
        <div class="chips">${sortedFiles(S).map((f) => html`<${Chip} key=${f.id} label=${f.name} on=${!S.trainOff.includes(f.id)} onToggle=${() => act.set({ trainOff: S.trainOff.includes(f.id) ? S.trainOff.filter((x) => x !== f.id) : [...S.trainOff, f.id] })} />`)}</div>
      </div>
      <div class="field"><span>Species COPASI uses</span>
        <div class="chips">${candidates.map((c) => html`<${Chip} key=${c} label=${c} on=${toMatch.includes(c)} onToggle=${() => act.set({ toMatch: toMatch.includes(c) ? toMatch.filter((x) => x !== c) : [...toMatch, c] })} />`)}</div>
        <span class="small muted" style=${{ fontWeight: 400 }}>Fitted over all time points. The other columns only set the starting amounts (first row).</span>
      </div>
      <label class="field"><span>Method</span>
        <select id="st-method" class="input" value=${method.id} onChange=${(e) => set("method", e.target.value)}>
          ${groups.map((g) => html`<optgroup label=${g === "Global" ? "Global (population / stochastic)" : g === "Local" ? "Local (from the start values)" : g}>${METHODS.filter((m) => m.group === g).map((m) => html`<option value=${m.id}>${m.name}</option>`)}</optgroup>`)}
        </select>
        <span class="small muted" style=${{ fontWeight: 400 }}>${method.group === "Local" ? (st.randomizeStart ? "A local method: each run starts from random start values, so the runs together act as a multistart." : "A local method: every run starts from the same start values, so the runs give the same result.") : method.group === "No optimization" ? "Evaluates the objective at the start values only." : "A global method: each run explores the whole range between the bounds."}</span>
      </label>
      ${method.params.length > 0 && html`<div class="grid2">${method.params.map(option)}</div>`}
      <details>
        <summary>Full COPASI settings</summary>
        <div class="panel-b" style=${{ padding: "10px 0 0" }}>
          ${method.extra.length > 0 && html`<div class="eyebrow">Other ${method.name} options</div><div class="grid2">${method.extra.map(option)}</div>`}
          <div class="eyebrow">Parameter estimation</div>
          <div class="grid2">
            ${num("copies", "Copies (copy_number)")}${num("peNumber", "Runs per copy (pe_number)")}
            ${num("lower", "Lower bound")}${num("upper", "Upper bound")}
            ${num("startValue", "Start value")}${num("seed", "Random seed", "empty = new each time")}
          </div>
          <label class="check"><input id="st-rand" type="checkbox" checked=${st.randomizeStart} onChange=${(e) => set("randomizeStart", e.target.checked)} /> Randomize start values</label>
          <div class="small muted">method ${method.id} · weight_method mean_squared · quantity_type concentration. Each mechanism is fitted ${runsPer || "–"} times independently; every row COPASI reports (each improvement) goes into the results table, best first (k_result.csv).</div>
          <button class="btn small" onClick=${() => act.set({ settings: { ...DEFAULT_SETTINGS, method: st.method } })}>Reset to defaults</button>
        </div>
      </details>
      ${errs.length > 0 && html`<div class="note bad">${errs.map((e) => html`<div>${e[0].toUpperCase() + e.slice(1)}.</div>`)}</div>`}
      ${!run ? html`<button class="btn primary big" disabled=${!mechs.length || !S.files.length || errs.length > 0} onClick=${act.runFits}>Run evaluation</button>
        <div class="small muted">${mechs.length ? `${method.name}: ${plural(mechs.length, "mechanism")} × ${runsPer} runs${evalsPer ? ` × ${evalsPer.toLocaleString()} simulations each` : ""}` : "Add a mechanism first."}</div>`
      : html`<${RunProgress} run=${run} onCancel=${act.cancelRun} />`}
    </div>
  </section>`;
}

function RunProgress({ run, onCancel }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(t); }, []);
  const total = Object.values(run.mechs).reduce((a, m) => a + m.runs, 0);
  const done = Object.values(run.mechs).reduce((a, m) => a + m.runsDone + Object.values(m.partial).reduce((x, y) => x + y, 0), 0);
  return html`<div class="field" aria-live="polite">
    <div class="row"><b>Fitting…</b><span class="muted small">${duration((now - run.started) / 1000)} · ${run.threads ? `${plural(run.threads, "thread")}` : "starting workers"}</span><span class="spacer"></span><button class="btn small danger" onClick=${onCancel}>Cancel</button></div>
    <div class="bar"><i style=${{ width: `${(100 * done / Math.max(1, total)).toFixed(1)}%` }}></i></div>
    ${Object.entries(run.mechs).map(([name, m]) => html`<div class="row small" key=${name}>
      <span style=${{ minWidth: "110px", fontWeight: 500 }}>${name}</span>
      <span class="muted">${m.runsDone}/${m.runs} runs</span><span class="spacer"></span>
      <span class="mono">${Number.isFinite(m.best) ? `best RSS ${fmt(m.best, 4)}` : m.done ? "" : "…"}</span>
    </div>`)}
  </div>`;
}

// ---- Results tab --------------------------------------------------------------

function useResults(S) {
  const deps = S ? [S.files, S.additions, S.mechanisms, S.fits, S.results.file, S.results.statOff.join(), S.results.sigma] : [0, 0, 0, 0, 0, 0, 0];
  return useMemo(() => {
    if (!S) return null;
    const fitted = sortedMechs(S).filter((m) => S.fits[m.name] && S.fits[m.name].rows.length);
    const file = S.files.find((f) => f.id === S.results.file) || sortedFiles(S)[0];
    const sigma = Number(S.results.sigma);
    if (!file || !fitted.length) return null;
    const curves = {};
    for (const m of fitted) curves[m.name] = simulateFile(S, m, file, S.fits[m.name]);
    // statistics (utils/statistics.py), every model on the selected file
    const selection = dataSpecies(file.table).filter((s) => !S.results.statOff.includes(s));
    const yData = Object.fromEntries(file.table.columns.map((c) => [c, Array.from(file.table.data[c])]));
    const errors = {}, missing = {};
    if (selection.length && Number.isFinite(sigma)) {
      for (const m of fitted) {
        const yModel = Object.fromEntries(Object.entries(curves[m.name].atData).filter(([c]) => c !== "time" && !c.startsWith("cat")));
        const res = E.getMetrics(yData, yModel, m.k_to_fit.length, sigma, selection);
        if (res) errors[m.name] = res; else missing[m.name] = selection.filter((s) => !(s in yModel));
      }
    }
    let ftests = null;
    const base = fitted.find((m) => m.name === "base");
    if (base && selection.length) {
      ftests = {};
      const F = {}, P = {};
      for (const m of fitted) {
        if (m.name === "base") continue;
        const ok = selection.every((s) => s in curves.base.atData && s in curves[m.name].atData);
        if (!ok) continue;
        const r = E.fTest(yData, curves.base.atData, curves[m.name].atData, base.k_to_fit.length, m.k_to_fit.length, selection);
        F[m.name] = r.F; P[`p_${m.name}`] = r.p;
      }
      ftests = { ...F, ...P };
    }
    return { file, curves, errors, missing, ftests, selection, fitted };
  }, deps);
}

function ResultsTab({ S, act, tick, R }) {
  const fitted = sortedMechs(S).filter((m) => S.fits[m.name] && S.fits[m.name].rows.length);
  if (!fitted.length) return html`<section class="panel"><div class="plot-empty"><div><p>No fitted mechanisms yet.</p><button class="btn primary" onClick=${() => act.tab("model")}>Go to the Model tab</button></div></div></section>`;
  if (!R || !R.curves[(fitted.find((m) => m.name === S.results.model) || fitted[0]).name]) return html`<section class="panel"><div class="plot-empty">Load a time course to compare the models with.</div></section>`;
  return html`<${ResultsView} S=${S} act=${act} tick=${tick} R=${R} fitted=${fitted} />`;
}

function ResultsView({ S, act, tick, R, fitted }) {
  const t = useMemo(() => tokens(), [tick]);
  const [showRows, setShowRows] = useState(25);
  const model = fitted.find((m) => m.name === S.results.model) || fitted[0];
  const fit = S.fits[model.name];
  const file = R.file;
  const curve = R.curves[model.name];
  const color = speciesColors(S, t);
  const species = plotSpecies(file.table);
  const shown = species.filter((s) => !S.results.plotOff.includes(s));
  const pctRaw = Number(S.results.errorPct);
  const pct = Number.isFinite(pctRaw) ? Math.round(pctRaw / 100 * 1000) / 1000 : 0;
  const totalErr = shown.reduce((a, s) => a + (s in curve.atData ? file.table.data[s].reduce((x, v, i) => (Number.isNaN(v) || Number.isNaN(curve.atData[s][i]) ? x : x + Math.abs(v - curve.atData[s][i])), 0) : NaN), 0);
  const stale = fit.fingerprint && fit.fingerprint !== fingerprint(S, model);
  const traces = useMemo(() => {
    const x = Array.from(file.table.data.time);
    const out = [];
    for (const s of shown) {
      const y = Array.from(file.table.data[s]).map((v) => (Number.isNaN(v) ? null : v));
      const c = color(s);
      if (pct) {
        out.push({ type: "scatter", mode: "lines", x, y: y.map((v) => (v === null ? null : v + v * pct)), line: { width: 0 }, hoverinfo: "skip", showlegend: false, connectgaps: true });
        out.push({ type: "scatter", mode: "lines", x, y: y.map((v) => (v === null ? null : v - v * pct)), line: { width: 0 }, fill: "tonexty", fillcolor: rgba(c, 0.14), hoverinfo: "skip", showlegend: false, connectgaps: true, name: `${s} ±${(pct * 100).toFixed(1)}%` });
      }
      out.push({ type: "scatter", mode: "markers", name: s, x, y, marker: { size: 8, color: c, line: { color: t.surface, width: 1.5 } }, hovertemplate: `${s} data<br>t = %{x}<br>%{y:.6g}<extra></extra>`, legendgroup: s });
      if (curve.dense && s in curve.dense) out.push({ type: "scatter", mode: "lines", name: `${s} model`, x: curve.dense.time, y: curve.dense[s], line: { color: c, width: 2 }, hovertemplate: `${s} model<br>t = %{x:.4g}<br>%{y:.6g}<extra></extra>`, legendgroup: s });
    }
    return out;
  }, [curve, shown.join(), pct, t]);
  const layout = useMemo(() => baseLayout(t, { uirevision: file.id + model.name }), [t, file.id, model.name]);
  const pdict = Object.fromEntries(Object.entries(model.k_dict).map(([k, v]) => [k, { fixed: v.includes("$"), value: fit.rows[0].k[k] ?? Number(v.replace("$", "")) }]));
  const ftKeys = R.ftests ? Object.keys(R.ftests).filter((k) => !k.startsWith("p_")) : [];
  const metricRows = [["sse", "SSE"], ["r2", "R²"], ["r2_adj", "adj. R²"], ["chi2", "χ²"], ["red_chi2", "reduced χ²"], ["bic", "BIC"], ["ll", "log-likelihood"]];
  const keys = fit.keys || Object.keys(fit.rows[0].k);
  return html`<div class="bench results">
    <div class="col">
      <section class="panel">
        <div class="panel-h"><h2>Model</h2></div>
        <div class="panel-b">
          <div class="list" role="listbox" aria-label="Fitted mechanisms">${fitted.map((m) => html`<div class="item" key=${m.name} role="option" aria-selected=${m.name === model.name} onClick=${() => act.setResults({ model: m.name })}>
            <div class="grow"><span class="name">${m.name}</span><span class="meta">RSS ${fmt(S.fits[m.name].rows[0].RSS, 4)} · ${plural(m.k_to_fit.length, "parameter")}</span></div>
          </div>`)}</div>
        </div>
      </section>
      <section class="panel">
        <div class="panel-h"><h2>Time course</h2></div>
        <div class="panel-b"><div class="list" role="listbox" aria-label="Time course for results">${sortedFiles(S).map((f) => html`<div class="item" key=${f.id} role="option" aria-selected=${f.id === file.id} onClick=${() => act.setResults({ file: f.id })}><div class="grow"><span class="name">${f.name}</span></div></div>`)}</div></div>
      </section>
      <section class="panel">
        <div class="panel-h"><h2>Fitted constants</h2><span class="hint">best of ${fit.rows.length} results</span></div>
        <div class="panel-b">
          <div class="kgrid">${Object.entries(pdict).map(([k, p]) => html`<div class="kcell" key=${k}><span class="kn"><span>${k}</span>${p.fixed ? html`<span class="pill">fixed</span>` : ""}</span><span class="kv">${fmt(p.value)}</span></div>`)}</div>
          ${stale && html`<div class="note warn">The data, additions or species changed after this fit. Run the evaluation again to refresh it.</div>`}
          ${fit.settings && html`<div class="small muted">${methodSummary(fit.settings)}${fit.seconds ? `, ${duration(fit.seconds)}` : ""}</div>`}
        </div>
      </section>
    </div>
    <div class="col">
      <section class="panel">
        <div class="panel-h"><h2>${model.name} on ${file.name}</h2><span class="hint num">error: ${Number.isFinite(totalErr) ? Number(totalErr.toFixed(6)) : "nan"}</span></div>
        <div class="panel-b">
          <div class="row" style=${{ alignItems: "end" }}>
            <div class="chips" style=${{ flex: "1 1 240px" }}>${species.map((s) => html`<${Chip} key=${s} label=${s} color=${color(s)} on=${!S.results.plotOff.includes(s)} onToggle=${() => act.setResults({ plotOff: S.results.plotOff.includes(s) ? S.results.plotOff.filter((x) => x !== s) : [...S.results.plotOff, s] })} />`)}</div>
            <label class="field" style=${{ width: "100px" }}><span>Error %</span><input id="res-err" class="input mono" inputmode="decimal" value=${S.results.errorPct} onInput=${(e) => act.setResults({ errorPct: e.target.value })} /></label>
          </div>
          ${curve.failed && html`<div class="note bad">The simulation of ${model.name} failed for these constants (the solver could not integrate it).</div>`}
          <${Plot} traces=${traces} layout=${layout} label=${`${model.name} fitted to ${file.name}`} />
          <div class="small muted">Dots: data · line: model at the best constants · band: ±${(pct * 100).toFixed(1)}% of the data</div>
        </div>
      </section>
      <section class="panel">
        <div class="panel-h"><h2>Statistics</h2><span class="hint">on ${file.name}, all fitted models</span><span class="spacer"></span>
          <label class="field" style=${{ width: "120px" }}><span>Normalized σ</span><input id="res-sigma" class="input mono" inputmode="decimal" value=${S.results.sigma} onInput=${(e) => act.setResults({ sigma: e.target.value })} /></label></div>
        <div class="panel-b">
          <div class="chips">${dataSpecies(file.table).map((s) => html`<${Chip} key=${s} label=${s} color=${color(s)} on=${!S.results.statOff.includes(s)} onToggle=${() => act.setResults({ statOff: S.results.statOff.includes(s) ? S.results.statOff.filter((x) => x !== s) : [...S.results.statOff, s] })} />`)}</div>
          ${!R.selection.length ? html`<div class="note">Pick at least one species.</div>` : html`
          <div class="tablewrap"><table>
            <thead><tr><th>Model</th>${metricRows.map(([, l]) => html`<th class="n">${l}</th>`)}</tr></thead>
            <tbody>${R.fitted.map((m) => R.errors[m.name] ? html`<tr key=${m.name} class=${m.name === model.name ? "best" : ""}><td>${m.name}</td>${metricRows.map(([k]) => html`<td class="n" title=${R.selection.map((s) => `${s}: ${E.formatSci(R.errors[m.name][k][s])}`).join("\n")}>${E.formatSci(R.errors[m.name][k].total)}</td>`)}</tr>`
              : html`<tr key=${m.name}><td>${m.name}</td><td colspan=${metricRows.length} class="muted">${R.missing[m.name] ? `has no ${R.missing[m.name].join(", ")}` : "σ must be a number"}</td></tr>`)}</tbody>
          </table></div>
          <details><summary>Per species</summary>
            <div class="tablewrap" style=${{ marginTop: "8px" }}><table>
              <thead><tr><th>Model</th><th>Species</th>${metricRows.map(([, l]) => html`<th class="n">${l}</th>`)}</tr></thead>
              <tbody>${R.fitted.filter((m) => R.errors[m.name]).flatMap((m) => R.selection.map((s) => html`<tr key=${m.name + s}><td>${m.name}</td><td>${s}</td>${metricRows.map(([k]) => html`<td class="n">${E.formatSci(R.errors[m.name][k][s])}</td>`)}</tr>`))}</tbody>
            </table></div>
          </details>
          <div class="small muted">Totals add up the species, as the desktop GUI does (so R² totals can exceed 1). Hover a total for the per-species values.</div>
          <div class="eyebrow">F-test against “base”</div>
          ${!R.fitted.some((m) => m.name === "base") ? html`<div class="note">Name a fitted mechanism “base” to compare the others with it.</div>`
            : !ftKeys.length ? html`<div class="note">Fit a second mechanism to compare it with base.</div>`
            : html`<div class="tablewrap"><table>
              <thead><tr><th>Model</th>${[...R.selection, "global"].map((s) => html`<th class="n">F ${s}</th><th class="n">p ${s}</th>`)}</tr></thead>
              <tbody>${ftKeys.map((m) => html`<tr key=${m}><td>${m}</td>${[...R.selection, "global"].map((s) => html`<td class="n">${E.formatSci(R.ftests[m][`F_${s}`])}</td><td class="n">${E.formatSci(R.ftests[`p_${m}`][`p_${s}`])}</td>`)}</tr>`)}</tbody>
            </table></div>
            <div class="small muted">F = ((SSE<sub>base</sub> − SSE<sub>model</sub>)/Δparameters) / (SSE<sub>model</sub>/(n − parameters)); a small p means the extra steps improve the fit more than chance would.</div>`}
          `}
        </div>
      </section>
      <section class="panel">
        <div class="panel-h"><h2>All fit results · ${model.name}</h2><span class="hint">every improvement of every run, best first</span><span class="spacer"></span>
          <button class="btn small" onClick=${() => act.save(`${model.name}_k_result.csv`, kResultCsv(model, fit))}>Download k_result.csv</button></div>
        <div class="panel-b">
          <div class="tablewrap" style=${{ maxHeight: "420px" }}><table>
            <thead><tr><th class="n">#</th>${keys.map((k) => html`<th class="n">${k}</th>`)}<th class="n">RSS</th></tr></thead>
            <tbody>${fit.rows.slice(0, showRows).map((r, i) => html`<tr key=${i} class=${i === 0 ? "best" : ""}><td class="n">${i}</td>${keys.map((k) => html`<td class="n">${fmt(r.k[k])}</td>`)}<td class="n">${fmt(r.RSS)}</td></tr>`)}</tbody>
          </table></div>
          ${fit.rows.length > showRows && html`<button class="btn small" onClick=${() => setShowRows(showRows + 100)}>Show more (${fit.rows.length - showRows} left)</button>`}
          <div class="row">
            <button class="btn small" onClick=${() => act.save(`${model.name}_data.csv`, curveCsv(curve))}>Model curve (${model.name}_data.csv)</button>
            <button class="btn small" disabled=${!Object.keys(R.errors).length} onClick=${() => act.save("errors.json", JSON.stringify(R.errors, null, 4))}>errors.json</button>
            <button class="btn small" disabled=${!R.ftests || !ftKeys.length} onClick=${() => act.save("F_tests.json", JSON.stringify(R.ftests, null, 4))}>F_tests.json</button>
          </div>
        </div>
      </section>
    </div>
  </div>`;
}

// ---------------------------------------------------------------- app

function App() {
  const [S, setSState] = useState(null);
  const Sref = useRef(null);
  const setS = (next) => { Sref.current = next; setSState(next); };
  const [tab, setTab] = useState(() => { const h = location.hash.slice(1); return ["data", "model", "results"].includes(h) ? h : "data"; });
  const [run, setRun] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState(null);
  const [staged, setStaged] = useState(null);
  const runRef = useRef(null);
  const tick = useThemeTick();
  const sessionIn = useRef(null);

  const toast = useCallback((text, kind = "") => {
    const id = Math.random();
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "bad" ? 7000 : 3500);
  }, []);

  // boot: restore the last session from this browser, else open the example
  useEffect(() => {
    (async () => {
      const saved = await IDB.get("session");
      if (saved) { try { setS(deserialize(saved)); return; } catch (e) { console.warn("could not restore session", e); } }
      setS(exampleSession());
    })();
    const onHash = () => { const h = location.hash.slice(1); if (["data", "model", "results"].includes(h)) setTab(h); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    if (!S) return;
    const t = setTimeout(() => IDB.set("session", serialize(S)), 800);
    return () => clearTimeout(t);
  }, [S]);

  const R = useResults(S);

  if (!S) return html`<div class="plot-empty">Loading…</div>`;

  const cur = () => Sref.current;
  const up = (fn) => { const next = { ...cur() }; fn(next); setS(next); };
  const goTab = (t) => { setTab(t); try { history.replaceState(null, "", "#" + t); } catch { location.hash = t; } };

  const act = {
    toast, tab: goTab,
    set: (patch) => up((n) => Object.assign(n, patch)),
    setEditor: (patch) => up((n) => { n.editor = { ...n.editor, ...patch }; }),
    setResults: (patch) => up((n) => { n.results = { ...n.results, ...patch }; }),
    confirm: (text, yes, onYes) => setModal({ kind: "confirm", text, yes, onYes }),
    save: (name, data) => saveFile(name, data, toast),
    async addFiles(list) {
      for (const file of list) {
        const ext = (file.name.split(".").pop() || "").toLowerCase();
        try {
          if (ext === "zip") { await act.loadSession(file); continue; }
          if (ext === "cdxml" || ext === "cdx") { toast(`${file.name}: ChemDraw files can't be read here yet. Type the reactions instead.`, "bad"); continue; }
          const text = await readText(file);
          if (ext === "json") { act.handleJson(text, file.name); continue; }
          if (ext !== "csv" && ext !== "txt") { toast(`${file.name}: use .csv or .txt time courses, .json or a session .zip.`, "bad"); continue; }
          const table = E.parseCsv(text, file.name);
          const cols = table.columns.filter((c) => !isEventCol(c));
          const data = {}; cols.forEach((c) => { data[c] = table.data[c]; });
          const clean = { columns: cols, nrows: table.nrows, data };
          let prev = cur();
          if (prev.example) prev = { ...newSession(), settings: prev.settings }; // the first own file replaces the example
          if (prev.files.some((f) => f.name === file.name)) { toast(`${file.name} is already loaded.`, "bad"); continue; }
          if (prev.files.length) {
            const ref = prev.files[0].table.columns;
            const same = ref.length === cols.length && cols.every((c) => ref.includes(c));
            if (!same) { toast(`${file.name} was not added: its columns (${cols.join(", ")}) differ from the loaded files (${ref.join(", ")}).`, "bad"); continue; }
          }
          const f = { id: uid(), name: file.name, table: clean, deleted: [] };
          setS({ ...prev, example: false, files: [...prev.files, f], selectedFile: prev.selectedFile || f.id, results: { ...prev.results, file: prev.results.file || f.id } });
          if (table.warnings.length) toast(`${file.name}: some cells are not numbers and were left empty (${table.warnings[0]}).`, "bad");
          else toast(`Loaded ${file.name}`);
        } catch (e) { toast(`${file.name}: ${e.message}`, "bad"); }
      }
    },
    handleJson(text, name) {
      let o;
      try { o = E.parsePyJson(text); } catch (e) { toast(`${name} is not valid JSON (${e.message}).`, "bad"); return; }
      if (o && !Array.isArray(o) && (o.m_steps || o.m_steps_user)) {
        const plain = JSON.parse(JSON.stringify(o));
        let m;
        try { m = E.completeMechanism(plain); } catch (e) { toast(`${name}: ${e.message}`, "bad"); return; }
        const rows = m.m_steps.map((r, i) => ({ rct: r, k: m.k_dict[`k${i + 1}`] ?? "", kN: m.k_dict[`kN${i + 1}`] ?? "" }));
        while (rows.length < 5) rows.push({ rct: "", k: "", kN: "" });
        up((n) => { n.editor = { name: m.name, rows }; });
        act.putMechanism(m);
        return;
      }
      if (Array.isArray(o)) {
        const S = cur();
        if (!S.files.length) { toast("Load the time course first, then add its re-additions.", "bad"); return; }
        try { E.prepareReAdditions(o, 0); } catch (e) { toast(`${name}: ${e.message}`, "bad"); return; }
        setStaged({ name, events: o });
        setModal({ kind: "additions", fileId: S.selectedFile || S.files[0].id });
        return;
      }
      toast(`${name} is neither a model.json nor a list of re-additions.`, "bad");
    },
    removeFile: (id) => up((n) => {
      n.files = n.files.filter((f) => f.id !== id);
      n.additions = n.additions.filter((a) => a.fileId !== id);
      n.trainOff = n.trainOff.filter((x) => x !== id);
      if (n.selectedFile === id) n.selectedFile = n.files[0]?.id || null;
      if (n.results.file === id) n.results = { ...n.results, file: n.files[0]?.id || null };
    }),
    openAdditions: (fileId) => setModal({ kind: "additions", fileId }),
    clearStaged: () => setStaged(null),
    addEvents: (fileId, events) => up((n) => {
      const ex = n.additions.find((a) => a.fileId === fileId);
      n.additions = ex ? n.additions.map((a) => (a.fileId === fileId ? { ...a, events: [...a.events, ...events] } : a)) : [...n.additions, { fileId, events: [...events] }];
      toast(`Added ${plural(events.length, "addition event")}`);
    }),
    removeEvent: (fileId, i) => up((n) => {
      n.additions = n.additions.map((a) => (a.fileId === fileId ? { ...a, events: a.events.filter((_, j) => j !== i) } : a)).filter((a) => a.events.length);
    }),
    deletePoint: (fileId, col, row) => up((n) => {
      n.files = n.files.map((f) => {
        if (f.id !== fileId) return f;
        const c = Float64Array.from(f.table.data[col]);
        const value = c[row]; c[row] = NaN;
        return { ...f, table: { ...f.table, data: { ...f.table.data, [col]: c } }, deleted: [...f.deleted, { col, row, value }] };
      });
    }),
    undoDelete: (fileId) => up((n) => {
      n.files = n.files.map((f) => {
        if (f.id !== fileId || !f.deleted.length) return f;
        const d = f.deleted[f.deleted.length - 1];
        const c = Float64Array.from(f.table.data[d.col]); c[d.row] = d.value;
        return { ...f, table: { ...f.table, data: { ...f.table.data, [d.col]: c } }, deleted: f.deleted.slice(0, -1) };
      });
    }),
    addMechanism() {
      const S = cur();
      const name = S.editor.name.trim();
      if (!name) { toast("Give the mechanism a name first.", "bad"); document.getElementById("mech-name")?.focus(); return; }
      if (/[\\/:*?"<>|]/.test(name)) { toast('Mechanism names can\'t contain \\ / : * ? " < > |', "bad"); return; }
      const rows = S.editor.rows.filter((r) => r.rct.trim());
      const badRx = rows.find((r) => !E.parseReaction(r.rct).ok);
      if (badRx) { toast(`“${badRx.rct}” is not a reaction: ${E.parseReaction(badRx.rct).error}.`, "bad"); return; }
      for (const r of rows) for (const key of ["k", "kN"]) if (r[key].trim() && !E.normalizeK(r[key]).ok) { toast(`${key} of “${r.rct}” must be a number (or $number to fix it).`, "bad"); return; }
      let m;
      try { m = E.makeMechanism(name, rows); } catch (e) { toast(e.message, "bad"); return; }
      act.putMechanism(m);
    },
    putMechanism(m) {
      const exists = cur().mechanisms.some((x) => x.name === m.name);
      up((n) => {
        n.mechanisms = [...n.mechanisms.filter((x) => x.name !== m.name), m];
        if (n.fits[m.name]) { n.fits = { ...n.fits }; delete n.fits[m.name]; }
        n.example = false;
      });
      toast(exists ? `Replaced mechanism “${m.name}”` : `Added mechanism “${m.name}” (${plural(m.k_to_fit.length, "constant")} to fit)`);
    },
    editMechanism(name) {
      const m = cur().mechanisms.find((x) => x.name === name);
      if (!m) return;
      const rows = m.m_steps.map((r, i) => ({ rct: r, k: m.k_dict[`k${i + 1}`] === "0" ? "" : m.k_dict[`k${i + 1}`] ?? "", kN: m.k_dict[`kN${i + 1}`] === "0" ? "" : m.k_dict[`kN${i + 1}`] ?? "" }));
      while (rows.length < 5) rows.push({ rct: "", k: "", kN: "" });
      up((n) => { n.editor = { name: m.name, rows }; });
      goTab("data");
      setTimeout(() => document.getElementById("rct0")?.focus(), 50);
    },
    deleteMechanism: (name) => up((n) => {
      n.mechanisms = n.mechanisms.filter((m) => m.name !== name);
      n.fits = { ...n.fits }; delete n.fits[name];
    }),
    showJson: (m) => setModal({ kind: "json", m }),
    async runFits() {
      const S = cur();
      const { s, errs } = parseSettings(S.settings);
      if (errs.length) { toast(errs[0], "bad"); return; }
      const files = trainingFiles(S);
      if (!files.length) { toast("Pick at least one training file.", "bad"); return; }
      const toMatch = toMatchOf(S);
      if (!toMatch.length) { toast("Pick at least one species for COPASI to fit.", "bad"); return; }
      const ras = reAddsOf(S);
      const mechs = sortedMechs(S);
      const jobs = [], meta = {};
      const baseSeed = s.seed ?? Math.floor(Math.random() * 2 ** 31);
      const warnings = new Set();
      const method = s.method;
      mechs.forEach((m, mi) => {
        const prob = E.buildProblem(m, files.map((f) => ({ name: f.name, table: f.table })), ras, toMatch);
        const nRes = E.countResiduals(prob);
        prob.warnings.forEach((w) => warnings.add(w));
        const missing = toMatch.filter((x) => !prob.species.includes(x));
        if (missing.length) warnings.add(`“${m.name}” has no ${missing.join(", ")}; those columns are left out of its fit`);
        if (!prob.fit.length) { warnings.add(`“${m.name}” has no constants to fit (all fixed with $)`); }
        const nv = prob.fit.length;
        const runs = s.copies * s.peNumber;
        meta[m.name] = { runs, runsDone: 0, best: Infinity, partial: {}, rows: [], keys: prob.fit, evals: 0, started: performance.now(), done: false, fingerprint: fingerprint(S, m) };
        for (let r = 0; r < runs; r++) {
          const seed = (baseSeed + r * 7919 + mi * 104729) >>> 0;
          jobs.push({
            id: `${m.name}\u0000${r}`, mech: m.name, problem: prob, problemKey: `${m.name}:${baseSeed}`, solver: { rtol: 1e-6, atol: 1e-12, maxSteps: 100000 },
            methodId: method.id, method: method.copasi, params: s.params, nResiduals: nRes,
            lower: Array(nv).fill(s.lower), upper: Array(nv).fill(s.upper), start: Array(nv).fill(s.startValue), randomizeStart: s.randomizeStart,
            seed, startSeed: (seed ^ 0x5bd1e995) >>> 0,
            ga: { generations: s.params["Number of Generations"], population: s.params["Population Size"], lower: Array(nv).fill(s.lower), upper: Array(nv).fill(s.upper), mutationVariance: s.params["Mutation Variance"], randomizeStart: s.randomizeStart, startValues: Array(nv).fill(s.startValue), stopAfterStalled: s.params["Stop after # Stalled Generations"] },
          });
        }
      });
      warnings.forEach((w) => toast(w[0].toUpperCase() + w.slice(1) + ".", "bad"));
      const state = { started: Date.now(), mechs: meta, threads: 0 };
      setRun({ ...state });
      const refresh = () => setRun((r) => (r ? { ...state, mechs: { ...state.mechs } } : r));
      let lastRefresh = 0;
      const throttled = () => { const now = Date.now(); if (now - lastRefresh > 200) { lastRefresh = now; refresh(); } };
      const finishMech = (name) => {
        const mm = meta[name];
        mm.done = true;
        const rows = mm.rows.sort((a, b) => a.RSS - b.RSS);
        const fit = { rows, keys: mm.keys, settings: { method: method.id, params: s.params, copies: s.copies, peNumber: s.peNumber, lower: s.lower, upper: s.upper, startValue: s.startValue, randomizeStart: s.randomizeStart, seed: baseSeed }, toMatch, fileNames: files.map((f) => f.name), evals: mm.evals, seconds: (performance.now() - mm.started) / 1000, finishedAt: new Date().toISOString(), fingerprint: mm.fingerprint };
        if (!rows.length) { toast(`No usable result for “${name}”: every simulation failed.`, "bad"); return; }
        const prev = cur();
        setS({ ...prev, example: false, fits: { ...prev.fits, [name]: fit }, results: { ...prev.results, model: prev.results.model && prev.fits[prev.results.model] ? prev.results.model : name } });
      };
      const handle = runJobs(jobs, {
        onStart: (threads) => { state.threads = threads; refresh(); },
        onProgress: (id, frac, best) => {
          const [name] = id.split("\u0000");
          const mm = meta[name];
          if (frac !== null && frac !== undefined && Number.isFinite(frac)) mm.partial[id] = Math.min(1, Math.max(0, frac));
          if (best < mm.best) mm.best = best;
          throttled();
        },
        onDone: (id, history, evals) => {
          const [name] = id.split("\u0000");
          const mm = meta[name];
          delete mm.partial[id];
          mm.runsDone++; mm.evals += evals;
          for (const h of history) {
            if (!Number.isFinite(h.objective)) continue;
            mm.rows.push({ k: Object.fromEntries(mm.keys.map((k, i) => [k, sig6(h.values[i])])), RSS: sig6(h.objective) });
            if (h.objective < mm.best) mm.best = h.objective;
          }
          if (mm.runsDone === mm.runs) finishMech(name);
          throttled();
        },
        onError: (id, message) => { toast(`A run failed: ${message}`, "bad"); const [name] = id.split("\u0000"); meta[name].runs--; if (meta[name].runsDone >= meta[name].runs && !meta[name].done) finishMech(name); },
      });
      runRef.current = handle;
      handle.finished.then((info) => {
        state.threads = info.threads || 0;
        runRef.current = null;
        setRun(null);
        if (info.mode === "cancelled" || handle.wasCancelled) return;
        const secs = (Date.now() - state.started) / 1000;
        toast(`Fitted ${plural(mechs.length, "mechanism")} in ${duration(secs)}${info.mode === "page" ? " (without background workers)" : ""}.`);
      });
    },
    cancelRun() {
      if (runRef.current) { runRef.current.wasCancelled = true; runRef.current.cancel(); }
      runRef.current = null;
      setRun(null);
      toast("Fitting cancelled. Mechanisms that had finished keep their results.");
    },
    async loadSession(file) {
      try {
        const next = await loadSessionZip(file);
        setS(next);
        goTab(Object.keys(next.fits).length ? "results" : "data");
        toast(`Opened ${file.name}: ${plural(next.files.length, "time course")}, ${plural(next.mechanisms.length, "mechanism")}`);
      } catch (e) { toast(`${file.name}: ${e.message}`, "bad"); }
    },
    async saveSession() {
      try {
        const S = cur();
        const info = R ? { curves: R.curves, errors: Object.keys(R.errors).length ? R.errors : null, ftests: R.ftests } : null;
        const { blob, name } = await buildSessionZip(S, info);
        await saveFile(name, blob, toast);
      } catch (e) { toast(`Could not build the session zip: ${e.message}`, "bad"); }
    },
    async saveOptimizerSource() {
      try { // copasi-wasm-src.txt bundles the files as "@@@FILE <path>" sections; hand them over as a zip
        const text = await (await fetch(new URL("./copasi-wasm-src.txt", import.meta.url))).text();
        const zip = new JSZip();
        for (const part of text.split(/^@@@FILE /m).slice(1)) {
          const nl = part.indexOf("\n");
          zip.file(`copasi-wasm/${part.slice(0, nl)}`, part.slice(nl + 1));
        }
        await saveFile("copasi-wasm-src.zip", await zip.generateAsync({ type: "blob", compression: "DEFLATE" }), toast);
      } catch (e) { toast(`Could not build the source archive: ${e.message}`, "bad"); }
    },
    newSession() {
      if (run) act.cancelRun();
      setS(newSession());
      goTab("data");
    },
  };

  const exampleBanner = S.example && html`<div class="banner" role="status">
    <span><b>Example session.</b> Simulated time courses (exp1 with two re-additions, exp2 without) and two mechanisms, already fitted, so you can look around. Your own files replace it.</span>
    <span class="spacer"></span>
    <button class="btn small" onClick=${() => act.newSession()}>Start empty</button>
  </div>`;

  return html`
    <header class="top"><div class="top-in">
      <div class="brand"><h1>RE-ADD Modeler</h1><span class="sub">kinetic fits with re-additions</span></div>
      <nav class="tabs" role="tablist" aria-label="Steps">
        ${[["data", "Data", 1], ["model", "Model", 2], ["results", "Results", 3]].map(([id, label, n]) => html`<button role="tab" class="tab" aria-selected=${tab === id} onClick=${() => goTab(id)}><span class="step">${n}</span>${label}</button>`)}
      </nav>
      <span class="spacer"></span>
      <div class="session-actions">
        <button class="btn ghost small" onClick=${() => act.confirm("Start an empty session? The current one is replaced (save it first if you need it).", "Start empty", act.newSession)}>New</button>
        <button class="btn small" onClick=${() => sessionIn.current.click()}>Open session</button>
        <button class="btn small" onClick=${act.saveSession} disabled=${!S.files.length && !S.mechanisms.length}>Save session</button>
        <button class="btn ghost small" onClick=${() => act.confirm("Replace the current session with the example?", "Open example", () => { setS(exampleSession()); goTab("results"); })}>Example</button>
        <input type="file" accept=".zip" hidden ref=${sessionIn} onChange=${(e) => { if (e.target.files[0]) act.loadSession(e.target.files[0]); e.target.value = ""; }} />
      </div>
    </div></header>
    <main>
      ${exampleBanner}
      ${tab === "data" && html`<div class="bench wide-left">
        <div class="col"><${FilesPanel} S=${S} act=${act} /><${ReactionEditor} S=${S} act=${act} /></div>
        <div class="col"><${DataPlot} S=${S} act=${act} tick=${tick} /></div>
      </div>`}
      ${tab === "model" && html`<div class="bench model">
        <div class="col"><${MechanismsPanel} S=${S} act=${act} run=${run} /></div>
        <div class="col"><${FitPanel} S=${S} act=${act} run=${run} /></div>
      </div>`}
      ${tab === "results" && html`<${ResultsTab} S=${S} act=${act} tick=${tick} R=${R} />`}
      <footer class="small muted" style=${{ marginTop: "24px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
        <span>Web version of the <a href="https://gitlab.com/heingroup/re_add_modeler">RE-ADD Modeler</a> desktop app by Finn Bork (MIT license). The optimization methods are COPASI 4.48's own source code (Artistic License 2.0; Praxis routines LGPL), compiled to run in your browser; the model is simulated by this page. Your files never leave your computer.</span>
        <a class="btn ghost small" href=${SOURCE_URL}>Source code on GitHub</a>
        <button class="btn ghost small" onClick=${act.saveOptimizerSource}>Download the optimizer source</button>
      </footer>
    </main>
    ${modal && modal.kind === "confirm" && html`<${Confirm} text=${modal.text} yes=${modal.yes} onYes=${modal.onYes} onClose=${() => setModal(null)} />`}
    ${modal && modal.kind === "additions" && html`<${AdditionsModal} S=${S} act=${act} fileId=${modal.fileId} staged=${staged} onClose=${() => { setModal(null); setStaged(null); }} />`}
    ${modal && modal.kind === "json" && html`<${Modal} title=${`model.json · ${modal.m.name}`} onClose=${() => setModal(null)}>
      <pre class="sb">${E.stringifyPy(modal.m)}</pre>
      <div class="row"><button class="btn" onClick=${() => act.save("model.json", E.stringifyPy(modal.m))}>Download model.json</button>
      <button class="btn" onClick=${() => act.save("sb_string.txt", E.buildSbString(modal.m, reAddsOf(S)))}>Download sb_string.txt</button></div>
    <//>`}
    <div class="toasts" aria-live="polite">${toasts.map((t) => html`<div class=${"toast " + t.kind} key=${t.id}>${t.text}</div>`)}</div>
  `;
}

render(html`<${App} />`, document.getElementById("app"));
