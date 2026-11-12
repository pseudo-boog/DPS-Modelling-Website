#!/usr/bin/env bash
# Builds copasi-opt.wasm (COPASI's parameter-estimation methods) with Zig's clang for wasm32-wasi.
set -euo pipefail
cd "$(dirname "$0")/src"
ZIG="${ZIG:-python3 -m ziglang}"
$ZIG c++ -target wasm32-wasi -std=c++20 -O2 -fno-exceptions -mexec-model=reactor -I. \
  driver.cpp blas.cpp copasi/optimization/*.cpp copasi/randomGenerator/*.cpp copasi/utilities/*.cpp \
  -Wl,--strip-all -Wl,-z,stack-size=1048576 -Wl,--initial-memory=4194304 -Wl,--growable-memory 2>/dev/null \
  -o ../copasi-opt.wasm || \
$ZIG c++ -target wasm32-wasi -std=c++20 -O2 -fno-exceptions -mexec-model=reactor -I. \
  driver.cpp blas.cpp copasi/optimization/*.cpp copasi/randomGenerator/*.cpp copasi/utilities/*.cpp \
  -Wl,--strip-all -Wl,-z,stack-size=1048576 -o ../copasi-opt.wasm
ls -la ../copasi-opt.wasm
