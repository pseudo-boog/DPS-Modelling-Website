# Tests

Run from the repository root with Node 18 or later:

    node test/test_engine.mjs      # model text, simulation, objective, statistics vs. the desktop app + COPASI
    node test/test_methods.mjs     # every COPASI method (compiled) next to real COPASI results
    node test/test_jsfallback.mjs  # the JavaScript copy of the optimizers gives the same results as the WebAssembly one
    node test/test_ga.mjs [runs gens pop seed]
    node test/make_example.mjs     # rebuilds example.js (the example session)

`ref/` holds the reference case: simulated data (`exp1.csv` with two re-additions in `exp1_re_add.json`, `exp2.csv`),
the output of the real desktop app for it (`gui_out/`, made by `gui_ref.py` with `ref_case.json`), tellurium curves
(`te_sim.py`), COPASI objective values (`copasi_objective.py` on `inhibition_fit.cps`) and COPASI runs of every method
(`../copasi-wasm/copasi_methods.py` -> `copasi_methods.json`).
