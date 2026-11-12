# RE-ADD Modeler (web)

**Open it: https://pseudo-boog.github.io/DPS-Modelling-Website/** (nothing to install)

A browser version of the [RE-ADD Modeler](https://gitlab.com/heingroup/re_add_modeler) desktop app:
fit kinetic mechanisms to reaction time courses that include re-additions (species added part-way through a run),
then compare the mechanisms. Everything runs in your browser; your files are never uploaded.

## What it does
- **Data**: drop time-course `.csv`/`.txt` files (a `time` column plus one column per species), add re-additions per file
  (from the same JSON the desktop app uses, or by hand), drop outlier points, and write mechanisms as reactions
  (`A + cat -> cat1`, `k`/`kN` start values, `$0` to fix a constant). `model.json` files from the desktop app load directly.
- **Model**: shows the Antimony model sent to COPASI (identical to the desktop app's `sb_string.txt`) and fits every
  mechanism with any of COPASI's 17 parameter-estimation methods: Current Solution Statistics, Differential Evolution,
  Evolution Strategy (SRES), Evolutionary Programming, Genetic Algorithm, Genetic Algorithm SR, Hooke & Jeeves,
  Levenberg-Marquardt, Nelder-Mead, NL2SOL, Particle Swarm, Praxis, Random Search, Scatter Search, Simulated Annealing,
  Steepest Descent and Truncated Newton. Each fit runs copy_number × pe_number (default 3 × 10) independent estimations
  in parallel background workers.
- **Results**: data vs. model with an error band, fitted constants, every reported fit (`k_result.csv`), statistics
  (SSE, R², adjusted R², χ², reduced χ², BIC, log-likelihood) and F-tests against the mechanism named `base`.
- **Sessions**: *Save session* writes a zip with the desktop app's `output/<date>` layout (`time_courses/`, `models/`,
  `results/`); *Open session* reads it back, or a zipped desktop `output/<date>` folder.

## How it relates to the desktop app
- Same model building (okin rules), same re-addition events, same COPASI fitting problem (initial values from the first
  data row, mean-squared weights normalised per experiment) and the same statistics code, ported to JavaScript.
- The optimizers are **COPASI's own source code** (COPASI 4.48) compiled to WebAssembly, see [`copasi-wasm/`](copasi-wasm/).
  The model is simulated by this page's stiff solver (Rodas4) instead of COPASI's LSODA, so results match COPASI's
  closely but not digit for digit.
- Differences on purpose: statistics use each model's own fitted constants (the desktop app reused the displayed model's),
  the model always includes the current re-additions, the manual re-addition form works, F-tests show p values,
  and BIC = k ln(n) − 2 ln L is reported instead of AIC.
- Not included: ChemDraw (`.cdxml`) reaction import.

## Checks
`node test/test_engine.mjs` compares against reference output of the real desktop app and COPASI in `test/ref/`
(model text, simulations, COPASI's objective, statistics, F-tests). `node test/test_methods.mjs` runs every optimizer
next to real COPASI's results; `copasi-wasm/xcheck.py` shows that, driven by COPASI's own objective, the compiled
optimizers reproduce python-copasi 4.48 runs to 10 digits.

## Hosting your own copy
It is a static site: serve this folder from any web server (GitHub Pages here), or locally with
`python3 -m http.server` and open http://localhost:8000. No build step; `copasi-opt.wasm` is prebuilt
(rebuild instructions in `copasi-wasm/README.md`).

## License
MIT for the web app (see `LICENSE`, which also credits the original RE-ADD Modeler by Finn Bork). COPASI code:
Artistic License 2.0 (PRAXIS routines: LGPL). Bundled libraries in `vendor/`: htm/Preact, plotly.js, JSZip.
