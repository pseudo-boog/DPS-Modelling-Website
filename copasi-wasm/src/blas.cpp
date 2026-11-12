// Reference BLAS / LAPACK subset (column-major, Fortran calling convention) for the optimizers.
#include <cmath>
#include <cstddef>
extern "C" {
int daxpy_(int * n, double * da, double * dx, int * incx, double * dy, int * incy)
{
  if (*n <= 0 || *da == 0.0) return 0;
  int ix = *incx < 0 ? (1 - *n) * *incx : 0, iy = *incy < 0 ? (1 - *n) * *incy : 0;
  for (int i = 0; i < *n; i++, ix += *incx, iy += *incy) dy[iy] += *da * dx[ix];
  return 0;
}
int dcopy_(int * n, double * dx, int * incx, double * dy, int * incy)
{
  if (*n <= 0) return 0;
  int ix = *incx < 0 ? (1 - *n) * *incx : 0, iy = *incy < 0 ? (1 - *n) * *incy : 0;
  for (int i = 0; i < *n; i++, ix += *incx, iy += *incy) dy[iy] = dx[ix];
  return 0;
}
double ddot_(int * n, double * dx, int * incx, double * dy, int * incy)
{
  double s = 0.0;
  if (*n <= 0) return 0.0;
  int ix = *incx < 0 ? (1 - *n) * *incx : 0, iy = *incy < 0 ? (1 - *n) * *incy : 0;
  for (int i = 0; i < *n; i++, ix += *incx, iy += *incy) s += dx[ix] * dy[iy];
  return s;
}
double dnrm2_(int * n, double * x, int * incx)
{
  if (*n < 1 || *incx < 1) return 0.0;
  double scale = 0.0, ssq = 1.0;
  for (int i = 0; i < *n; i++)
    {
      double v = x[i * *incx];
      if (v != 0.0)
        {
          double a = std::fabs(v);
          if (scale < a) { ssq = 1.0 + ssq * (scale / a) * (scale / a); scale = a; }
          else ssq += (a / scale) * (a / scale);
        }
    }
  return scale * std::sqrt(ssq);
}
int dscal_(int * n, double * da, double * dx, int * incx)
{
  if (*n <= 0 || *incx <= 0) return 0;
  for (int i = 0; i < *n; i++) dx[i * *incx] *= *da;
  return 0;
}
int idamax_(int * n, double * dx, int * incx)
{
  if (*n < 1 || *incx <= 0) return 0;
  int best = 1; double m = std::fabs(dx[0]);
  for (int i = 1; i < *n; i++) { double v = std::fabs(dx[i * *incx]); if (v > m) { m = v; best = i + 1; } }
  return best;
}
static inline bool lsame(const char * c, char x) { return (*c | 32) == (x | 32); }
int dgemm_(const char * transa, const char * transb, int * m, int * n, int * k, double * alpha, double * a, int * lda, double * b, int * ldb, double * beta, double * c, int * ldc)
{
  // reference BLAS DGEMM loop order
  bool ta = !lsame(transa, 'n'), tb = !lsame(transb, 'n');
  auto A = [&](int i, int j) { return a[i + (size_t) j * *lda]; };
  auto B = [&](int i, int j) { return b[i + (size_t) j * *ldb]; };
  auto C = [&](int i, int j) -> double & { return c[i + (size_t) j * *ldc]; };
  for (int j = 0; j < *n; j++)
    {
      if (!ta)
        {
          if (*beta == 0.0) for (int i = 0; i < *m; i++) C(i, j) = 0.0;
          else if (*beta != 1.0) for (int i = 0; i < *m; i++) C(i, j) *= *beta;
          for (int l = 0; l < *k; l++)
            {
              double temp = *alpha * (tb ? B(j, l) : B(l, j));
              for (int i = 0; i < *m; i++) C(i, j) += temp * A(i, l);
            }
        }
      else
        {
          for (int i = 0; i < *m; i++)
            {
              double temp = 0.0;
              for (int l = 0; l < *k; l++) temp += A(l, i) * (tb ? B(j, l) : B(l, j));
              C(i, j) = (*beta == 0.0) ? *alpha * temp : *alpha * temp + *beta * C(i, j);
            }
        }
    }
  return 0;
}
// Cholesky factorisation: reference LAPACK DPOTF2 (what DPOTRF does for small matrices),
// with the same operation order (DDOT, DGEMV, DSCAL by 1/ajj).
int dpotrf_(char * uplo, int * n, double * a, int * lda, int * info)
{
  const int N = *n, L = *lda;
  auto A = [&](int i, int j) -> double & { return a[i + (size_t) j * L]; };
  *info = 0;
  if (lsame(uplo, 'u'))
    {
      for (int j = 0; j < N; j++)
        {
          double dot = 0.0;
          for (int k = 0; k < j; k++) dot += A(k, j) * A(k, j);
          double ajj = A(j, j) - dot;
          if (ajj <= 0.0 || std::isnan(ajj)) { A(j, j) = ajj; *info = j + 1; return 0; }
          ajj = std::sqrt(ajj); A(j, j) = ajj;
          if (j < N - 1)
            {
              for (int i = j + 1; i < N; i++) // DGEMV('T'): y(i) += -1 * (sum_k A(k,i) * A(k,j))
                {
                  double temp = 0.0;
                  for (int k = 0; k < j; k++) temp += A(k, i) * A(k, j);
                  A(j, i) += -1.0 * temp;
                }
              double r = 1.0 / ajj;
              for (int i = j + 1; i < N; i++) A(j, i) *= r;
            }
        }
    }
  else
    {
      for (int j = 0; j < N; j++)
        {
          double dot = 0.0;
          for (int k = 0; k < j; k++) dot += A(j, k) * A(j, k);
          double ajj = A(j, j) - dot;
          if (ajj <= 0.0 || std::isnan(ajj)) { A(j, j) = ajj; *info = j + 1; return 0; }
          ajj = std::sqrt(ajj); A(j, j) = ajj;
          if (j < N - 1)
            {
              for (int k = 0; k < j; k++) // DGEMV('N'): y += (-x(k)) * A(:,k)
                {
                  double temp = -1.0 * A(j, k);
                  for (int i = j + 1; i < N; i++) A(i, j) += temp * A(i, k);
                }
              double r = 1.0 / ajj;
              for (int i = j + 1; i < N; i++) A(i, j) *= r;
            }
        }
    }
  return 0;
}
int dpotrs_(char * uplo, int * n, int * nrhs, double * a, int * lda, double * b, int * ldb, int * info)
{
  const int N = *n, L = *lda;
  auto A = [&](int i, int j) { return a[i + (size_t) j * L]; };
  *info = 0;
  for (int r = 0; r < *nrhs; r++)
    {
      double * x = b + (size_t) r * *ldb;
      if (lsame(uplo, 'u'))
        {
          for (int i = 0; i < N; i++) { double s = x[i]; for (int k = 0; k < i; k++) s -= A(k, i) * x[k]; x[i] = s / A(i, i); }
          for (int i = N - 1; i >= 0; i--) { double s = x[i]; for (int k = i + 1; k < N; k++) s -= A(i, k) * x[k]; x[i] = s / A(i, i); }
        }
      else
        {
          for (int i = 0; i < N; i++) { double s = x[i]; for (int k = 0; k < i; k++) s -= A(i, k) * x[k]; x[i] = s / A(i, i); }
          for (int i = N - 1; i >= 0; i--) { double s = x[i]; for (int k = i + 1; k < N; k++) s -= A(k, i) * x[k]; x[i] = s / A(i, i); }
        }
    }
  return 0;
}
int dsytrf_(const char *, int *, double *, int *, int *, double *, int *, int * info) { *info = -1; return 0; }
}
