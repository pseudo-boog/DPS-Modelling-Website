// Background worker: runs independent COPASI parameter estimations (COPASI's own optimizer code,
// compiled to WebAssembly) against the browser's model simulation.
// Messages in:  {type: "run", job}
// Messages out: {type: "ready", wasm} | {type: "progress", id, frac, best}
//               {type: "done", id, history, evals} | {type: "error", id, message}
import { loadCopasiModule } from "./copasi.js";
import { runJob } from "./runner.js";

let copasi = null;

self.onmessage = (e) => {
  const m = e.data;
  if (m.type !== "run") return;
  try {
    const out = runJob(m.job, copasi, (msg) => self.postMessage(msg));
    self.postMessage({ type: "done", id: m.job.id, history: out.history, evals: out.evals });
  } catch (err) {
    self.postMessage({ type: "error", id: m.job.id, message: String((err && err.message) || err) });
  }
};

loadCopasiModule(new URL("./copasi-opt.wasm", import.meta.url))
  .then((mod) => { copasi = mod; self.postMessage({ type: "ready", wasm: true }); })
  .catch(() => self.postMessage({ type: "ready", wasm: false }));
