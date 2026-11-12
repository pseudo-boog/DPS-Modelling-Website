// One parameter-estimation run (used by worker.js, and by the page itself when workers are unavailable).
import { createObjective, gaIterator, createRng } from "./engine.js";
import { runEstimation } from "./copasi.js";

let cached = { key: null, objective: null };

/** Runs `job`; `post` receives progress messages. Returns {history, evals}. */
export function runJob(job, module, post) {
  const { id, problem, solver, problemKey } = job;
  if (cached.key !== problemKey || !cached.objective) cached = { key: problemKey, objective: createObjective(problem, solver) };
  const objective = cached.objective;
  const history = [];
  let best = Infinity, last = null, lastPost = 0;
  const progress = (frac) => {
    const now = Date.now();
    if (now - lastPost > 150) { post({ type: "progress", id, frac, best }); lastPost = now; }
  };
  if (!module) { // COPASI module unavailable: only the genetic algorithm has a JavaScript version
    if (job.methodId !== "genetic_algorithm") throw new Error("the COPASI optimizer module could not be loaded in this browser");
    const it = gaIterator(objective, job.lower.length, job.ga, createRng(job.seed));
    let step = it.next();
    while (!step.done) { best = Math.min(best, step.value.best); progress(step.value.gen / step.value.generations); step = it.next(); }
    return { history: step.value.history, evals: step.value.evals };
  }
  const res = runEstimation(module, job, objective,
    (values, value) => { // one row of COPASI's report
      if (last && last.value === value && last.values.every((v, i) => v === values[i])) return;
      last = { values, value };
      history.push({ values, objective: value });
      if (value < best) best = value;
      progress(null);
    },
    (current, maximum) => progress(maximum > 0 ? current / maximum : null));
  return { history, evals: res.evaluations };
}

