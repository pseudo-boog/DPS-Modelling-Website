// shim: the LAPACK routines the optimizers call (implemented in blas.cpp)
#pragma once
extern "C"
{
  int dpotrf_(char * uplo, int * n, double * a, int * lda, int * info);
  int dpotrs_(char * uplo, int * n, int * nrhs, double * a, int * lda, double * b, int * ldb, int * info);
  int dsytrf_(const char * uplo, int * n, double * a, int * lda, int * ipiv, double * work, int * lwork, int * info);
}
typedef int integer;
typedef double doublereal;
typedef int logical;
typedef int (*U_fp)(...);
typedef int (*S_fp)(...);
typedef int ftnlen;
typedef int flag;
typedef int ftnint;
#ifndef TRUE_
#define TRUE_ (1)
#define FALSE_ (0)
#endif
typedef float real;
