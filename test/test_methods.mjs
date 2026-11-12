// Every COPASI method, compiled to WebAssembly, on the reference Inhibition fit from the same
import { fileURLToPath } from "node:url";
// start values as ref/copasi_methods.py; prints our result next to real COPASI's.
import fs from "node:fs";
import * as E from "../engine.js";
import { runEstimation } from "../copasi.js";
const REF = fileURLToPath(new URL("./ref", import.meta.url));
const files = ["exp1.csv", "exp2.csv"].map((f) => ({ name: f, table: E.parseCsv(fs.readFileSync(`${REF}/${f}`, "utf8"), f) }));
const prep = E.prepareReAdditions(E.parsePyJson(fs.readFileSync(`${REF}/exp1_re_add.json`, "utf8")), 0);
const rx = ["A + cat -> cat1", "cat1 + B -> cat2", "cat2 -> P + cat", "B + cat -> catI"];
const mech = E.makeMechanism("Inhibition", rx.map((r, i) => ({ rct: r, k: "", kN: i < 3 ? "$0" : "" })));
const prob = E.buildProblem(mech, files, [{ file: "exp1.csv", events: prep.events }], ["A", "B", "P"]);
const obj = E.createObjective(prob);
const nRes = E.countResiduals(prob);
const START = { k1: 1, k2: 100, k3: 0.1, k4: 10, kN4: 10 };
const ID = { Statistics: 1, DifferentialEvolution: 3, SRES: 4, EvolutionaryProgram: 5, GeneticAlgorithm: 6, GeneticAlgorithmSR: 7, HookeJeeves: 8, LevenbergMarquardt: 9, NelderMead: 10, ParticleSwarm: 11, Praxis: 12, RandomSearch: 13, ScatterSearch: 14, SimulatedAnnealing: 15, SteepestDescent: 16, TruncatedNewton: 17, NL2SOL: 18 };
const PARAMS = {
  DifferentialEvolution: { "Number of Generations": 20, "Population Size": 20 }, SRES: { "Number of Generations": 20, "Population Size": 20, Pf: 0.475 },
  EvolutionaryProgram: { "Number of Generations": 20, "Population Size": 20 }, GeneticAlgorithm: { "Number of Generations": 20, "Population Size": 20 },
  GeneticAlgorithmSR: { "Number of Generations": 20, "Population Size": 20, Pf: 0.475 }, HookeJeeves: { "Iteration Limit": 50, Tolerance: 1e-5, Rho: 0.2 },
  LevenbergMarquardt: { "Iteration Limit": 50, Tolerance: 1e-5 }, NelderMead: { "Iteration Limit": 50, Tolerance: 1e-5, Scale: 10 }, NL2SOL: { "Iteration Limit": 50 },
  ParticleSwarm: { "Iteration Limit": 20, "Swarm Size": 20, "Std. Deviation": 1e-6 }, Praxis: { Tolerance: 1e-5 }, RandomSearch: { "Number of Iterations": 400 },
  ScatterSearch: { "Number of Iterations": 10 }, SimulatedAnnealing: { "Start Temperature": 1, "Cooling Factor": 0.85, Tolerance: 1e-3 },
  SteepestDescent: { "Iteration Limit": 50, Tolerance: 1e-5 }, TruncatedNewton: {}, Statistics: {},
};
const ref = JSON.parse(fs.readFileSync(`${REF}/copasi_methods.json`, "utf8"));
const mod = await WebAssembly.compile(fs.readFileSync(new URL("../copasi-opt.wasm", import.meta.url)));
const only = process.argv.slice(2);
const n = prob.fit.length;
for (const method of Object.keys(PARAMS)) {
  if (only.length && !only.includes(method)) continue;
  const mine = [];
  for (const seed of method in { Statistics: 1, HookeJeeves: 1, LevenbergMarquardt: 1, NelderMead: 1, NL2SOL: 1, Praxis: 1, SteepestDescent: 1, TruncatedNewton: 1 } ? [1] : method === "SimulatedAnnealing" || method === "ScatterSearch" ? [1, 2] : [1, 2, 3]) {
    let best = Infinity, rows = 0;
    const t0 = performance.now();
    const res = runEstimation(mod, { method: ID[method], lower: Array(n).fill(1e-6), upper: Array(n).fill(1e6), start: prob.fit.map((k) => START[k]), randomizeStart: false, nResiduals: nRes, seed, startSeed: seed, params: PARAMS[method] },
      obj, (x, v) => { rows++; if (v < best) best = v; });
    mine.push(`${best.toExponential(3)} (${res.evaluations} ev, ${rows} rows, ${((performance.now() - t0) / 1000).toFixed(1)}s)`);
  }
  const theirs = ref.filter((r) => r.method === method).map((r) => `${r.value.toExponential(3)} (${r.evals} ev)`);
  console.log(`${method.padEnd(22)} web:    ${mine.join("  ")}\n${"".padEnd(22)} COPASI: ${theirs.join("  ")}`);
}
