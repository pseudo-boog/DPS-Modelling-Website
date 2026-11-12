// RE-ADD Modeler - browser modelling engine.
//
// Re-implements what the desktop GUI does with okin + pycotools + COPASI:
//   * reaction parsing and the mechanism / k-value rules of the reaction editor
//   * the Antimony ("sb") string the GUI writes, including re-addition events
//   * the COPASI parameter-estimation problem pycotools sets up (experiments,
//     initial values from the first data row, "mean squared" weights normalised
//     per experiment) and its objective
//   * a stiff ODE solver (Rodas4 Rosenbrock method) with re-addition events
//   * COPASI's genetic algorithm (population/generations/tournament/mutation)
//   * the statistics and F-tests of the Results tab
// Plain ES module with no dependencies: used by the page, by worker.js and by Node tests.

// ---------------------------------------------------------------- Python-style text

/** Python repr() of a float (shortest round-trip digits, same switch to exponent form). */
export function pyFloat(x) {
  if (Number.isNaN(x)) return "nan";
  if (x === Infinity) return "inf";
  if (x === -Infinity) return "-inf";
  if (x === 0) return Object.is(x, -0) ? "-0.0" : "0.0";
  let [mant, ex] = x.toExponential().split("e");
  const e = parseInt(ex, 10);
  let sign = "";
  if (mant[0] === "-") { sign = "-"; mant = mant.slice(1); }
  const digits = mant.replace(".", "");
  if (e >= -4 && e < 16) {
    if (e >= 0) {
      const intPart = digits.slice(0, e + 1).padEnd(e + 1, "0");
      const frac = digits.slice(e + 1);
      return sign + intPart + "." + (frac || "0");
    }
    return sign + "0." + "0".repeat(-e - 1) + digits;
  }
  const m = digits.length > 1 ? digits[0] + "." + digits.slice(1) : digits;
  return sign + m + "e" + (e < 0 ? "-" : "+") + String(Math.abs(e)).padStart(2, "0");
}

/** A JSON number that remembers whether Python would load it as int or float. */
export class PyNum {
  constructor(raw) {
    this.v = Number(raw);
    this.isFloat = /[.eE]/.test(raw);
  }
  valueOf() { return this.v; }
  toString() { return this.isFloat ? pyFloat(this.v) : String(Math.trunc(this.v)); }
  toJSON() { return this.v; }
}
export const pyFloatNum = (x) => { const p = new PyNum("0.0"); p.v = x; p.isFloat = true; return p; };

/** Python str() of a value loaded with json.load (or produced by float()). */
export function pyStr(v) {
  if (v instanceof PyNum) return v.toString();
  if (typeof v === "number") return Number.isInteger(v) && !Object.is(v, -0) ? String(v) : pyFloat(v);
  if (v === true) return "True";
  if (v === false) return "False";
  if (v === null || v === undefined) return "None";
  return String(v);
}

/** JSON.parse that keeps Python's int/float distinction (numbers become PyNum). */
export function parsePyJson(text) {
  let i = 0;
  const s = text.replace(/^﻿/, "");
  const ws = () => { while (i < s.length && " \t\n\r".includes(s[i])) i++; };
  const fail = (msg) => { throw new SyntaxError(`${msg} at position ${i}`); };
  function value() {
    ws();
    const c = s[i];
    if (c === "{") {
      i++; const o = {}; ws();
      if (s[i] === "}") { i++; return o; }
      for (;;) {
        ws(); if (s[i] !== '"') fail("expected key");
        const k = str(); ws(); if (s[i] !== ":") fail("expected ':'"); i++;
        o[k] = value(); ws();
        if (s[i] === ",") { i++; continue; }
        if (s[i] === "}") { i++; return o; }
        fail("expected ',' or '}'");
      }
    }
    if (c === "[") {
      i++; const a = []; ws();
      if (s[i] === "]") { i++; return a; }
      for (;;) {
        a.push(value()); ws();
        if (s[i] === ",") { i++; continue; }
        if (s[i] === "]") { i++; return a; }
        fail("expected ',' or ']'");
      }
    }
    if (c === '"') return str();
    if (s.startsWith("true", i)) { i += 4; return true; }
    if (s.startsWith("false", i)) { i += 5; return false; }
    if (s.startsWith("null", i)) { i += 4; return null; }
    if (s.startsWith("NaN", i)) { i += 3; const p = new PyNum("0.0"); p.v = NaN; return p; }
    const m = /^-?(\d+)(\.\d+)?([eE][+-]?\d+)?/.exec(s.slice(i, i + 64));
    if (!m) fail("unexpected character");
    i += m[0].length;
    return new PyNum(m[0]);
  }
  function str() {
    let j = i + 1, out = "";
    while (j < s.length && s[j] !== '"') {
      if (s[j] === "\\") {
        const e = s[j + 1];
        if (e === "u") { out += String.fromCharCode(parseInt(s.slice(j + 2, j + 6), 16)); j += 6; continue; }
        out += { n: "\n", t: "\t", r: "\r", b: "\b", f: "\f", '"': '"', "\\": "\\", "/": "/" }[e] ?? e;
        j += 2; continue;
      }
      out += s[j++];
    }
    if (j >= s.length) fail("unterminated string");
    i = j + 1;
    return out;
  }
  const v = value(); ws();
  if (i < s.length) fail("trailing characters");
  return v;
}

/** JSON.stringify that writes PyNum floats the way Python's json.dump does. */
export function stringifyPy(value, indent = 4) {
  const pad = (n) => " ".repeat(n * indent);
  function go(v, lvl) {
    if (v instanceof PyNum) return v.isFloat ? jsonFloat(v.v) : String(Math.trunc(v.v));
    if (typeof v === "number") return Number.isInteger(v) ? String(v) : jsonFloat(v);
    if (v === null || v === undefined) return "null";
    if (typeof v === "boolean") return String(v);
    if (typeof v === "string") return JSON.stringify(v);
    if (Array.isArray(v)) {
      if (!v.length) return "[]";
      return "[\n" + v.map((x) => pad(lvl + 1) + go(x, lvl + 1)).join(",\n") + "\n" + pad(lvl) + "]";
    }
    const keys = Object.keys(v);
    if (!keys.length) return "{}";
    return "{\n" + keys.map((k) => pad(lvl + 1) + JSON.stringify(k) + ": " + go(v[k], lvl + 1)).join(",\n") + "\n" + pad(lvl) + "}";
  }
  return go(value, 0);
}
function jsonFloat(x) {
  if (Number.isNaN(x)) return "NaN";
  if (!Number.isFinite(x)) return x > 0 ? "Infinity" : "-Infinity";
  return pyFloat(x);
}

// ---------------------------------------------------------------- CSV (pandas.read_csv subset)

function splitCsvLine(line) {
  const out = [];
  let cur = "", q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

const NA_STRINGS = new Set(["", "nan", "NaN", "NAN", "NA", "N/A", "n/a", "null", "NULL", "None", "#N/A", "-nan", "-NaN"]);

/**
 * Parse a CSV the way the GUI reads it (pandas.read_csv + dropping "Unnamed" columns).
 * Returns {columns: [...], nrows, data: {col: Float64Array}}.
 */
export function parseCsv(text, fileName = "file.csv", { requireTime = true } = {}) {
  const lines = text.replace(/^﻿/, "").split(/\r\n|\n|\r/);
  while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
  if (!lines.length) throw new Error(`${fileName} is empty`);
  const header = splitCsvLine(lines[0]).map((h) => h.trim());
  const keep = [];
  header.forEach((h, j) => { if (h !== "" && !h.startsWith("Unnamed")) keep.push(j); });
  const rows = lines.slice(1).filter((l) => l.trim() !== "").map(splitCsvLine);
  const columns = keep.map((j) => header[j]);
  const data = {};
  const bad = [];
  keep.forEach((j, k) => {
    const col = new Float64Array(rows.length);
    rows.forEach((r, i) => {
      const raw = (r[j] ?? "").trim();
      if (NA_STRINGS.has(raw)) { col[i] = NaN; return; }
      const v = Number(raw);
      if (Number.isNaN(v)) { bad.push(`${columns[k]} row ${i + 2}: "${raw}"`); col[i] = NaN; }
      else col[i] = v;
    });
    data[columns[k]] = col;
  });
  if (requireTime && !columns.includes("time")) throw new Error(`${fileName} has no "time" column (columns: ${columns.join(", ")})`);
  return { columns, nrows: rows.length, data, warnings: bad.slice(0, 5) };
}

/** pandas-style CSV text of a parsed table (NaN written as an empty cell). */
export function toCsv(table, extraCols = {}) {
  const cols = [...table.columns, ...Object.keys(extraCols)];
  const lines = [cols.join(",")];
  for (let i = 0; i < table.nrows; i++) {
    lines.push(cols.map((c) => {
      if (c in extraCols) return String(extraCols[c]); // e.g. the GUI's integer event_N column
      const v = table.data[c][i];
      return Number.isNaN(v) ? "" : pyFloat(v);
    }).join(","));
  }
  return lines.join("\n") + "\n";
}

// ---------------------------------------------------------------- reactions (okin rules)

const VALID_ELEMENTS = new Set(["H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne", "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar", "K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr", "Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb", "Te", "I", "Xe", "Cs", "Ba", "La", "Ce", "Pr", "Nd", "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn", "Fr", "Ra", "Ac", "Th", "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm", "Md", "No", "Lr", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og"]);

/** okin Compound: {label (shown in reactions), name (used in rate laws/species)}. */
function compound(text) {
  const s = text.trim();
  if (!s) throw new Error("empty species");
  const blocks = s.match(/[A-Z][a-z]?[0-9]*/g) || [];
  const valid = blocks.every((b) => VALID_ELEMENTS.has(b.match(/[A-Z][a-z]?/)[0]));
  let label = s;
  if (label.startsWith("(") && label.endsWith(")")) label = label.slice(1, -1);
  return { label, name: valid ? s : label };
}

const ARROWS = ["<=>", "->", "<==>", "--"];

/**
 * Validate a reaction like the GUI's reaction line edit (okin Reaction()).
 * Returns {ok, error, educts, products, arrow, text} - text is what the GUI stores (str(rct)).
 */
export function parseReaction(input) {
  const value = String(input).replaceAll("--", "-").replaceAll("<->", "<=>");
  let arrow = null;
  for (const a of ARROWS) if (value.includes(a)) arrow = a; // okin keeps the last match
  if (!arrow) return { ok: false, error: "no reaction arrow (use ->)" };
  const parts = value.split(arrow);
  if (parts.length !== 2) return { ok: false, error: `more than one "${arrow}"` };
  try {
    const educts = parts[0].split(/\+(?!})/).map(compound);
    const products = parts[1].split(/\+(?!})/).map(compound);
    const text = educts.map((c) => c.label).join(" + ") + " " + arrow + " " + products.map((c) => c.label).join(" + ");
    return { ok: true, educts, products, arrow, text };
  } catch (e) {
    return { ok: false, error: "every species needs a name (e.g. A + B -> C)" };
  }
}

/**
 * Normalise a forward/backward k entry like the GUI does on leaving the field.
 * "$" marks a fixed (not fitted) value. Returns {ok, text}.
 */
export function normalizeK(input) {
  const value = String(input);
  if (value.trim() === "") return { ok: true, text: "" };
  const constant = value.includes("$");
  let k = value.replaceAll("-", "").replaceAll("$", "").trim();
  const num = /^[+]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(k) || /^[+]?(inf|infinity|nan)$/i.test(k) ? Number(k.replace(/^\+/, "").replace(/^inf(inity)?$/i, "Infinity")) : NaN;
  if (Number.isNaN(num) && !/^[+]?nan$/i.test(k)) return { ok: false, text: constant ? "$" + k : k };
  const t = pyFloat(num);
  return { ok: true, text: constant ? "$" + t : t };
}

/**
 * Build the mechanism dict the GUI saves as model.json.
 * rows: [{rct, k, kN}] in editor order; only valid reactions are kept and numbered 1..n.
 */
export function makeMechanism(name, rows) {
  const valid = rows.map((r) => ({ ...r, parsed: parseReaction(r.rct || "") })).filter((r) => (r.rct || "").trim() && r.parsed.ok);
  if (!valid.length) throw new Error("the mechanism has no valid reactions");
  const k_dict = {};
  valid.forEach((r, i) => {
    k_dict[`k${i + 1}`] = r.k && String(r.k).trim() ? String(r.k).trim() : "0";
    k_dict[`kN${i + 1}`] = r.kN && String(r.kN).trim() ? String(r.kN).trim() : "0";
  });
  const m_steps = valid.map((r) => r.parsed.text);
  return completeMechanism({ name, m_steps_user: m_steps, k_dict, m_steps });
}

/** Fill in m_steps / used_species / k_to_fit for a model.json loaded from disk. */
export function completeMechanism(model) {
  const steps = model.m_steps || model.m_steps_user;
  if (!Array.isArray(steps) || !steps.length) throw new Error("model.json has no m_steps");
  const parsed = steps.map((s) => {
    const p = parseReaction(s);
    if (!p.ok) throw new Error(`invalid reaction "${s}": ${p.error}`);
    return p;
  });
  const k_dict = {};
  for (const [k, v] of Object.entries(model.k_dict || {})) k_dict[k] = typeof v === "string" ? v : pyStr(v);
  parsed.forEach((_, i) => {
    if (!(`k${i + 1}` in k_dict)) k_dict[`k${i + 1}`] = "0";
    if (!(`kN${i + 1}` in k_dict)) k_dict[`kN${i + 1}`] = "0";
  });
  const used = new Set();
  parsed.forEach((p) => [...p.educts, ...p.products].forEach((c) => used.add(c.name)));
  return {
    k_dict,
    m_steps_user: model.m_steps_user || steps,
    name: String(model.name ?? "model"),
    m_steps: steps.slice(),
    used_species: [...used].sort(),
    k_to_fit: Object.keys(k_dict).filter((k) => !k_dict[k].includes("$")),
  };
}

// ---------------------------------------------------------------- re-additions

/**
 * Turn a re-addition JSON (list of events, each a list of species added at once) into
 * the GUI's internal form: combined volume on the first entry of a multi-species event,
 * and a running event_index. Returns {events, nextIndex}.
 */
export function prepareReAdditions(raw, nextEventIndex) {
  if (!Array.isArray(raw)) throw new Error("the re-addition JSON must be a list of events");
  let idx = nextEventIndex;
  const events = raw.map((ev, n) => {
    const evList = Array.isArray(ev) ? ev : [ev];
    if (!evList.length) throw new Error(`re-addition event ${n + 1} is empty`);
    const copy = evList.map((ra) => {
      for (const key of ["species", "rct_volume_ml", "added_vol_ml", "mmol", "time_re_add"]) {
        if (!(key in ra)) throw new Error(`re-addition event ${n + 1} is missing "${key}"`);
      }
      return { ...ra };
    });
    if (copy.length > 1) {
      let total = 0;
      for (const ra of copy) total += Number(String(ra.added_vol_ml));
      copy[0].added_vol_ml = pyFloatNum(total);
      for (const ra of copy.slice(1)) ra.added_vol_ml = pyFloatNum(0);
    }
    idx += 1;
    copy.forEach((ra) => { ra.event_index = idx; });
    return copy;
  });
  return { events, nextIndex: idx };
}

/** Recompute event indices after files/additions were removed (keeps the order). */
export function renumberReAdditions(entries) {
  let idx = 0;
  return entries.map((e) => ({ ...e, events: e.events.map((ev) => { idx += 1; return ev.map((ra) => ({ ...ra, event_index: idx })); }) }));
}

// ---------------------------------------------------------------- sb string (exactly as the GUI)

/** okin Simulator._get_antimony_str + DataWindow.build_sb_string. reAdds: [{file, events}]. */
export function buildSbString(mech, reAdds = []) {
  const parsed = mech.m_steps.map(parseReaction);
  const r_lines = parsed.map((p, i) => {
    const id = i + 1;
    let rate = `k${id}`;
    for (const c of p.educts) rate += "*" + c.name;
    rate += `-kN${id}*`;
    for (const c of p.products) rate += c.name + "*";
    if (rate.endsWith("*")) rate = rate.slice(0, -1);
    const repr = `J${id}: ${p.educts.map((c) => c.label).join(" + ").trim()} ${p.arrow} ${p.products.map((c) => c.label).join(" + ").trim()}`;
    return `${repr};\t\t${rate}\n`;
  });
  const used = [...new Set(parsed.flatMap((p) => [...p.educts, ...p.products].map((c) => c.name)))].sort();
  const c_lines = used.map((c) => `${c} = 0\n`);
  const k_lines = Object.entries(mech.k_dict).map(([k, v]) => {
    const s = pyStr(v);
    return s.includes("$") ? `$${k} = ${s.replaceAll("$", "")}\n` : `${k} = ${s}\n`;
  });
  let sb = `${r_lines.join("")}\n\n${c_lines.join("")}\n\n${k_lines.join("")}`;
  const usedChems = mech.used_species;
  reAdds.forEach((entry, n) => {
    const csvIndex = n + 1;
    let ev = "\n\n";
    sb += `\nevent_${csvIndex} = 0`;
    for (const raEvent of entry.events) {
      const ra = raEvent[0];
      const ei = ra.event_index;
      const added = raEvent.map((x) => pyStr(x.species));
      ev += `rct_vol${ei} = ${pyStr(ra.rct_volume_ml)}\nadd_vol${ei} = ${pyStr(ra.added_vol_ml)}\nnew_vol${ei} = rct_vol${ei} + add_vol${ei}\n`;
      ev += `ratio${ei} = rct_vol${ei}/new_vol${ei}\n`;
      raEvent.forEach((x) => { ev += `${pyStr(x.species)}_added_mmol_${ei} = ${pyStr(x.mmol)}\n`; });
      ev += `at(time>=${pyStr(ra.time_re_add)}) && (event_${csvIndex}==1):\n`;
      let adj = "";
      for (const s of usedChems) {
        adj += added.includes(s) ? `\t${s}=(${s}*rct_vol${ei} + ${s}_added_mmol_${ei})/new_vol${ei},\n` : `\t${s}=${s}*ratio${ei},\n`;
      }
      ev += adj.slice(0, -2) + "\n";
    }
    sb += ev;
  });
  return sb;
}

// ---------------------------------------------------------------- fitting problem

const SQRT_EPS = Math.sqrt(2.220446049250313e-16);

/**
 * Build the parameter-estimation problem pycotools hands to COPASI.
 * files: [{name, table}] (training files, display order); reAdds: [{file, events}];
 * toMatch: species fitted against the data.
 */
export function buildProblem(mech, files, reAdds, toMatch) {
  const parsed = mech.m_steps.map(parseReaction);
  const species = [...new Set(parsed.flatMap((p) => [...p.educts, ...p.products].map((c) => c.name)))].sort();
  const sIndex = Object.fromEntries(species.map((s, i) => [s, i]));
  const paramNames = Object.keys(mech.k_dict);
  const pIndex = Object.fromEntries(paramNames.map((k, i) => [k, i]));
  const reactions = parsed.map((p, i) => {
    const kf = pIndex[`k${i + 1}`], kb = pIndex[`kN${i + 1}`];
    return { kf: kf ?? -1, kb: kb ?? -1, ed: p.educts.map((c) => sIndex[c.name]), pr: p.products.map((c) => sIndex[c.name]) };
  });
  const values = paramNames.map((k) => {
    const v = Number(pyStr(mech.k_dict[k]).replaceAll("$", ""));
    return Number.isFinite(v) ? v : 0;
  });
  const fit = mech.k_to_fit.filter((k) => k in pIndex);
  const fitIndex = fit.map((k) => pIndex[k]);
  const warnings = [];
  const eventVars = reAdds.map((_, n) => `event_${n + 1}`);
  const matchSet = new Set(toMatch);

  const experiments = files.map((f) => {
    const t = f.table;
    const times = Array.from(t.data.time);
    const y0 = new Float64Array(species.length);
    const activeEntries = reAdds.map((e, n) => ({ e, n })).filter(({ e }) => e.file === f.name);
    const deps = [];
    for (const col of t.columns) {
      if (col.toLowerCase().startsWith("time")) continue;
      const vals = t.data[col];
      if (col in sIndex) {
        if (!Number.isNaN(vals[0])) y0[sIndex[col]] = vals[0];
        const v = matchSet.has(col) ? Array.from(vals) : [vals[0], ...new Array(vals.length - 1).fill(NaN)];
        deps.push({ name: col, kind: "species", index: sIndex[col], values: v });
      } else if (!col.startsWith("event_")) {
        warnings.push(`${f.name}: column "${col}" is not a species of "${mech.name}" and is ignored`);
      }
    }
    // the GUI adds an event_N = 1 column to every file that has re-additions
    for (const { n } of activeEntries) {
      deps.push({ name: eventVars[n], kind: "event", index: n, values: [1, ...new Array(times.length - 1).fill(NaN)] });
    }
    // weights: COPASI "mean square", normalised per experiment
    const ms = deps.map((d) => {
      let s = 0, c = 0;
      for (const v of d.values) if (!Number.isNaN(v)) { s += v * v; c++; }
      return c ? s / c : NaN;
    });
    const valid = ms.filter((m) => !Number.isNaN(m));
    const minMs = valid.length ? Math.min(...valid) : 1;
    deps.forEach((d, i) => { d.weight = Number.isNaN(ms[i]) ? 0 : (minMs + SQRT_EPS) / (ms[i] + SQRT_EPS); });
    const events = [];
    for (const { e } of activeEntries) {
      for (const raEvent of e.events) {
        const ra = raEvent[0];
        const rct = Number(String(ra.rct_volume_ml));
        const add = Number(String(ra.added_vol_ml));
        const nv = rct + add;
        const tEv = Number(String(ra.time_re_add));
        const adds = raEvent.map((x) => ({ s: sIndex[pyStr(x.species)], mmol: Number(String(x.mmol)) }));
        for (const x of raEvent) {
          if (!(pyStr(x.species) in sIndex)) warnings.push(`${f.name}: re-added species "${pyStr(x.species)}" is not in "${mech.name}"`);
        }
        events.push({ t: tEv, rct, newVol: nv, ratio: rct / nv, adds: adds.filter((a) => a.s !== undefined) });
      }
    }
    events.sort((a, b) => a.t - b.t);
    // only measured points enter the objective (unmatched columns keep just their t=0 value)
    return { name: f.name, times, y0: Array.from(y0), events, deps };
  });
  return { mechName: mech.name, species, paramNames, values, fit, fitIndex, reactions, experiments, warnings };
}

// ---------------------------------------------------------------- stiff ODE solver (Rodas4)

const RODAS = {
  g: 0.25,
  a21: 1.544, a31: 0.9466785280815826, a32: 0.2557011698983284,
  a41: 3.314825187068521, a42: 2.896124015972201, a43: 0.9986419139977817,
  a51: 1.221224509226641, a52: 6.019134481288629, a53: 12.53708332932087, a54: -0.687886036105895,
  c21: -5.6688, c31: -2.430093356833875, c32: -0.2063599157091915,
  c41: -0.1073529058151375, c42: -9.594562251023355, c43: -20.47028614809616,
  c51: 7.496443313967647, c52: -10.24680431464352, c53: -33.99990352819905, c54: 11.7089089320616,
  c61: 8.083246795921522, c62: -7.981132988064893, c63: -31.52159432874371, c64: 16.31930543123136, c65: -6.058818238834054,
};

/** Mass-action right-hand side and Jacobian for a problem, plus a Rodas4 integrator. */
export function createSimulator(problem, opts = {}) {
  const n = problem.species.length;
  const rtol = opts.rtol ?? 1e-6, atol = opts.atol ?? 1e-12, maxSteps = opts.maxSteps ?? 200000;
  const R = problem.reactions.map((r) => {
    const net = new Map();
    r.ed.forEach((s) => net.set(s, (net.get(s) || 0) - 1));
    r.pr.forEach((s) => net.set(s, (net.get(s) || 0) + 1));
    const ns = [...net.entries()].filter(([, c]) => c !== 0);
    return { kf: r.kf, kb: r.kb, ed: Int32Array.from(r.ed), pr: Int32Array.from(r.pr), netS: Int32Array.from(ns.map((x) => x[0])), netC: Float64Array.from(ns.map((x) => x[1])) };
  });
  const p = new Float64Array(problem.values);
  const J = new Float64Array(n * n), E = new Float64Array(n * n), piv = new Int32Array(n);
  const dv = new Float64Array(n);
  const k1 = new Float64Array(n), k2 = new Float64Array(n), k3 = new Float64Array(n), k4 = new Float64Array(n), k5 = new Float64Array(n), k6 = new Float64Array(n);
  const yt = new Float64Array(n), ft = new Float64Array(n), yn = new Float64Array(n);
  let steps = 0;

  function rhs(y, out) {
    out.fill(0);
    for (const r of R) {
      let vf = r.kf >= 0 ? p[r.kf] : 0;
      for (let a = 0; a < r.ed.length; a++) vf *= y[r.ed[a]];
      let vb = r.kb >= 0 ? p[r.kb] : 0;
      for (let a = 0; a < r.pr.length; a++) vb *= y[r.pr[a]];
      const v = vf - vb;
      for (let a = 0; a < r.netS.length; a++) out[r.netS[a]] += r.netC[a] * v;
    }
  }
  function jac(y) {
    J.fill(0);
    for (const r of R) {
      dv.fill(0);
      const kf = r.kf >= 0 ? p[r.kf] : 0, kb = r.kb >= 0 ? p[r.kb] : 0;
      for (let a = 0; a < r.ed.length; a++) {
        let prod = kf;
        for (let b = 0; b < r.ed.length; b++) if (b !== a) prod *= y[r.ed[b]];
        dv[r.ed[a]] += prod;
      }
      for (let a = 0; a < r.pr.length; a++) {
        let prod = kb;
        for (let b = 0; b < r.pr.length; b++) if (b !== a) prod *= y[r.pr[b]];
        dv[r.pr[a]] -= prod;
      }
      for (let a = 0; a < r.netS.length; a++) {
        const row = r.netS[a] * n, c = r.netC[a];
        for (let j = 0; j < n; j++) if (dv[j] !== 0) J[row + j] += c * dv[j];
      }
    }
  }
  function decompose(fac) {
    for (let i = 0; i < n * n; i++) E[i] = -J[i];
    for (let i = 0; i < n; i++) E[i * n + i] += fac;
    for (let k = 0; k < n; k++) {
      let mx = Math.abs(E[k * n + k]), pi = k;
      for (let i = k + 1; i < n; i++) { const v = Math.abs(E[i * n + k]); if (v > mx) { mx = v; pi = i; } }
      piv[k] = pi;
      if (mx === 0 || !Number.isFinite(mx)) return false;
      if (pi !== k) for (let j = 0; j < n; j++) { const t = E[k * n + j]; E[k * n + j] = E[pi * n + j]; E[pi * n + j] = t; }
      const d = E[k * n + k];
      for (let i = k + 1; i < n; i++) {
        const m = (E[i * n + k] /= d);
        if (m !== 0) for (let j = k + 1; j < n; j++) E[i * n + j] -= m * E[k * n + j];
      }
    }
    return true;
  }
  function solve(b) {
    for (let k = 0; k < n; k++) { const pi = piv[k]; if (pi !== k) { const t = b[k]; b[k] = b[pi]; b[pi] = t; } }
    for (let i = 1; i < n; i++) { let s = b[i]; for (let j = 0; j < i; j++) s -= E[i * n + j] * b[j]; b[i] = s; }
    for (let i = n - 1; i >= 0; i--) { let s = b[i]; for (let j = i + 1; j < n; j++) s -= E[i * n + j] * b[j]; b[i] = s / E[i * n + i]; }
  }

  /** Integrate y in place from t0 to t1. Returns the step size to continue with, or -1 on failure. */
  function integrate(y, t0, t1, hInit) {
    const C = RODAS;
    let t = t0, h = Math.min(hInit, t1 - t0), reject = false;
    if (!(t1 > t0)) return hInit;
    while (t < t1) {
      if (++steps > maxSteps) return -1;
      let last = false;
      if (t + h >= t1 - 1e-12 * Math.abs(t1)) { h = t1 - t; last = true; }
      jac(y);
      for (;;) {
        if (!(h > 1e-14 * Math.max(1, Math.abs(t)))) return -1;
        if (!decompose(1 / (h * C.g))) { h *= 0.25; last = false; continue; }
        const ih = 1 / h;
        rhs(y, k1); solve(k1);
        for (let i = 0; i < n; i++) yt[i] = y[i] + C.a21 * k1[i];
        rhs(yt, ft); for (let i = 0; i < n; i++) k2[i] = ft[i] + C.c21 * ih * k1[i]; solve(k2);
        for (let i = 0; i < n; i++) yt[i] = y[i] + C.a31 * k1[i] + C.a32 * k2[i];
        rhs(yt, ft); for (let i = 0; i < n; i++) k3[i] = ft[i] + ih * (C.c31 * k1[i] + C.c32 * k2[i]); solve(k3);
        for (let i = 0; i < n; i++) yt[i] = y[i] + C.a41 * k1[i] + C.a42 * k2[i] + C.a43 * k3[i];
        rhs(yt, ft); for (let i = 0; i < n; i++) k4[i] = ft[i] + ih * (C.c41 * k1[i] + C.c42 * k2[i] + C.c43 * k3[i]); solve(k4);
        for (let i = 0; i < n; i++) yt[i] = y[i] + C.a51 * k1[i] + C.a52 * k2[i] + C.a53 * k3[i] + C.a54 * k4[i];
        rhs(yt, ft); for (let i = 0; i < n; i++) k5[i] = ft[i] + ih * (C.c51 * k1[i] + C.c52 * k2[i] + C.c53 * k3[i] + C.c54 * k4[i]); solve(k5);
        for (let i = 0; i < n; i++) yt[i] += k5[i];
        rhs(yt, ft); for (let i = 0; i < n; i++) k6[i] = ft[i] + ih * (C.c61 * k1[i] + C.c62 * k2[i] + C.c63 * k3[i] + C.c64 * k4[i] + C.c65 * k5[i]); solve(k6);
        let err = 0;
        for (let i = 0; i < n; i++) {
          yn[i] = yt[i] + k6[i];
          const sc = atol + rtol * Math.max(Math.abs(y[i]), Math.abs(yn[i]));
          const e = k6[i] / sc;
          err += e * e;
        }
        err = Math.sqrt(err / n);
        if (!Number.isFinite(err)) { h *= 0.25; last = false; reject = true; continue; }
        let fac = Math.max(1 / 6, Math.min(5, Math.pow(err, 0.25) / 0.9));
        if (err <= 1) {
          t = last ? t1 : t + h;
          for (let i = 0; i < n; i++) y[i] = yn[i];
          if (reject) fac = Math.max(fac, 1);
          reject = false;
          h = h / fac;
          break;
        }
        reject = true; last = false;
        h = h / fac;
      }
    }
    return h;
  }

  /**
   * Simulate one experiment with full parameter vector `params` (in problem.paramNames order).
   * Returns Float64Array[nTimes * n] (row-major) or null if the solver failed.
   */
  function simulate(exp, params) {
    for (let i = 0; i < p.length; i++) p[i] = params[i];
    steps = 0;
    const times = exp.times, nt = times.length;
    const out = new Float64Array(nt * n);
    const y = Float64Array.from(exp.y0);
    const span = Math.max(1e-9, Math.abs(times[nt - 1] || 1));
    let t = 0, h = 1e-6 * span, ti = 0, ei = 0;
    const events = exp.events;
    while (ei < events.length && !(events[ei].t > 0)) ei++; // at(time>=T) with T<=0 never fires
    const record = () => { while (ti < nt && times[ti] <= t + 1e-12 * Math.max(1, Math.abs(t))) { for (let i = 0; i < n; i++) out[ti * n + i] = y[i]; ti++; } };
    record();
    while (ti < nt) {
      const tOut = times[ti];
      const tEv = ei < events.length ? events[ei].t : Infinity;
      const tNext = Math.min(tOut, tEv);
      if (tNext > t) {
        h = integrate(y, t, tNext, h);
        if (h < 0) return null;
        t = tNext;
      }
      if (ei < events.length && events[ei].t <= t) {
        while (ei < events.length && events[ei].t <= t) {
          const ev = events[ei++];
          const pre = Float64Array.from(y);
          for (let i = 0; i < n; i++) y[i] = pre[i] * ev.ratio;
          for (const a of ev.adds) y[a.s] = (pre[a.s] * ev.rct + a.mmol) / ev.newVol;
        }
        h = 1e-6 * span;
      }
      record();
    }
    for (let i = 0; i < out.length; i++) if (!Number.isFinite(out[i])) return null;
    return out;
  }

  return { simulate, n, rhs, jac };
}

// ---------------------------------------------------------------- objective

/** Returns f(fitValues) -> COPASI objective (sum of weighted squared residuals). */
export function createObjective(problem, opts) {
  const sim = createSimulator(problem, opts);
  const full = Float64Array.from(problem.values);
  const n = problem.species.length;
  /**
   * fitValues -> sum of weighted squared residuals. If `residuals` (length countResiduals(problem))
   * is given it is filled with COPASI's residuals sqrt(w) * (data - model), which Levenberg-Marquardt
   * and NL2SOL use; on a failed simulation the value is Infinity and the residuals are 0.
   */
  return function objective(fitValues, residuals) {
    for (let i = 0; i < problem.fitIndex.length; i++) full[problem.fitIndex[i]] = fitValues[i];
    let total = 0, k = 0;
    for (const exp of problem.experiments) {
      const out = sim.simulate(exp, full);
      if (!out) { if (residuals) residuals.fill(0); return Infinity; }
      for (const d of exp.deps) {
        if (d.weight === 0) continue;
        const sw = residuals ? Math.sqrt(d.weight) : 0;
        for (let ti = 0; ti < d.values.length; ti++) {
          const yv = d.values[ti];
          if (Number.isNaN(yv)) continue;
          const sv = d.kind === "species" ? out[ti * n + d.index] : 1;
          const r = yv - sv;
          total += d.weight * r * r;
          if (residuals) residuals[k++] = sw * r;
        }
      }
    }
    if (!Number.isFinite(total)) { if (residuals) residuals.fill(0); return Infinity; }
    return total;
  };
}

/** Number of residuals (weighted data points) of a problem. */
export function countResiduals(problem) {
  let k = 0;
  for (const exp of problem.experiments) for (const d of exp.deps) if (d.weight !== 0) for (const v of d.values) if (!Number.isNaN(v)) k++;
  return k;
}

/** Simulated species curves (at the data times) for every experiment of a problem. */
export function simulateProblem(problem, fullParams, opts) {
  const sim = createSimulator(problem, opts);
  return problem.experiments.map((exp) => {
    const out = sim.simulate(exp, fullParams);
    const res = { time: exp.times.slice() };
    problem.species.forEach((s, i) => { res[s] = out ? exp.times.map((_, ti) => out[ti * problem.species.length + i]) : exp.times.map(() => NaN); });
    res.failed = !out;
    return res;
  });
}

// ---------------------------------------------------------------- random numbers

/** Seeded PRNG (sfc32) with the helpers COPASI's GA uses. */
export function createRng(seed) {
  let a = 0x9e3779b9 ^ seed, b = 0x243f6a88 ^ (seed * 31), c = 0xb7e15162 ^ (seed >>> 3), d = (seed * 2654435761) >>> 0;
  const next = () => {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    const t = (a + b) | 0;
    a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    const r = (t + d) | 0;
    c = (c + r) | 0;
    return (r >>> 0) / 4294967296;
  };
  for (let i = 0; i < 20; i++) next();
  let spare = null;
  return {
    random: next,
    cc: next,
    u: (max) => Math.min(max, Math.floor(next() * (max + 1))), // integer in [0, max]
    normal(mean, sd) {
      let z;
      if (spare !== null) { z = spare; spare = null; }
      else {
        let u1 = next(), u2 = next();
        while (u1 <= 1e-300) u1 = next();
        const r = Math.sqrt(-2 * Math.log(u1));
        z = r * Math.cos(2 * Math.PI * u2); spare = r * Math.sin(2 * Math.PI * u2);
      }
      return mean + sd * z;
    },
  };
}

// ---------------------------------------------------------------- COPASI genetic algorithm

const DBL_MIN = 2.2250738585072014e-308;

/**
 * One parameter estimation with COPASI's "Genetic Algorithm" (COptMethodGA).
 * settings: {generations, population, lower, upper, mutationVariance, randomizeStart, startValues}
 * onImprove({values, objective, evals}) is called for the initial best and every improvement,
 * which is what COPASI writes to the pycotools report. Returns {best, objective, history, evals}.
 */
export function runGA(objective, nVar, settings, rng, onImprove = () => {}, shouldStop = () => false) {
  const it = gaIterator(objective, nVar, settings, rng, onImprove);
  let step = it.next();
  while (!step.done) {
    if (shouldStop()) return step.value.result;
    step = it.next();
  }
  return step.value;
}

/**
 * The same algorithm as a generator: yields {gen, generations, best, evals} after every
 * generation so a caller can report progress or spread the work over animation frames.
 * The return value is {best, objective, history, evals}.
 */
export function* gaIterator(objective, nVar, settings, rng, onImprove = () => {}) {
  const P = Math.max(1, Math.floor(settings.population));
  const G = Math.max(1, Math.floor(settings.generations));
  const lo = settings.lower, hi = settings.upper, variance = settings.mutationVariance ?? 0.1;
  const pop = Array.from({ length: 2 * P }, () => new Float64Array(nVar));
  const vals = new Float64Array(2 * P).fill(Infinity);
  const losses = new Int32Array(2 * P);
  const shuffleIdx = new Int32Array(P);
  const cross = new Uint8Array(nVar);
  let evals = 0;
  const history = [];
  const evaluate = (x) => { evals++; return objective(x); };
  const clamp = (v, j) => (v < lo[j] ? lo[j] : v > hi[j] ? hi[j] : v);
  const randomValue = (j) => { // COptMethodGA::creation
    let mn = lo[j], mx = hi[j];
    if (mn >= 0) {
      const la = Math.log10(mx) - Math.log10(Math.max(mn, DBL_MIN));
      if (la < 1.8 || !(mn > 0)) return mn + rng.cc() * (mx - mn);
      return Math.pow(10, Math.log10(Math.max(mn, DBL_MIN)) + la * rng.cc());
    }
    if (mx > 0) {
      const la = Math.log10(mx) + Math.log10(-mn);
      if (la < 3.6) return mn + rng.cc() * (mx - mn);
      const mean = (mx + mn) * 0.5, sigma = Math.abs(mean * 0.01) || 1e-12;
      for (let tries = 0; tries < 1000; tries++) { const v = rng.normal(mean, sigma); if (v >= mn && v <= mx) return v; }
      return mean;
    }
    [mn, mx] = [-hi[j], -lo[j]];
    const la = Math.log10(mx) - Math.log10(Math.max(mn, DBL_MIN));
    if (la < 1.8 || !(mn > 0)) return -(mn + rng.cc() * (mx - mn));
    return -Math.pow(10, Math.log10(Math.max(mn, DBL_MIN)) + la * rng.cc());
  };
  const creation = (first, last) => {
    for (let i = first; i < last; i++) {
      for (let j = 0; j < nVar; j++) pop[i][j] = clamp(randomValue(j), j);
      vals[i] = evaluate(pop[i]);
    }
  };
  const record = (i) => {
    const row = { values: Array.from(pop[i]), objective: vals[i], evals };
    history.push(row);
    onImprove(row);
  };

  const finish = () => {
    const last = history[history.length - 1];
    return { best: last ? last.values : [], objective: last ? last.objective : Infinity, history, evals };
  };
  if (nVar === 0) {
    vals[0] = evaluate(pop[0]);
    record(0);
    return finish();
  }

  // first individual = start values (randomised like the PE task when requested)
  for (let j = 0; j < nVar; j++) pop[0][j] = clamp(settings.randomizeStart || !settings.startValues ? randomValue(j) : settings.startValues[j], j);
  vals[0] = evaluate(pop[0]);
  creation(1, P);

  const fittest = () => {
    let bi = -1, bv = Number.MAX_VALUE;
    for (let i = 0; i < P && !losses[i]; i++) if (vals[i] < bv) { bi = i; bv = vals[i]; }
    return bi;
  };
  let bestIndex = fittest();
  let bestValue = Infinity;
  if (bestIndex >= 0) { bestValue = vals[bestIndex]; record(bestIndex); }

  const crossover = (A, B, C, D) => {
    const nCross = nVar > 1 ? rng.u(Math.floor(nVar / 2)) : 0;
    if (nCross === 0) { C.set(A); D.set(B); return; }
    cross.fill(0);
    for (let i = 0; i < nCross; i++) cross[rng.u(nVar - 1)] = 1;
    let pA = A, pB = B;
    for (let i = 0; i < nVar; i++) {
      if (cross[i]) { const t = pA; pA = pB; pB = t; }
      C[i] = pA[i]; D[i] = pB[i];
    }
  };
  const mutate = (x) => {
    for (let j = 0; j < nVar; j++) x[j] = clamp(x[j] * rng.normal(1, variance), j);
  };
  const replicate = () => {
    for (let i = 0; i < P; i++) shuffleIdx[i] = i;
    for (let i = P - 1; i > 0; i--) { const j = rng.u(i); const t = shuffleIdx[i]; shuffleIdx[i] = shuffleIdx[j]; shuffleIdx[j] = t; }
    // CPermutation::pick() (random position) and next() (its successor), as COPASI pairs parents
    for (let i = 0; i < Math.floor(P / 2); i++) {
      const at = rng.u(P - 1);
      crossover(pop[shuffleIdx[at]], pop[shuffleIdx[(at + 1) % P]], pop[P + 2 * i], pop[P + 2 * i + 1]);
    }
    if (P % 2 > 0) pop[2 * P - 1].set(pop[P - 1]);
    for (let i = P; i < 2 * P; i++) { mutate(pop[i]); vals[i] = evaluate(pop[i]); }
  };
  const select = () => {
    const total = 2 * P;
    losses.fill(0);
    const nopp = Math.max(1, Math.floor(P / 5));
    for (let i = 0; i < total; i++) {
      for (let j = 0; j < nopp; j++) {
        let opp;
        do { opp = rng.u(total - 1); } while (opp === i && total > 1);
        if (vals[i] < vals[opp]) losses[opp]++;
        else losses[i]++;
      }
    }
    const order = Array.from({ length: total }, (_, i) => i).sort((a, b) => losses[a] - losses[b] || a - b);
    const newPop = order.map((i) => pop[i]);
    const newVals = order.map((i) => vals[i]);
    const newLoss = order.map((i) => losses[i]);
    for (let i = 0; i < total; i++) { pop[i] = newPop[i]; vals[i] = newVals[i]; losses[i] = newLoss[i]; }
  };

  let stalled = 0, s10 = 0, s30 = 0, s50 = 0;
  yield { gen: 1, generations: G, best: bestValue, evals, result: finish() };
  for (let gen = 2; gen <= G; gen++, stalled++) {
    if (settings.stopAfterStalled && stalled > settings.stopAfterStalled) break;
    if (stalled > 50 && s50 > 50) { creation(Math.floor(P / 2), P); s10 = s30 = s50 = 0; }
    else if (stalled > 30 && s30 > 30) { creation(Math.floor(P * 0.7), P); s10 = s30 = 0; }
    else if (stalled > 10 && s10 > 10) { creation(Math.floor(P * 0.9), P); s10 = 0; }
    else replicate();
    select();
    bestIndex = fittest();
    if (bestIndex >= 0 && vals[bestIndex] < bestValue) {
      stalled = s10 = s30 = s50 = 0;
      bestValue = vals[bestIndex];
      record(bestIndex);
    }
    s10++; s30++; s50++;
    yield { gen, generations: G, best: bestValue, evals, result: finish() };
  }
  return finish();
}

// ---------------------------------------------------------------- statistics (utils/statistics.py)

const nanSum = (a) => a.reduce((s, v) => (Number.isNaN(v) ? s : s + v), 0);
const nanMean = (a) => { let s = 0, c = 0; for (const v of a) if (!Number.isNaN(v)) { s += v; c++; } return c ? s / c : NaN; };

/**
 * get_metrics(): per-species and total SSE, R2, adjusted R2, chi2, reduced chi2, BIC, log-likelihood.
 * BIC = k ln(n) - 2 ln L replaces the desktop GUI's AIC (2k - 2 ln L), with the same k, n and ln L.
 */
export function getMetrics(yData, yModel, nParams, sigma, selection) {
  for (const s of selection) if (!(s in yModel) || !(s in yData)) return null; // pandas KeyError -> None
  const n = yData[selection[0]] ? yData[selection[0]].length : 0;
  const out = { sse: {}, r2: {}, r2_adj: {}, chi2: {}, red_chi2: {}, bic: {}, ll: {} };
  for (const s of selection) {
    const d = yData[s], m = yModel[s];
    const res = d.map((v, i) => v - m[i]);
    const sse = nanSum(res.map((r) => r * r));
    const mean = nanMean(d);
    const sst = nanSum(d.map((v) => (v - mean) * (v - mean)));
    let r2 = 1 - sse / sst;
    if (sst === 0) r2 = NaN;
    const r2adj = 1 - (1 - r2) * (n - 1) / (n - nParams - 1);
    const chi2 = nanSum(res.map((r) => (r / sigma) ** 2));
    const red = chi2 / (n - nParams);
    const ll = -0.5 * n * Math.log(2 * Math.PI * sigma * sigma) - sse / (2 * sigma * sigma);
    Object.assign(out.sse, { [s]: sse }); out.r2[s] = r2; out.r2_adj[s] = r2adj; out.chi2[s] = chi2; out.red_chi2[s] = red; out.ll[s] = ll; out.bic[s] = nParams * Math.log(n) - 2 * ll;
  }
  for (const k of Object.keys(out)) out[k].total = nanSum(Object.values(out[k]));
  return out;
}

/** f_test() per species and f_test_global(); model2 is the one with more parameters. */
export function fTest(yData, yModel1, yModel2, dof1, dof2, selection) {
  if (dof2 < dof1) { [dof1, dof2] = [dof2, dof1]; [yModel1, yModel2] = [yModel2, yModel1]; }
  const n = yData[selection[0]].length;
  const ddof1 = dof2 - dof1, ddof2 = n - dof2;
  const F = {}, p = {};
  let t1 = 0, t2 = 0;
  for (const s of selection) {
    const w = nanSum(yData[s].map((v, i) => (v - yModel1[s][i]) ** 2));
    const c = nanSum(yData[s].map((v, i) => (v - yModel2[s][i]) ** 2));
    t1 += w; t2 += c;
    const Fv = ((w - c) / ddof1) / (c / ddof2);
    F[`F_${s}`] = Fv; p[`p_${s}`] = 1 - fCdf(Fv, ddof1, ddof2);
  }
  const Fg = ((t1 - t2) / ddof1) / (t2 / ddof2);
  F.F_global = Fg; p.p_global = 1 - fCdf(Fg, ddof1, ddof2);
  return { F, p };
}

function lgamma(x) {
  const g = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x, tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (const c of g) ser += c / ++y;
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}
function betacf(a, b, x) {
  const MAXIT = 300, EPS = 3e-16, FPMIN = 1e-300;
  let qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}
function betai(a, b, x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b;
}
/** CDF of the F distribution (scipy.stats.f.cdf). */
export function fCdf(x, d1, d2) {
  if (Number.isNaN(x) || !(d1 > 0) || !(d2 > 0)) return NaN;
  if (x <= 0) return 0;
  if (x === Infinity) return 1;
  return betai(d1 / 2, d2 / 2, d1 * x / (d1 * x + d2));
}

/** StatisticWidget.format_sci(). */
export function formatSci(x, precision = 3) {
  if (x === null || x === undefined || Number.isNaN(x)) return "nan";
  if (!Number.isFinite(x)) return x > 0 ? "inf" : "-inf";
  if (Math.abs(x) < 1e-2) {
    const [m, e] = x.toExponential(precision).split("e");
    const ev = parseInt(e, 10);
    return `${m}e${ev < 0 ? "-" : "+"}${String(Math.abs(ev)).padStart(2, "0")}`;
  }
  return x.toFixed(precision);
}
