// shim of copasi/copasi.h
#ifndef COPASI_copasi
#define COPASI_copasi
#include <assert.h>
#include <limits>
#include <cmath>
#include <string>
#include <vector>
#include <sstream>
#include <set>
#include <map>
#include <cstring>
#include <algorithm>
#include "copasi/utilities/CCopasiMessage.h"
#include <iostream>
#include <fstream>
#include "copasi/core/CCore.h"
using std::isnan;
#define pfree(p) {if (p) {free(p); p = NULL;}}
#define pdelete(p) {if (p) {delete p; p = NULL;}}
#define pdeletev(p) {if (p) {delete[] p; p = NULL;}}
#define pcleanup(p) {if (p) {p->cleanup(); delete p; p = NULL;}}
#define C_UNUSED(p)
#define COPASI_DEPRECATED
#define DEBUG_OUT(s)
#define CONSTRUCTOR_TRACE
#define DESTRUCTOR_TRACE
// functions the host (JavaScript) provides
#ifdef __wasm__
#define HOST_IMPORT(n) __attribute__((import_module("env"), import_name(n)))
#else
#define HOST_IMPORT(n)
#endif
#ifdef __wasm__
extern "C" HOST_IMPORT("host_objective") double host_objective(const double * x, int n, double * residuals, int nResiduals);
extern "C" HOST_IMPORT("host_report") void host_report(const double * x, int n, double value);
extern "C" HOST_IMPORT("host_progress") void host_progress(double current, double maximum);
extern "C" HOST_IMPORT("host_stop") void host_stop(); // ends the run (replaces COPASI's throw/catch stop)
#else // native build (tests): the host sets these function pointers with set_host()
extern "C" double (*host_objective)(const double * x, int n, double * residuals, int nResiduals);
extern "C" void (*host_report)(const double * x, int n, double value);
extern "C" void (*host_progress)(double current, double maximum);
extern "C" void host_stop();
#endif
#endif
