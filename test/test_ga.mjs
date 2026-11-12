import fs from "node:fs";
import { fileURLToPath } from "node:url";
import * as E from "../engine.js";
const REF = fileURLToPath(new URL("./ref", import.meta.url));
const files = ["exp1.csv", "exp2.csv"].map((f) => ({ name: f, table: E.parseCsv(fs.readFileSync(`${REF}/${f}`, "utf8"), f) }));
const prep = E.prepareReAdditions(E.parsePyJson(fs.readFileSync(`${REF}/exp1_re_add.json`, "utf8")), 0);
const reAdds = [{ file: "exp1.csv", events: prep.events }];
const rx = ["A + cat -> cat1", "cat1 + B -> cat2", "cat2 -> P + cat"];
const mechs = [E.makeMechanism("base", rx.map((r) => ({ rct: r, k: "", kN: "$0" }))),
  E.makeMechanism("Inhibition", [...rx, "B + cat -> catI"].map((r, i) => ({ rct: r, k: "", kN: i < 3 ? "$0" : "" })))];
const runs = Number(process.argv[2] || 30), G = Number(process.argv[3] || 30), P = Number(process.argv[4] || 30);
for (const m of mechs) {
  const prob = E.buildProblem(m, files, reAdds, ["A", "B", "P"]);
  const obj = E.createObjective(prob);
  const nv = prob.fit.length;
  const t0 = performance.now();
  const all = [];
  let evals = 0;
  for (let r = 0; r < runs; r++) {
    const rng = E.createRng(Number(process.argv[5] || 1000) + r);
    const res = E.runGA(obj, nv, { generations: G, population: P, lower: Array(nv).fill(1e-6), upper: Array(nv).fill(1e6), randomizeStart: true }, rng);
    evals += res.evals;
    all.push(...res.history);
  }
  all.sort((a, b) => a.objective - b.objective);
  const dt = (performance.now() - t0) / 1000;
  const bests = all.slice(0, 3).map((h) => h.objective.toExponential(4) + " " + h.values.map((v) => v.toPrecision(4)).join(","));
  console.log(`${m.name}: ${runs} runs in ${dt.toFixed(1)}s (${(dt * 1000 / evals).toFixed(2)} ms/eval, ${evals} evals), ${all.length} rows\n  ${bests.join("\n  ")}`);
}
