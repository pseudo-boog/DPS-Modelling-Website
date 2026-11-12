// Builds example.js: the simulated reference case (two time courses, re-additions on exp1,
import { fileURLToPath } from "node:url";
// two mechanisms) plus fits made with this engine at the default settings (50 x 50, 3 x 10 runs).
import fs from "node:fs";
import * as E from "../engine.js";
import { runEstimation } from "../copasi.js";
const wasm = await WebAssembly.compile(fs.readFileSync(new URL("../copasi-opt.wasm", import.meta.url)));
const REF = fileURLToPath(new URL("./ref", import.meta.url));
const csv = (f) => fs.readFileSync(`${REF}/${f}`, "utf8");
const files = ["exp1.csv", "exp2.csv"].map((f) => ({ name: f, table: E.parseCsv(csv(f), f) }));
const raJson = fs.readFileSync(`${REF}/exp1_re_add.json`, "utf8");
const prep = E.prepareReAdditions(E.parsePyJson(raJson), 0);
const reAdds = [{ file: "exp1.csv", events: prep.events }];
const rx = ["A + cat -> cat1", "cat1 + B -> cat2", "cat2 -> P + cat"];
const editorRows = {
  base: rx.map((r) => ({ rct: r, k: "", kN: "$0" })),
  Inhibition: [...rx, "B + cat -> catI"].map((r, i) => ({ rct: r, k: "", kN: i < 3 ? "$0" : "" })),
};
const mechs = Object.entries(editorRows).map(([n, rows]) => E.makeMechanism(n, rows));
const params = { "Number of Generations": 50, "Population Size": 50, "Mutation Variance": 0.1, "Stop after # Stalled Generations": 0 };
const settings = { method: "genetic_algorithm", params, copies: 3, peNumber: 10, lower: 1e-6, upper: 1e6, startValue: 0.1, randomizeStart: true };
const fits = {};
for (const [mi, m] of mechs.entries()) {
  const prob = E.buildProblem(m, files, reAdds, ["A", "B", "P"]);
  const obj = E.createObjective(prob);
  const nv = prob.fit.length;
  const rows = [];
  const t0 = performance.now();
  let evals = 0;
  for (let r = 0; r < settings.copies * settings.peNumber; r++) {
    const seed = (20261112 + r * 7919 + mi * 104729) >>> 0;
    let last = null;
    const res = runEstimation(wasm, { method: 6, params, lower: Array(nv).fill(1e-6), upper: Array(nv).fill(1e6), start: Array(nv).fill(0.1), randomizeStart: true, nResiduals: 0, seed, startSeed: (seed ^ 0x5bd1e995) >>> 0 },
      obj, (x, v) => {
        if (last && last.v === v) return;
        last = { v };
        if (Number.isFinite(v)) rows.push({ k: Object.fromEntries(prob.fit.map((k, i) => [k, Number(x[i].toPrecision(6))])), RSS: Number(v.toPrecision(6)) });
      });
    evals += res.evaluations;
  }
  rows.sort((a, b) => a.RSS - b.RSS);
  fits[m.name] = { rows, keys: prob.fit, settings: { ...settings, seed: 20261112 }, toMatch: ["A", "B", "P"], fileNames: ["exp1.csv", "exp2.csv"], evals, seconds: (performance.now() - t0) / 1000, finishedAt: "2026-11-12T12:00:00Z" };
  console.log(m.name, rows.length, "rows, best", rows[0].RSS, rows[0].k, ((performance.now() - t0) / 1000).toFixed(1) + "s");
}
const out = `// Example session for RE-ADD Modeler: simulated data (generated with k1=2, k2=5, k3=0.05,
// k4=3, kN4=0.4 and 1% noise) and fits made with COPASI's genetic algorithm (50 x 50, 3 x 10 runs).
export const EXAMPLE = ${JSON.stringify({
  files: files.map((f) => ({ name: f.name, csv: csv(f.name) })),
  additions: [{ file: "exp1.csv", json: raJson }],
  editorRows,
  fits,
})};
`;
fs.writeFileSync(new URL("../example.js", import.meta.url), out);
console.log("example.js", (out.length / 1024).toFixed(0), "KB");
