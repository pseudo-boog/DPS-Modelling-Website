"""Evaluate COPASI's own parameter-estimation objective at given parameter values.

Uses the .cps that pycotools built for the last fitted mechanism (Inhibition) and
COPASI's "Current Solution Statistics" method, i.e. no optimisation, just the
objective at the start values. Prints JSON: [{params, objective}, ...].
"""
import json
import sys

import COPASI

cps, params_file = sys.argv[1], sys.argv[2]
param_sets = json.load(open(params_file))

dm = COPASI.CRootContainer.addDatamodel()
assert dm.loadModel(cps), COPASI.CCopasiMessage.getAllMessageText()
task = dm.getTask("Parameter Estimation")
problem = task.getProblem()
items = [problem.getOptItem(i) for i in range(problem.getOptItemSize())]
names = []
for it in items:
    cn = it.getObjectCN().getString()
    names.append(cn.split("Values[")[1].split("]")[0])

task.setMethodType(COPASI.CTaskEnum.Method_Statistics)
problem.setCalculateStatistics(False)
problem.setRandomizeStartValues(False)

out = []
for ps in param_sets:
    for i, n in enumerate(names):
        items[i].setStartValue(float(ps[n]))
    assert task.initializeRaw(COPASI.CCopasiTask.OUTPUT_UI), COPASI.CCopasiMessage.getAllMessageText()
    task.processRaw(True)
    out.append({"params": {n: float(ps[n]) for n in names}, "objective": problem.getSolutionValue()})
    task.restore()

exps = problem.getExperimentSet()
info = []
for e in range(exps.getExperimentCount()):
    ex = exps.getExperiment(e)
    om = ex.getObjectMap()
    info.append({"file": ex.getFileNameOnly(), "weight_method": ex.getWeightMethod(), "rows": ex.getNumDataRows()})
print(json.dumps({"names": names, "results": out, "experiments": info}, indent=1))
