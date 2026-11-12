// Runs COPASI's own parameter-estimation methods, compiled to WebAssembly (copasi-opt.wasm).
// Each run gets a fresh instance, so a run that ends early (host_stop) leaves nothing behind.

/**
 * COPASI's parameter-estimation methods. `params` are the settings the desktop GUI passes (through
 * pycotools, with its settings file's values as defaults); `extra` are COPASI's other options,
 * left at COPASI's defaults unless changed.
 */
export const METHODS = [
  { id: "current_solution_statistics", copasi: 1, name: "Current Solution Statistics", group: "No optimization", params: [], extra: [] },
  { id: "differential_evolution", copasi: 3, name: "Differential Evolution", group: "Global", params: ["Number of Generations", "Population Size"], extra: ["Mutation Variance", "Stop after # Stalled Generations"] },
  { id: "evolutionary_strategy_sr", copasi: 4, name: "Evolution Strategy (SRES)", group: "Global", params: ["Number of Generations", "Population Size", "Pf"], extra: ["Stop after # Stalled Generations"] },
  { id: "evolutionary_program", copasi: 5, name: "Evolutionary Programming", group: "Global", params: ["Number of Generations", "Population Size"], extra: ["Stop after # Stalled Generations"] },
  { id: "genetic_algorithm", copasi: 6, name: "Genetic Algorithm", group: "Global", params: ["Number of Generations", "Population Size"], extra: ["Mutation Variance", "Stop after # Stalled Generations"] },
  { id: "genetic_algorithm_sr", copasi: 7, name: "Genetic Algorithm SR", group: "Global", params: ["Number of Generations", "Population Size", "Pf"], extra: ["Mutation Variance", "Stop after # Stalled Generations"] },
  { id: "hooke_jeeves", copasi: 8, name: "Hooke & Jeeves", group: "Local", params: ["Iteration Limit", "Tolerance", "Rho"], extra: [] },
  { id: "levenberg_marquardt", copasi: 9, name: "Levenberg - Marquardt", group: "Local", params: ["Iteration Limit", "Tolerance"], extra: ["Initial Lambda", "Lambda Decrease", "Lambda Increase", "Modulation", "Stop after # stalled iterations"] },
  { id: "nelder_mead", copasi: 10, name: "Nelder - Mead", group: "Local", params: ["Iteration Limit", "Tolerance", "Scale"], extra: [] },
  { id: "nl2sol", copasi: 18, name: "NL2SOL", group: "Local", params: [], extra: ["Iteration Limit"], defaults: { "Iteration Limit": 2000 } },
  { id: "particle_swarm", copasi: 11, name: "Particle Swarm", group: "Global", params: ["Iteration Limit", "Swarm Size", "Std. Deviation"], extra: ["Stop after # Stalled Iterations"] },
  { id: "praxis", copasi: 12, name: "Praxis", group: "Local", params: ["Tolerance"], extra: [] },
  { id: "random_search", copasi: 13, name: "Random Search", group: "Global", params: ["Number of Iterations"], extra: [] },
  { id: "scatter_search", copasi: 14, name: "Scatter Search", group: "Global", params: ["Number of Iterations"], extra: ["Stop after # Stalled Generations"], defaults: { "Number of Iterations": 200 } },
  { id: "simulated_annealing", copasi: 15, name: "Simulated Annealing", group: "Global", params: ["Start Temperature", "Cooling Factor", "Tolerance"], extra: [] },
  { id: "steepest_descent", copasi: 16, name: "Steepest Descent", group: "Local", params: ["Iteration Limit", "Tolerance"], extra: [] },
  { id: "truncated_newton", copasi: 17, name: "Truncated Newton", group: "Local", params: [], extra: [] },
];

/** Every COPASI method option: default (desktop settings file, else COPASI), whole number?, minimum. */
export const PARAMS = {
  "Number of Generations": { def: 50, int: true, min: 1 },
  "Population Size": { def: 50, int: true, min: 2 },
  Pf: { def: 0.475, min: 0, max: 1 },
  "Iteration Limit": { def: 50, int: true, min: 1 },
  Tolerance: { def: 1e-5, min: 0 },
  Rho: { def: 0.2, min: 0, max: 1 },
  Scale: { def: 10, min: 0 },
  "Swarm Size": { def: 50, int: true, min: 1 },
  "Std. Deviation": { def: 1e-6, min: 0 },
  "Number of Iterations": { def: 100000, int: true, min: 1 },
  "Start Temperature": { def: 1, min: 0 },
  "Cooling Factor": { def: 0.85, min: 0, max: 1 },
  "Mutation Variance": { def: 0.1, min: 0 },
  "Stop after # Stalled Generations": { def: 0, int: true, min: 0 },
  "Stop after # Stalled Iterations": { def: 0, int: true, min: 0 },
  "Stop after # stalled iterations": { def: 0, int: true, min: 0 },
  "Initial Lambda": { def: 1, min: 0 },
  "Lambda Decrease": { def: 2, min: 0 },
  "Lambda Increase": { def: 4, min: 0 },
  Modulation: { def: 1e-3, min: 0 },
};
export const paramDefault = (method, name) => (method.defaults && name in method.defaults ? method.defaults[name] : PARAMS[name].def);

/** Simulations one run needs, when COPASI's settings fix it (population methods), else null. */
export function evaluationsPerRun(method, values) {
  const v = (n) => Number(values[n]);
  switch (method.id) {
    case "genetic_algorithm": case "genetic_algorithm_sr": case "evolutionary_program": case "evolutionary_strategy_sr": case "differential_evolution":
      return v("Population Size") * v("Number of Generations");
    case "particle_swarm": return v("Swarm Size") * v("Iteration Limit");
    case "random_search": return v("Number of Iterations");
    case "current_solution_statistics": return 1;
    default: return null;
  }
}
export const methodById = (id) => METHODS.find((m) => m.id === id);

/** Thrown (from JavaScript, through the WebAssembly frames) to end a run, like COPASI's internal stop. */
class StopRun extends Error {}

/**
 * Loads the COPASI module: WebAssembly when the browser allows it, else the plain-JavaScript copy
 * (copasi-opt.js, same code, slower). Returns a WebAssembly.Module or {instantiate}.
 */
export async function loadCopasiModule(url, { allowWasm = true } = {}) {
  if (allowWasm && typeof WebAssembly === "object") {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`could not load ${url} (${res.status})`);
      return await WebAssembly.compile(await res.arrayBuffer());
    } catch (e) { /* e.g. a page policy without 'wasm-unsafe-eval': use the JavaScript copy */ }
  }
  const js = await import(new URL("./copasi-opt.js", url).href);
  return { instantiate: js.instantiate };
}

/**
 * One parameter estimation.
 * opts: {method (COPASI number), lower[], upper[], start[], randomizeStart, nResiduals, seed, startSeed, params: {name: value}}
 * objective(x: Float64Array, residuals: Float64Array|null) -> value
 * onReport(x: number[], value) for every row COPASI writes to the report; onProgress(current, max)
 * Returns {status, start: number[], evaluations}.
 */
export function runEstimation(module, opts, objective, onReport, onProgress = () => {}) {
  let mem = null, evaluations = 0;
  const n = opts.start.length, m = opts.nResiduals;
  const x = new Float64Array(n), r = new Float64Array(Math.max(1, m));
  const f64 = (ptr, len) => new Float64Array(mem.buffer, ptr, len);
  const u32 = (ptr) => new Uint32Array(mem.buffer, ptr, 1);
  const wasi = {
    fd_write: (fd, iovs, iovsLen, nwritten) => { let t = 0; const v = new Uint32Array(mem.buffer, iovs, iovsLen * 2); for (let i = 0; i < iovsLen; i++) t += v[2 * i + 1]; u32(nwritten)[0] = t; return 0; },
    fd_close: () => 0, fd_seek: () => 0, fd_read: (fd, iovs, iovsLen, nread) => { u32(nread)[0] = 0; return 0; },
    fd_fdstat_get: () => 0, environ_get: () => 0,
    environ_sizes_get: (count, size) => { u32(count)[0] = 0; u32(size)[0] = 0; return 0; },
    proc_exit: (code) => { throw new Error(`COPASI code exited (${code})`); },
  };
  const env = {
    host_objective(xPtr, nx, rPtr, nr) {
      evaluations++;
      x.set(f64(xPtr, nx));
      const want = rPtr !== 0 && nr > 0;
      const value = objective(x, want ? r : null);
      if (want) f64(rPtr, nr).set(r.subarray(0, nr));
      return value;
    },
    host_report(xPtr, nx, value) { onReport(Array.from(f64(xPtr, nx)), value); },
    host_progress(cur, max) { onProgress(cur, max); },
    host_stop() { throw new StopRun(); },
  };
  const imports = { env, wasi_snapshot_preview1: wasi };
  const E = module.instantiate ? module.instantiate(imports) : new WebAssembly.Instance(module, imports).exports;
  mem = E.memory;
  E._initialize();
  const enc = new TextEncoder();
  E.params_clear();
  for (const [name, value] of Object.entries(opts.params || {})) {
    const bytes = enc.encode(name + "\0");
    const p = E.mem_alloc(bytes.length);
    new Uint8Array(mem.buffer, p, bytes.length).set(bytes);
    E.param_set(p, Number(value));
    E.mem_free(p);
  }
  const lo = E.mem_alloc(8 * n), hi = E.mem_alloc(8 * n), st = E.mem_alloc(8 * n);
  f64(lo, n).set(opts.lower); f64(hi, n).set(opts.upper); f64(st, n).set(opts.start);
  let status;
  try {
    status = E.run_estimation(opts.method, n, lo, hi, st, opts.randomizeStart ? 1 : 0, m, opts.seed >>> 0, opts.startSeed >>> 0);
  } catch (e) {
    if (!(e instanceof StopRun)) throw e;
    status = 0; // the method decided it was done (COPASI's internal stop)
  }
  const start = Array.from(f64(st, n));
  return { status, start, evaluations };
}
