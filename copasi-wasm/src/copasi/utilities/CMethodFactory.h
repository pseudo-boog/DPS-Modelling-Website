// shim of COPASI's CMethodFactory: creates any parameter-estimation method by type
#pragma once
#include "copasi/utilities/CCopasiMethod.h"
struct CMethodFactory
{
  static CCopasiMethod * create(const CTaskEnum::Task & taskType, const CTaskEnum::Method & methodType, const CDataContainer * pParent);
};
