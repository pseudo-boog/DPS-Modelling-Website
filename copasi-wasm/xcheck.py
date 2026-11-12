"""Cross-check: COPASI's optimizer sources as built for the web (native build, libstdc++) driven by
COPASI's own objective (python-copasi) must reproduce python-copasi's own runs step for step.
usage: python xcheck.py libcopasiopt.so copasi_methods.json [Method ...]"""
import ctypes, json, sys, time
import COPASI

lib_path, ref_path = sys.argv[1], sys.argv[2]
only = sys.argv[3:]
ref = json.load(open(ref_path))
PARAMS = {r["method"]: None for r in ref}
CASES = {
    "Statistics": {}, "DifferentialEvolution": {"Number of Generations": 20, "Population Size": 20},
    "SRES": {"Number of Generations": 20, "Population Size": 20, "Pf": 0.475}, "EvolutionaryProgram": {"Number of Generations": 20, "Population Size": 20},
    "GeneticAlgorithm": {"Number of Generations": 20, "Population Size": 20}, "GeneticAlgorithmSR": {"Number of Generations": 20, "Population Size": 20, "Pf": 0.475},
    "HookeJeeves": {"Iteration Limit": 50, "Tolerance": 1e-5, "Rho": 0.2}, "LevenbergMarquardt": {"Iteration Limit": 50, "Tolerance": 1e-5},
    "NelderMead": {"Iteration Limit": 50, "Tolerance": 1e-5, "Scale": 10}, "NL2SOL": {"Iteration Limit": 50},
    "ParticleSwarm": {"Iteration Limit": 20, "Swarm Size": 20, "Std. Deviation": 1e-6}, "Praxis": {"Tolerance": 1e-5},
    "RandomSearch": {"Number of Iterations": 400}, "ScatterSearch": {"Number of Iterations": 10},
    "SteepestDescent": {"Iteration Limit": 50, "Tolerance": 1e-5}, "TruncatedNewton": {},
}
ID = {"Statistics": 1, "DifferentialEvolution": 3, "SRES": 4, "EvolutionaryProgram": 5, "GeneticAlgorithm": 6, "GeneticAlgorithmSR": 7, "HookeJeeves": 8,
      "LevenbergMarquardt": 9, "NelderMead": 10, "ParticleSwarm": 11, "Praxis": 12, "RandomSearch": 13, "ScatterSearch": 14, "SimulatedAnnealing": 15,
      "SteepestDescent": 16, "TruncatedNewton": 17, "NL2SOL": 18}
START = {"k1": 1.0, "k2": 100.0, "k3": 0.1, "k4": 10.0, "kN4": 10.0}

dm = COPASI.CRootContainer.addDatamodel()
assert dm.loadModel("inhibition_fit.cps")
task = dm.getTask("Parameter Estimation")
# evaluator: Levenberg-Marquardt with 0 iterations evaluates the start point and keeps its residuals
task.setMethodType(COPASI.CTaskEnum.Method_LevenbergMarquardt)
task.getMethod().getParameter("Iteration Limit").setUIntValue(0)
problem = task.getProblem()
problem.setRandomizeStartValues(False)
problem.setCalculateStatistics(False)
items = [problem.getOptItem(i) for i in range(problem.getOptItemSize())]
names = [it.getObjectCN().getString().split("Values[")[1].split("]")[0] for it in items]
n = len(items)
nres = None

def copasi_eval(xs):
    for it, v in zip(items, xs):
        it.setStartValue(v)
    assert task.initializeRaw(COPASI.CCopasiTask.OUTPUT_UI)
    task.processRaw(True)
    value = problem.getSolutionValue()
    res = problem.getResiduals()
    r = [res.get(i) for i in range(res.size())]
    task.restore()
    return value, r

problem.setResidualsRequired(True)
import os, struct
def safe_eval(xs):
    """COPASI itself dies with SIGFPE for some parameter sets (e.g. all rates ~1e-3); evaluate in a fork."""
    rfd, wfd = os.pipe()
    pid = os.fork()
    if pid == 0:
        os.close(rfd)
        try:
            v, r = copasi_eval(xs)
            os.write(wfd, struct.pack(f"<di{len(r)}d", v, len(r), *r))
        finally:
            os._exit(0)
    os.close(wfd)
    data = b""
    while True:
        chunk = os.read(rfd, 1 << 16)
        if not chunk: break
        data += chunk
    os.close(rfd)
    os.waitpid(pid, 0)
    if len(data) < 12:
        state["crashed"] = state.get("crashed", 0) + 1
        return float("inf"), []
    v, k = struct.unpack("<di", data[:12])
    return v, list(struct.unpack(f"<{k}d", data[12:12 + 8 * k]))
v0, r0 = copasi_eval([START[k] for k in names])
nres = len(r0)
print(f"objective at start {v0:.10e}, {nres} residuals, sum r^2 = {sum(x*x for x in r0):.10e}")

lib = ctypes.CDLL(lib_path)
OBJ = ctypes.CFUNCTYPE(ctypes.c_double, ctypes.POINTER(ctypes.c_double), ctypes.c_int, ctypes.POINTER(ctypes.c_double), ctypes.c_int)
REP = ctypes.CFUNCTYPE(None, ctypes.POINTER(ctypes.c_double), ctypes.c_int, ctypes.c_double)
PRO = ctypes.CFUNCTYPE(None, ctypes.c_double, ctypes.c_double)
state = {"evals": 0, "best": float("inf")}
libm = ctypes.CDLL("libm.so.6")
def obj(xp, nx, rp, m):
    state["evals"] += 1
    libm.feclearexcept(0x3d)
    v, r = safe_eval([xp[i] for i in range(nx)])
    if rp:
        for i in range(min(m, len(r))):
            rp[i] = r[i]
    return v
def rep(xp, nx, v):
    state["best"] = min(state["best"], v)
cb = (OBJ(obj), REP(rep), PRO(lambda a, b: None))
lib.set_host(*cb)
lib.param_set.argtypes = [ctypes.c_char_p, ctypes.c_double]
lib.run_estimation.argtypes = [ctypes.c_int, ctypes.c_int, ctypes.POINTER(ctypes.c_double), ctypes.POINTER(ctypes.c_double), ctypes.POINTER(ctypes.c_double), ctypes.c_int, ctypes.c_int, ctypes.c_uint, ctypes.c_uint]
Arr = ctypes.c_double * n
for row in ref:
    method = row["method"]
    if method not in CASES or (only and method not in only):
        continue
    lib.params_clear()
    for k, v in CASES[method].items():
        lib.param_set(k.encode(), float(v))
    state.update(evals=0, best=float("inf"), crashed=0)
    t0 = time.time()
    rc = lib.run_estimation(ID[method], n, Arr(*[1e-6] * n), Arr(*[1e6] * n), Arr(*[START[k] for k in names]), 0, nres, row["seed"], row["seed"])
    same = abs(state["best"] - row["value"]) <= 1e-9 * abs(row["value"])
    print(f"{'SAME' if same else 'DIFF'}  {method:22s} seed {row['seed']}: web code {state['best']:.10e} ({state['evals']} ev, {state['crashed']} COPASI crashes)   COPASI {row['value']:.10e} ({row['evals']} ev)  {time.time()-t0:.0f}s", flush=True)
