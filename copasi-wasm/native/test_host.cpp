// Native smoke test: every method on a 2-parameter Rosenbrock least-squares problem.
#include <cstdio>
#include <cmath>
extern "C" int run_estimation(int, int, const double *, const double *, double *, int, int, unsigned, unsigned);
extern "C" void params_clear();
extern "C" const char * method_params(int);
extern "C" void set_host(double (*)(const double *, int, double *, int), void (*)(const double *, int, double), void (*)(double, double));
static long evals = 0; static double best = INFINITY; static long reports = 0;
static double objective(const double * x, int n, double * r, int m)
{
  evals++;
  double r1 = 10 * (x[1] - x[0] * x[0]), r2 = 1 - x[0];
  if (r && m >= 2) { r[0] = r1; r[1] = r2; }
  return r1 * r1 + r2 * r2;
}
static void report(const double *, int, double v) { reports++; if (v < best) best = v; }
static void progress(double, double) {}
int main(int argc, char ** argv)
{
  set_host(objective, report, progress);
  const char * names[] = {"Unset", "Statistics", "CoranaWalk", "DE", "SRES", "EP", "GA", "GASR", "HookeJeeves", "LM", "NelderMead", "PS", "Praxis", "RandomSearch", "SS", "SA", "SteepestDescent", "TruncatedNewton", "NL2SOL"};
  for (int m = 1; m < 19; m++)
    {
      if (m == 2) continue;
      if (argc > 1) { printf("--- %s\n%s", names[m], method_params(m)); continue; }
      double lo[2] = {-5, -5}, hi[2] = {5, 5}, st[2] = {-1.2, 1};
      evals = 0; best = INFINITY; reports = 0;
      params_clear();
      int rc = run_estimation(m, 2, lo, hi, st, 0, 2, 12345, 1);
      printf("%-16s rc=%d best=%.3e evals=%ld reports=%ld\n", names[m], rc, best, evals, reports);
    }
}
