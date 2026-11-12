// shim of copasi/core/CCore.h: just the basic types the optimizers use
#ifndef COPASI_CCore
#define COPASI_CCore
#include <limits>
#include <cstddef>
#define C_INVALID_INDEX (std::numeric_limits< size_t >::max())
#define C_INT64 long long int
#define C_INT32 int
#define C_UINT32 unsigned int
#define C_INT16 short
#define C_FLOAT64 double
#define C_FLOAT32 float
#define C_INT int
#define C_LOGICAL C_INT
#include "copasi/core/CFlags.h"
#endif
