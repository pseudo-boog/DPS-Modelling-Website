"""Reference run of the real RE-ADD Modeler GUI (headless) for comparing the website engine.

Loads two CSVs, attaches re-additions from JSON to the first, adds the mechanisms from
ref_case.json, runs the COPASI fit from the Model tab, builds the Results tab and
computes statistics + F-tests. Everything the GUI writes is copied to ./gui_out.

usage (from test/ref): python gui_ref.py <repo/src> <case.json>
"""
import json
import os
import shutil
import sys
import time
import types

os.environ.setdefault("QT_QPA_PLATFORM", "offscreen")
src, case_file = os.path.abspath(sys.argv[1]), sys.argv[2]
case = json.load(open(case_file))

pkg_dir = os.path.join(src, "re_add_modeler")
sys.path.insert(0, src)
pkg = types.ModuleType("re_add_modeler")
pkg.__path__ = [pkg_dir]
sys.modules["re_add_modeler"] = pkg

import matplotlib  # noqa: E402
_mpl_use = matplotlib.use
def _use(backend, *a, **k):  # sandbox Python has no tkinter; okin asks for TkAgg
    try:
        return _mpl_use(backend, *a, **k)
    except ImportError:
        pass
matplotlib.use = _use

from PySide6.QtWidgets import QApplication, QDialog, QMessageBox, QPushButton  # noqa: E402

app = QApplication(sys.argv)
QDialog.exec_ = lambda self: QDialog.Accepted
QDialog.exec = lambda self: QDialog.Accepted
MESSAGES = []
for kind in ("critical", "warning", "information"):
    setattr(QMessageBox, kind, staticmethod(lambda *a, _k=kind, **k: MESSAGES.append((_k, a[1:3])) or QMessageBox.Ok))
QMessageBox.question = staticmethod(lambda *a, **k: QMessageBox.Yes)

code = open(os.path.join(pkg_dir, "__init__.py")).read().split("# this should go into the main.py")[0]
ns = {"__name__": "gui_ref"}
exec(compile(code, os.path.join(pkg_dir, "__init__.py"), "exec"), ns)

gui = ns["ReAddModelerGUI"](app)
gui.show()
app.processEvents()
dw, mw, rw = gui.data_window, gui.model_window, gui.result_window

for f in case["files"]:
    dw.csv_wgt.add_file(os.path.abspath(f))
    app.processEvents()

for row, f in enumerate(case["files"]):
    add = case["additions"].get(f)
    if not add:
        continue
    dw.csv_wgt.json_re_adds = json.load(open(add))
    btn = dw.csv_wgt.table.cellWidget(row, 1)
    assert isinstance(btn, QPushButton)
    btn.click()
    dw.csv_wgt.json_re_adds = None
    app.processEvents()

for m in case["mechanisms"]:
    dw.rct_wgt.set_reactions(m["reactions"])
    dw.rct_wgt.set_k_dict(m["k"])
    dw.rct_wgt.add_mechanism(m["name"])
    app.processEvents()

print("to_match:", mw.to_match_qle.text())
mw.gen_qle.setText(str(case["generations"]))
mw.pop_qle.setText(str(case["population"]))
t0 = time.time()
mw.run_copasi()
print(f"fit took {time.time() - t0:.1f}s; messages: {MESSAGES}")

gui.show_results_layout()
app.processEvents()
rw.get_f_test()
app.processEvents()

out = os.path.abspath("gui_out")
shutil.rmtree(out, ignore_errors=True)
shutil.copytree(dw.work_folder, out)
shutil.copytree(mw.COPASI_INPUT_PATH, os.path.join(out, "copasi_input_last_mechanism"))
print("results folder:", sorted(os.listdir(os.path.join(out, "results"))))
for m in case["mechanisms"]:
    import pandas as pd
    k = pd.read_csv(os.path.join(out, "models", m["name"], "k_result.csv"))
    print(m["name"], len(k), "rows; best:", k.iloc[0].to_dict())
