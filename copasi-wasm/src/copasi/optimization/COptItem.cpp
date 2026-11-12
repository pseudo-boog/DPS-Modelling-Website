#include "copasi/optimization/COptItem.h"
COptItem::COptItem(double * pValue, double lower, double upper, double start)
  : mpObjectValue(pValue), mLower(lower), mUpper(upper), mStartValue(start), mpLowerBound(&mLower), mpUpperBound(&mUpper), mInterval(mpLowerBound, mpUpperBound)
{}
COptItem::COptItem(const COptItem & src, double * pValue)
  : mpObjectValue(pValue), mLower(src.mLower), mUpper(src.mUpper), mStartValue(src.mStartValue), mpLowerBound(&mLower), mpUpperBound(&mUpper), mInterval(mpLowerBound, mpUpperBound)
{}
