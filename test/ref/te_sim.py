"""Simulate a GUI sb_string with tellurium the way the Results tab does, but with the model's own best k's."""
import json, re, sys
import pandas as pd, tellurium as te
mech, csv, out = sys.argv[1], sys.argv[2], sys.argv[3]
sb = open(f"gui_out/models/{mech}/sb_string.txt").read()
best = pd.read_csv(f"gui_out/models/{mech}/k_result.csv").iloc[0].drop("RSS").to_dict()
df = pd.read_csv(csv)
for k, v in best.items():
    sb = re.sub(rf"\b{k}\s*=\s*[^ \n,]+", f"{k} = {v}", sb)
for c, v in df.loc[0].items():
    if c != "time" and not c.startswith("event") and not pd.isna(v):
        sb = re.sub(rf"^{c} = 0$", f"{c} = {v}", sb, flags=re.M)
if "event_1" in df.columns:
    sb = sb.replace("event_1 = 0", "event_1 = 1")
r = te.loada(sb)
r.integrator.relative_tolerance = 1e-10
r.integrator.absolute_tolerance = 1e-14
res = r.simulate(times=df["time"].tolist())
pd.DataFrame(res, columns=[c.strip("[]") for c in res.colnames]).to_csv(out, index=False)
