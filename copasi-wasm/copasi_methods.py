"""Run every COPASI parameter-estimation method on the reference Inhibition fit from fixed start values.
usage: python copasi_methods.py inhibition_fit.cps out.json"""
import json, sys, time
import COPASI

CASES = [  # (COPASI method, parameters, seeds)
    ("Statistics", {}, [1]),
    ("DifferentialEvolution", {"Number of Generations": 20, "Population Size": 20}, [1, 2, 3]),
    ("SRES", {"Number of Generations": 20, "Population Size": 20, "Pf": 0.475}, [1, 2, 3]),
    ("EvolutionaryProgram", {"Number of Generations": 20, "Population Size": 20}, [1, 2, 3]),
    ("GeneticAlgorithm", {"Number of Generations": 20, "Population Size": 20}, [1, 2, 3]),
    ("GeneticAlgorithmSR", {"Number of Generations": 20, "Population Size": 20, "Pf": 0.475}, [1, 2, 3]),
    ("HookeJeeves", {"Iteration Limit": 50, "Tolerance": 1e-5, "Rho": 0.2}, [1]),
    ("LevenbergMarquardt", {"Iteration Limit": 50, "Tolerance": 1e-5}, [1]),
    ("NelderMead", {"Iteration Limit": 50, "Tolerance": 1e-5, "Scale": 10}, [1]),
    ("NL2SOL", {"Iteration Limit": 50}, [1]),
    ("ParticleSwarm", {"Iteration Limit": 20, "Swarm Size": 20, "Std. Deviation": 1e-6}, [1, 2, 3]),
    ("Praxis", {"Tolerance": 1e-5}, [1]),
    ("RandomSearch", {"Number of Iterations": 400}, [1, 2, 3]),
    ("ScatterSearch", {"Number of Iterations": 10}, [1, 2]),
    ("SimulatedAnnealing", {"Start Temperature": 1, "Cooling Factor": 0.85, "Tolerance": 1e-3}, [1, 2]),
    ("SteepestDescent", {"Iteration Limit": 50, "Tolerance": 1e-5}, [1]),
    ("TruncatedNewton", {}, [1]),
]
START = {"k1": 1.0, "k2": 100.0, "k3": 0.1, "k4": 10.0, "kN4": 10.0}

cps, out_file = sys.argv[1], sys.argv[2]
only = sys.argv[3:] or None
dm = COPASI.CRootContainer.addDatamodel()
assert dm.loadModel(cps)
task = dm.getTask("Parameter Estimation")
results = []
for method, params, seeds in CASES:
    if only and method not in only:
        continue
    for seed in seeds:
        task.setMethodType(getattr(COPASI.CTaskEnum, "Method_" + method))
        problem = task.getProblem()
        problem.setRandomizeStartValues(False)
        problem.setCalculateStatistics(False)
        names = []
        for i in range(problem.getOptItemSize()):
            it = problem.getOptItem(i)
            n = it.getObjectCN().getString().split("Values[")[1].split("]")[0]
            names.append(n)
            it.setStartValue(START[n])
        m = task.getMethod()
        for k, v in params.items():
            p = m.getParameter(k)
            assert p is not None, (method, k)
            if p.getType() in (COPASI.CCopasiParameter.Type_UINT, COPASI.CCopasiParameter.Type_INT):
                p.setIntValue(int(v)) if p.getType() == COPASI.CCopasiParameter.Type_INT else p.setUIntValue(int(v))
            else:
                p.setDblValue(float(v))
        for k, v in (("Random Number Generator", 1), ("Seed", seed)):
            p = m.getParameter(k)
            if p is not None:
                p.setUIntValue(v)
        t0 = time.time()
        assert task.initializeRaw(COPASI.CCopasiTask.OUTPUT_UI), COPASI.CCopasiMessage.getAllMessageText()
        task.processRaw(True)
        value = problem.getSolutionValue()
        sv = problem.getSolutionVariables(); sol = [sv.get(i) for i in range(sv.size())]
        evals = problem.getFunctionEvaluations()
        task.restore()
        row = {"method": method, "seed": seed, "value": value, "evals": evals, "x": dict(zip(names, sol)), "seconds": round(time.time() - t0, 2)}
        results.append(row)
        print(json.dumps(row), flush=True)
json.dump(results, open(out_file, "w"), indent=1)
