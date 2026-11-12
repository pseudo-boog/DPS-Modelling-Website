#pragma once
#include "copasi/optimization/COptProblem.h"
struct CProblemFactory
{
  static CCopasiProblem * copy(const COptProblem * pSrc, const CDataContainer *) { return new CFitProblem(*static_cast< const CFitProblem * >(pSrc)); }
};
