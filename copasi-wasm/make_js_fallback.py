"""Turns wasm2js output (binaryen: wasm2js --all-features -O2 copasi-opt.wasm -o raw.mjs) into
copasi-opt.js, a plain-JavaScript copy of the COPASI module for browsers that refuse WebAssembly.
It exports instantiate(imports) -> the same exports as the wasm instance."""
import re, sys
src, out = sys.argv[1], sys.argv[2]
s = open(src).read()
s = re.sub(r"^import \* as \w+ from '[^']+';\n", "", s, flags=re.M)
cut = s.index("var retasmFunc = asmFunc(")
s = s[:cut] + "export function instantiate(imports) { return asmFunc(imports); }\n"
open(out, "w").write("// COPASI's optimizers (copasi-opt.wasm) converted to JavaScript with binaryen's wasm2js.\n" + s)
