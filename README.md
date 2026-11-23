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
- **Results**: data vs. model with an error band, fitted constants, every reported fit (`k_result.csv`), model
  selection by BIC across all fitted mechanisms, per-file statistics (SSE, R², adjusted R², χ², reduced χ²) and
  F-tests against the mechanism named `base`.

## Model selection (BIC)
The Results tab ranks every fitted mechanism by the Bayesian information criterion, BIC = k ln N − 2 ln L (lower wins):
- N is every data point of the training files for the species picked in Statistics, and k is the mechanism's number of
  fitted constants, counted once (not once per species).
- By default the noise of each species is estimated from that mechanism's residuals (σ_s² = SSE_s/n_s), which gives
  BIC = Σ_s n_s(ln(2π·SSE_s/n_s) + 1) + k ln N. An extra step pays for itself only if it lowers the SSE by more than
  its k ln N penalty. A *Noise σ* box takes a known measurement noise instead (in the data's units); a σ much larger than
  the real noise makes every mechanism fit "equally well" and BIC then picks the one with the fewest constants.
- ΔBIC to the best mechanism, BIC weights exp(−ΔBIC/2)/Σ, and the Kass & Raftery evidence scale (0–2 weak, 2–6
  positive, 6–10 strong, >10 very strong) are shown and saved as `results/model_selection.json`.
- SSE always falls when a mechanism gains steps, so compare mechanisms with BIC (or the F-test), not SSE alone.
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
  and model selection uses BIC over all training data instead of the per-file AIC.
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

## Updating the live site
GitHub Pages serves the `gh-pages` branch. After committing to `main`, publish with
`git push origin main main:gh-pages` (or switch **Settings → Pages** to serve `main` and delete `gh-pages`).
The page loads in about a minute after a push; visitors may need a reload to get the new version.

## License
MIT for the web app (see `LICENSE`, which also credits the original RE-ADD Modeler by Finn Bork). COPASI code:
Artistic License 2.0 (PRAXIS routines: LGPL). Bundled libraries in `vendor/`: htm/Preact, plotly.js, JSZip.
