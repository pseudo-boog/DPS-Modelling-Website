// shim of COptTask: report rows (COutputInterface::DURING) go to the host
#pragma once
#include "copasi/utilities/CCopasiMethod.h"
class COptProblem;
class COptTask : public CDataContainer
{
public:
  explicit COptTask(COptProblem * pProblem) : mpProblem(pProblem) {}
  void output(const COutputInterface::Activity & activity);
  COptProblem * mpProblem;
};
