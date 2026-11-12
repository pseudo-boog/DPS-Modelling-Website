// Entry point for the browser: runs one COPASI parameter estimation.
// The host (JavaScript) supplies host_objective (weighted sum of squares + residuals),
// host_report (one row of the COPASI report per improvement) and host_progress.
#include <cstdlib>
#include <cstring>
#include <map>
#include <string>
#include <vector>
#include "copasi/optimization/COptMethod.h"
#include "copasi/optimization/COptProblem.h"
#include "copasi/optimization/COptTask.h"
#include "copasi/utilities/CMethodFactory.h"
#include "copasi/randomGenerator/CConfigurableRNG.h"

#ifdef __wasm__
#define EXPORT(name) __attribute__((export_name(name)))
#else
#define EXPORT(name)
#endif

static std::map< std::string, double > gParams;

#ifndef __wasm__
struct StopRun {};
extern "C" {
double (*host_objective)(const double *, int, double *, int) = nullptr;
void (*host_report)(const double *, int, double) = nullptr;
void (*host_progress)(double, double) = nullptr;
void host_stop() { throw StopRun(); }
void set_host(double (*objective)(const double *, int, double *, int), void (*report)(const double *, int, double), void (*progress)(double, double))
{
  host_objective = objective; host_report = report; host_progress = progress;
}
}
#endif

extern "C" {
EXPORT("mem_alloc") void * mem_alloc(int bytes) { return std::malloc(bytes); }
EXPORT("mem_free") void mem_free(void * p) { std::free(p); }
EXPORT("params_clear") void params_clear() { gParams.clear(); }
EXPORT("param_set") void param_set(const char * name, double value) { gParams[name] = value; }

/** Returns 0 on success, 1 for an unknown method, 2 if the method reported failure. Start values are written back to `start`. */
EXPORT("run_estimation")
int run_estimation(int method, int n, const double * lower, const double * upper, double * start, int randomizeStart, int nResiduals, unsigned int seed, unsigned int startSeed)
{
  std::vector< double > lo(lower, lower + n), hi(upper, upper + n), st(start, start + n);
  CFitProblem problem(lo, hi, st, (size_t) nResiduals);
  if (randomizeStart)
    {
      CConfigurableRNG rng(CConfigurableRNG::Type::MersenneTwister, startSeed);
      problem.randomizeStartValues(rng);
    }
  const std::vector< COptItem * > & items = problem.getOptItemList();
  for (int i = 0; i < n; i++) { problem.mValues[i] = items[i]->getStartValue(); start[i] = problem.mValues[i]; }
  COptTask task(&problem);
  COptMethod * pMethod = static_cast< COptMethod * >(CMethodFactory::create(CTaskEnum::Task::parameterFitting, (CTaskEnum::Method) method, &task));
  if (pMethod == nullptr) return 1;
  for (const auto & p : gParams) pMethod->setValue(p.first, p.second);
  pMethod->setValue("Seed", (double) seed);
  pMethod->setProblem(&problem);
#ifdef __wasm__
  bool ok = pMethod->optimise(); // host_stop() unwinds from JavaScript
#else
  bool ok = true;
  try { ok = pMethod->optimise(); } catch (StopRun &) {}
#endif
  delete pMethod;
  return ok ? 0 : 2;
}

/** The parameter names and defaults a method declares, as "name=value\n" lines (for the UI). */
EXPORT("method_params")
const char * method_params(int method)
{
  static std::string out;
  out.clear();
  CFitProblem problem({1e-6}, {1e6}, {0.1}, 0);
  COptTask task(&problem);
  CCopasiMethod * pMethod = CMethodFactory::create(CTaskEnum::Task::parameterFitting, (CTaskEnum::Method) method, &task);
  if (pMethod == nullptr) return "";
  for (const auto & p : pMethod->mParameters) { char b[64]; snprintf(b, sizeof b, "%.17g", p.second); out += p.first + "=" + b + "\n"; }
  delete pMethod;
  return out.c_str();
}
}
