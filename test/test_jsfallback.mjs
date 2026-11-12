// The JavaScript copy of the COPASI module gives the same results as the WebAssembly one.
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import * as E from "../engine.js";
import { runEstimation, loadCopasiModule } from "../copasi.js";
const REF = fileURLToPath(new URL("./ref", import.meta.url));
const files = ["exp1.csv", "exp2.csv"].map((f) => ({ name: f, table: E.parseCsv(fs.readFileSync(`${REF}/${f}`, "utf8"), f) }));
const prep = E.prepareReAdditions(E.parsePyJson(fs.readFileSync(`${REF}/exp1_re_add.json`, "utf8")), 0);
const mech = E.makeMechanism("Inhibition", ["A + cat -> cat1", "cat1 + B -> cat2", "cat2 -> P + cat", "B + cat -> catI"].map((r, i) => ({ rct: r, k: "", kN: i < 3 ? "$0" : "" })));
const prob = E.buildProblem(mech, files, [{ file: "exp1.csv", events: prep.events }], ["A", "B", "P"]);
const obj = E.createObjective(prob), nRes = E.countResiduals(prob), n = prob.fit.length;
const wasm = await WebAssembly.compile(fs.readFileSync(new URL("../copasi-opt.wasm", import.meta.url)));
const js = { instantiate: (await import("../copasi-opt.js")).instantiate };
for (const [name, method, params] of [["GA", 6, { "Number of Generations": 10, "Population Size": 10 }], ["LM", 9, { "Iteration Limit": 50, Tolerance: 1e-5 }], ["NL2SOL", 18, { "Iteration Limit": 50 }], ["Praxis", 12, { Tolerance: 1e-5 }], ["SRES", 4, { "Number of Generations": 10, "Population Size": 10 }], ["TN", 17, {}], ["SS", 14, { "Number of Iterations": 5 }]]) {
  const out = [];
  for (const mod of [wasm, js]) {
    let best = Infinity;
    const t0 = performance.now();
    const r = runEstimation(mod, { method, params, lower: Array(n).fill(1e-6), upper: Array(n).fill(1e6), start: Array(n).fill(0.1), randomizeStart: true, nResiduals: nRes, seed: 7, startSeed: 9 }, obj, (x, v) => { best = Math.min(best, v); });
    out.push({ best, ev: r.evaluations, ms: performance.now() - t0 });
  }
  console.log(`${name.padEnd(7)} ${out[0].best === out[1].best && out[0].ev === out[1].ev ? "SAME" : "DIFF"}  wasm ${out[0].best.toExponential(6)} (${out[0].ev} ev, ${out[0].ms.toFixed(0)} ms)  js ${out[1].best.toExponential(6)} (${out[1].ev} ev, ${out[1].ms.toFixed(0)} ms)`);
}
