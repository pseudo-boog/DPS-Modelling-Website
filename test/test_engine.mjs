import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import * as E from "../engine.js";

const REF = fileURLToPath(new URL("./ref", import.meta.url));
const OUT = path.join(REF, "gui_out");
const read = (p) => fs.readFileSync(p, "utf8");
let fails = 0;
const check = (name, ok, extra = "") => { console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  " + extra : ""}`); if (!ok) fails++; };
const rel = (a, b) => Math.abs(a - b) / Math.max(Math.abs(b), 1e-300);

const caseJ = JSON.parse(read(path.join(REF, "ref_case.json")));
const files = caseJ.files.map((f) => ({ name: f, table: E.parseCsv(read(path.join(REF, f)), f) }));
const rawAdds = E.parsePyJson(read(path.join(REF, "exp1_re_add.json")));
const prep = E.prepareReAdditions(rawAdds, 0);
const reAdds = [{ file: "exp1.csv", events: prep.events }];

const mechs = caseJ.mechanisms.map((m) => E.makeMechanism(m.name, m.reactions.map((r, i) => ({ rct: r, k: m.k[`k${i + 1}`] || "", kN: m.k[`kN${i + 1}`] || "" }))));

// 1. sb strings and model.json
for (const m of mechs) {
  const sb = E.buildSbString(m, reAdds);
  const ref = read(path.join(OUT, "models", m.name, "sb_string.txt"));
  check(`sb_string ${m.name} identical`, sb === ref, sb === ref ? "" : `\n--- got\n${JSON.stringify(sb)}\n--- want\n${JSON.stringify(ref)}`);
  const mj = JSON.parse(read(path.join(OUT, "models", m.name, "model.json")));
  check(`model.json ${m.name} identical`, JSON.stringify(mj) === JSON.stringify(m));
}
// re_add.json internal form
const refRa = E.parsePyJson(read(path.join(OUT, "time_courses", "re_add.json")));
const refEvents = Object.values(refRa[0])[0];
check("re_add internal form", E.stringifyPy(refEvents) === E.stringifyPy(prep.events), E.stringifyPy(prep.events).slice(0, 0));

// 2. simulation vs roadrunner results at the best k's
const toMatch = ["A", "B", "P"];
const bestK = {};
for (const m of mechs) {
  const kr = E.parseCsv(read(path.join(OUT, "models", m.name, "k_result.csv")), "k_result.csv", { requireTime: false });
  const row = Object.fromEntries(kr.columns.map((c) => [c, kr.data[c][0]]));
  bestK[m.name] = row;
  const prob = E.buildProblem(m, files, reAdds, toMatch);
  const full = prob.paramNames.map((k, i) => (k in row ? row[k] : prob.values[i]));
  const sims = E.simulateProblem(prob, full);
  // base: the GUI's own Results-tab curve; Inhibition: tellurium with its own best k's (the GUI
  // saved Inhibition_data.csv with base's k's - see notes), both experiments
  const refs = m.name === "base" ? [[0, path.join(OUT, "results", "base_data.csv")]]
    : [[0, path.join(REF, "te_Inhibition_exp1.csv")], [1, path.join(REF, "te_Inhibition_exp2.csv")]];
  for (const [ei, refPath] of refs) {
    const refSim = E.parseCsv(read(refPath));
    let worst = 0, where = "";
    for (const s of refSim.columns) {
      if (s === "time") continue;
      for (let i = 0; i < refSim.nrows; i++) {
        const a = sims[ei][s][i], b = refSim.data[s][i];
        const d = Math.abs(a - b) / (Math.abs(b) + 1e-6);
        if (d > worst) { worst = d; where = `${s}@t=${refSim.data.time[i]} got ${a} want ${b}`; }
      }
    }
    check(`simulation ${m.name} vs roadrunner (${files[ei].name})`, worst < 1e-4, `max rel dev ${worst.toExponential(2)} ${where}`);
  }
  // objective at best k vs k_result RSS
  const obj = E.createObjective(prob);
  const fitv = prob.fit.map((k) => row[k]);
  const v = obj(fitv);
  check(`objective ${m.name} at best k vs COPASI RSS`, rel(v, row.RSS) < 2e-3, `${v} vs ${row.RSS}`);
  if (prob.warnings.length) console.log("   warnings:", prob.warnings);
}

// 3. objective vs COPASI Method_Statistics
const co = JSON.parse(read(path.join(REF, "copasi_objectives.json")));
const inh = mechs.find((m) => m.name === "Inhibition");
const probI = E.buildProblem(inh, files, reAdds, toMatch);
console.log("   weights:", probI.experiments.map((e) => e.deps.map((d) => `${d.name}=${d.weight.toPrecision(7)}`).join(" ")).join(" | "));
const objI = E.createObjective(probI);
for (const r of co.results) {
  const v = objI(probI.fit.map((k) => r.params[k]));
  check(`COPASI objective ${JSON.stringify(r.params)}`, rel(v, r.objective) < 1e-4, `${v.toExponential(10)} vs ${r.objective.toExponential(10)} (rel ${rel(v, r.objective).toExponential(2)})`);
}

// 4. statistics and F-tests
const errRef = JSON.parse(read(path.join(OUT, "results", "errors.json")));
const fRef = JSON.parse(read(path.join(OUT, "results", "F_tests.json")));
const exp1 = files[0].table;
const yData = Object.fromEntries(toMatch.map((s) => [s, Array.from(exp1.data[s])]));
const models = {};
for (const m of mechs) {
  const refSim = E.parseCsv(read(path.join(OUT, "results", `${m.name}_data.csv`)));
  models[m.name] = Object.fromEntries(refSim.columns.map((c) => [c, Array.from(refSim.data[c])]));
  const met = E.getMetrics(yData, models[m.name], m.k_to_fit.length, 0.1, toMatch);
  let worst = 0, w = "";
  for (const [metric, vals] of Object.entries(errRef[m.name])) for (const [s, v] of Object.entries(vals)) {
    if (metric === "aic") { // the web version reports BIC; check it from the GUI's log-likelihood instead
      const ll = errRef[m.name].ll[s], n = exp1.nrows, k = m.k_to_fit.length;
      const want = s === "total" ? Object.entries(errRef[m.name].ll).filter(([x]) => x !== "total").reduce((a, [, l]) => a + k * Math.log(n) - 2 * l, 0) : k * Math.log(n) - 2 * ll;
      const d = rel(met.bic[s], want); if (d > worst) { worst = d; w = `bic.${s} ${met.bic[s]} vs ${want}`; }
      continue;
    }
    const d = rel(met[metric][s], v); if (d > worst) { worst = d; w = `${metric}.${s} ${met[metric][s]} vs ${v}`; }
  }
  check(`errors.json ${m.name} (from roadrunner curves)`, worst < 1e-9, `worst ${worst.toExponential(2)} ${w}`);
}
const ft = E.fTest(yData, models.base, models.Inhibition, 3, 5, toMatch);
let worstF = 0;
for (const [k, v] of Object.entries(fRef.Inhibition)) worstF = Math.max(worstF, rel(ft.F[k], v));
for (const [k, v] of Object.entries(fRef.p_Inhibition)) worstF = Math.max(worstF, Math.abs(ft.p[k] - v));
check("F_tests.json", worstF < 1e-7, `worst ${worstF.toExponential(2)} ${JSON.stringify(ft)}`);
console.log(`\n${fails ? fails + " FAILED" : "ALL PASS"}`);
process.exit(fails ? 1 : 0);
