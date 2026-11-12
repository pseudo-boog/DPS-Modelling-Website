// shim: the few BLAS routines the optimizers call (implemented in blas.cpp)
#pragma once
extern "C"
{
  int daxpy_(int * n, double * da, double * dx, int * incx, double * dy, int * incy);
  int dcopy_(int * n, double * dx, int * incx, double * dy, int * incy);
  double ddot_(int * n, double * dx, int * incx, double * dy, int * incy);
  double dnrm2_(int * n, double * x, int * incx);
  int dscal_(int * n, double * da, double * dx, int * incx);
  int idamax_(int * n, double * dx, int * incx);
  int dgemm_(const char * transa, const char * transb, int * m, int * n, int * k, double * alpha, double * a, int * lda, double * b, int * ldb, double * beta, double * c, int * ldc);
}
