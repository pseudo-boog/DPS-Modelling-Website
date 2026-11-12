# COPASI optimizers for RE-ADD Modeler (web)

`copasi-opt.wasm` contains COPASI's own parameter-estimation methods, compiled to WebAssembly so the
web version of RE-ADD Modeler can run them in the browser. `copasi-opt.js` is the same module
converted to plain JavaScript (binaryen `wasm2js`) for browsers that do not allow WebAssembly.

## Where the code comes from
- `src/copasi/optimization/COptMethod*.{h,cpp}`, `COptPopulationMethod.*`, `CRandomSearch.*`, `CPraxis.*`,
  `CTruncatedNewton.*`, `CNL2SOL.*`, `src/copasi/randomGenerator/CIntervalValue.*`, `CPermutation.*`,
  `src/copasi/core/CVector.h`, `CMatrix.h`, `CFlags.h`, `CEnumAnnotation.h`, `CBidirectionalMap.h`,
  `src/copasi/utilities/CSort.h`, `CBrent.*`: unchanged copies of COPASI's sources, tag **Build-311**
  (COPASI 4.48.311, https://github.com/copasi/COPASI), except for the patch below.
  COPASI is distributed under the Artistic License 2.0 (`COPASI-license.txt`); the Praxis routines in
  `CPraxis.cpp` (John Burkardt's C++ version of Brent's PRAXIS) are under the GNU LGPL.
- Written for this build (replace COPASI's framework, which the optimizers otherwise need):
  `copasi/copasi.h`, `copasi/config.h`, `copasi/core/CCore.h`, `copasi/optimization/COptMethod.{h,cpp}`
  (evaluate()/setSolution() copied from COPASI), `COptItem.*`, `COptProblem.*`, `COptTask.h`, `COptLog*.h`,
  `copasi/utilities/CCopasiMethod.h`, `CCopasiMessage.h`, `CProcessReport.h`, `CMethodFactory.*`, `CProblemFactory.h`,
  `copasi/OpenMP/*`, `copasi/randomGenerator/CConfigurableRNG.h` (COPASI's default Mersenne Twister),
  `copasi/parameterFitting/CFitProblem.h`, `copasi/lapack/*`, `copasi/sbml/SBMLImporter.h`, `blas.cpp`
  (reference BLAS/LAPACK routines in reference operation order), `driver.cpp` (entry points).
- `patch_sources.py`: the only change to COPASI's files. WebAssembly here has no C++ exceptions, so
  `try`/`catch` blocks become plain blocks / `if (false)`, and the two places where COPASI stops
  Praxis / Truncated Newton with `throw bool(...)` call `host_stop()` instead (the host ends the run;
  COPASI's catch handlers do nothing else).

## Interface (driver.cpp)
The host provides `host_objective(x, n, residuals, m)` (weighted sum of squares, and the weighted
residuals when Levenberg-Marquardt / NL2SOL / Scatter Search ask for them), `host_report(x, n, value)`
(one row of COPASI's report = every improvement), `host_progress` and `host_stop`.
`run_estimation(method, n, lower, upper, start, randomize, nResiduals, seed, startSeed)` runs one
estimation with COPASI's method numbering (CTaskEnum::Method); `param_set(name, value)` sets COPASI
method options by their COPASI names ("Number of Generations", "Iteration Limit", ...).

## Checks
`xcheck.py` builds on python-copasi 4.48: the same sources compiled natively (`native/libcopasiopt.so`,
g++ / libstdc++) and driven by **COPASI's own objective** reproduce python-copasi's runs digit for digit
(objective to 10 significant digits; COPASI counts 2 extra evaluations for task set-up) for
Current Solution Statistics, Differential Evolution, SRES, Evolutionary Programming, Genetic Algorithm SR,
Hooke & Jeeves, Levenberg-Marquardt, Nelder-Mead, NL2SOL, Particle Swarm, Random Search, Scatter Search,
Steepest Descent and Truncated Newton. COPASI's own Genetic Algorithm and Praxis are not repeatable
between runs with a fixed seed (Praxis has no seed option); the port reproduced one of COPASI's GA runs.
In the browser the model is simulated by the web version's own solver, and random numbers come from
libc++ (as COPASI on macOS), so results are COPASI's algorithms but not bit-identical to a given COPASI run.

## Build
    pip install ziglang          # clang + wasi libc/libc++ for wasm32
    python3 patch_sources.py src/copasi   # already applied to the files in src/
    ./build.sh                   # -> copasi-opt.wasm
    npx -p binaryen@120.0.0 wasm2js --all-features -O2 copasi-opt.wasm -o raw.mjs
    python3 make_js_fallback.py raw.mjs copasi-opt.js
