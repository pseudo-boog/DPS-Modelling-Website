// shim of COPASI's COptItem: one fitted parameter with bounds and a start value.
// The value lives in the owning problem's parameter vector.
#ifndef COPASI_COptItem
#define COPASI_COptItem
#include "copasi/copasi.h"
#include "copasi/randomGenerator/CIntervalValue.h"
class CConfigurableRNG;
class COptItem
{
public:
  enum struct CheckPolicy { Bounds, Intervals, __SIZE };
  typedef CFlags< CheckPolicy > CheckPolicyFlag;

  COptItem(double * pValue, double lower, double upper, double start);
  COptItem(const COptItem & src, double * pValue);
  ~COptItem() {}

  const C_FLOAT64 & getStartValue() const { return mStartValue; }
  bool setStartValue(const C_FLOAT64 & value) { mStartValue = value; return true; }
  C_FLOAT64 getRandomValue(CConfigurableRNG & rng) const { return mInterval.randomValue(rng); }
  const C_FLOAT64 * getLowerBoundValue() const { return mpLowerBound; }
  const C_FLOAT64 * getUpperBoundValue() const { return mpUpperBound; }
  C_INT32 checkConstraint() const { return checkConstraint(*mpObjectValue); }
  C_INT32 checkConstraint(const C_FLOAT64 & value) const
  {
    if (*mpLowerBound > value) return -1;
    if (value > *mpUpperBound) return 1;
    return 0;
  }
  C_FLOAT64 getConstraintViolation() const
  {
    switch (checkConstraint())
      {
        case -1: return *mpLowerBound - *mpObjectValue;
        case 1: return *mpObjectValue - *mpUpperBound;
      }
    return 0.0;
  }
  bool isValidInterval() const { return *mpLowerBound <= *mpUpperBound; }
  bool setItemValue(C_FLOAT64 & value, const CheckPolicyFlag & policy)
  {
    if (*mpObjectValue == value) return true;
    if (policy & CheckPolicy::Bounds)
      {
        if (!isValidInterval()) return false;
        if (value < *mpLowerBound) value = *mpLowerBound;
        else if (*mpUpperBound < value) value = *mpUpperBound;
      }
    *mpObjectValue = value;
    return true;
  }
  const C_FLOAT64 & getItemValue() const { return *mpObjectValue; }
  const CIntervalValue & getInterval() const { return mInterval; }

private:
  double * mpObjectValue;
  double mLower, mUpper, mStartValue;
  const C_FLOAT64 * mpLowerBound;
  const C_FLOAT64 * mpUpperBound;
  CIntervalValue mInterval;
};
#endif
