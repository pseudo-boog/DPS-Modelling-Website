"""Patches applied to COPASI's own sources for the WebAssembly build (no C++ exceptions there).
COPASI stops Praxis / Truncated Newton by throwing a bool that optimise() catches; here the
host ends the run instead (host_stop), which has the same effect: the solution reported so far stands."""
import re, sys, pathlib
root = pathlib.Path(sys.argv[1])  # the copasi/ folder
for p in sorted(list(root.rglob("*.cpp")) + list(root.rglob("*.h"))):
    if p.name == "CEnumAnnotation.h":
        continue
    name = str(p.relative_to(root))
    s = p.read_text()
    s = re.sub(r"throw bool\([^)]*\);", "host_stop();", s)
    s = re.sub(r"\btry\b(\s*\{)", r"\1", s)
    s = re.sub(r"\bcatch\s*\([^)]*\)", "if (false)", s)
    if s != p.read_text():
        p.write_text(s)
        print("patched", name)
