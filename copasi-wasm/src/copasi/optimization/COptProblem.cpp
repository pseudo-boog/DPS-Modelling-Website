#include "copasi/optimization/COptProblem.h"
#include "copasi/optimization/COptTask.h"
#include "copasi/randomGenerator/CConfigurableRNG.h"


COptProblem::COptProblem(const std::vector< double > & lower, const std::vector< double > & upper, const std::vector< double > & start, size_t nResiduals)
  : mValues(start), mCalculateValue(std::numeric_limits< C_FLOAT64 >::infinity()), mSolutionValue(std::numeric_limits< C_FLOAT64 >::infinity()),
    mSolutionVariables(start.size()), mResiduals(nResiduals)
{
  mItems.reserve(start.size());
  for (size_t i = 0; i < start.size(); i++)
    mItems.push_back(new COptItem(&mValues[i], lower[i], upper[i], start[i]));
  mSolutionVariables = std::numeric_limits< C_FLOAT64 >::quiet_NaN();
  mResiduals = 0.0;
}
COptProblem::COptProblem(const COptProblem & src)
  : mValues(src.mValues), mCalculateValue(src.mCalculateValue), mSolutionValue(std::numeric_limits< C_FLOAT64 >::infinity()),
    mSolutionVariables(src.mSolutionVariables.size()), mResidualsRequired(src.mResidualsRequired), mResiduals(src.mResiduals.size())
{
  for (size_t i = 0; i < src.mItems.size(); i++)
    mItems.push_back(new COptItem(*src.mItems[i], &mValues[i]));
  mSolutionVariables = std::numeric_limits< C_FLOAT64 >::quiet_NaN();
  mResiduals = 0.0;
}
COptProblem::~COptProblem()
{
  for (COptItem * p : mItems) delete p;
}
bool COptProblem::calculate()
{
  mEvaluations++;
  mCalculateValue = host_objective(mValues.data(), (int) mValues.size(), mResidualsRequired ? mResiduals.array() : nullptr, (int) mResiduals.size());
  if (std::isnan(mCalculateValue)) mCalculateValue = std::numeric_limits< C_FLOAT64 >::infinity();
  return true; // like CFitProblem: a failed simulation gives the worst value, not a stop
}
bool COptProblem::checkParametricConstraints()
{
  for (COptItem * p : mItems)
    if (p->checkConstraint()) return false;
  return true;
}
C_FLOAT64 COptProblem::getParametricConstraintsViolation()
{
  C_FLOAT64 L2norm = 0.0;
  for (COptItem * p : mItems) { C_FLOAT64 v = p->getConstraintViolation(); L2norm += v * v; }
  return sqrt(L2norm);
}
bool COptProblem::setSolution(const C_FLOAT64 & value, const CVector< C_FLOAT64 > & variables, const bool &)
{
  mSolutionValue = value;
  if (variables.size() != 0) mSolutionVariables = variables;
  return value != -std::numeric_limits< C_FLOAT64 >::infinity();
}
void COptProblem::randomizeStartValues(CConfigurableRNG & rng)
{
  for (COptItem * p : mItems) p->setStartValue(p->getRandomValue(rng));
}

void COptTask::output(const COutputInterface::Activity & activity)
{
  if (activity != COutputInterface::DURING || mpProblem == nullptr) return;
  const CVector< C_FLOAT64 > & x = mpProblem->getSolutionVariables();
  host_report(x.array(), (int) x.size(), mpProblem->getSolutionValue());
}
