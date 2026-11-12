// shim: single-threaded random context
#pragma once
#include "copasi/randomGenerator/CConfigurableRNG.h"
class CRandomContext
{
public:
  CRandomContext(const bool & = false) : mpRNG(new CConfigurableRNG()) {}
  ~CRandomContext() { delete mpRNG; }
  void init(CConfigurableRNG::Type type, unsigned int seed) { delete mpRNG; mpRNG = new CConfigurableRNG(type, seed); }
  void release() {}
  CConfigurableRNG & active() { return *mpRNG; }
  CConfigurableRNG & master() { return *mpRNG; }
  size_t size() const { return 1; }
private:
  CConfigurableRNG * mpRNG;
};
