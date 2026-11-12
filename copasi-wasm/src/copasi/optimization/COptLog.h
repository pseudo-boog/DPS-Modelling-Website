#pragma once
#include "copasi/optimization/COptLogEntry.h"
class COptLog
{
public:
  void enterLogEntry(const COptLogEntry &) {}
  size_t getElementCount() const { return 0; }
};
