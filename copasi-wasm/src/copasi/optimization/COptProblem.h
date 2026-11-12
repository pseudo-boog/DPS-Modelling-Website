// shim of COPASI's COptProblem / CFitProblem: the parameter-estimation problem.
// calculate() asks the host (JavaScript) for the weighted sum of squares and, when a method
// needs them, the weighted residuals.
#ifndef COPASI_COptProblem
#define COPASI_COptProblem
#include <vector>
#include "copasi/copasi.h"
#include "copasi/core/CVector.h"
#include "copasi/core/CMatrix.h"
#include "copasi/optimization/COptItem.h"
#include "copasi/utilities/CCopasiMethod.h"

class CCopasiProblem
{
public:
  virtual ~CCopasiProblem() {}
};

class COptProblem : public CCopasiProblem
{
public:
  COptProblem(const std::vector< double > & lower, const std::vector< double > & upper, const std::vector< double > & start, size_t nResiduals);
  COptProblem(const COptProblem & src);
  virtual ~COptProblem();

  const std::vector< COptItem * > & getOptItemList(const bool & /* algorithmOrder */ = false) const { return mItems; }
  const std::vector< COptItem * > & getConstraintList() const { return mConstraints; }
  bool calculate();
  const C_FLOAT64 & getCalculateValue() const { return mCalculateValue; }
  bool checkParametricConstraints();
  bool checkFunctionalConstraints() { return true; }
  C_FLOAT64 getParametricConstraintsViolation();
  C_FLOAT64 getFunctionalConstraintsViolation() { return 0.0; }
  bool setSolution(const C_FLOAT64 & value, const CVector< C_FLOAT64 > & variables, const bool & algorithmOrder = false);
  const C_FLOAT64 & getSolutionValue() const { return mSolutionValue; }
  const CVector< C_FLOAT64 > & getSolutionVariables(const bool & /* algorithmOrder */ = false) const { return mSolutionVariables; }
  void reset() { mSolutionValue = std::numeric_limits< C_FLOAT64 >::infinity(); mSolutionVariables = std::numeric_limits< C_FLOAT64 >::quiet_NaN(); }
  bool initialize() { reset(); return true; }
  void initializeSubtaskBeforeOutput() {}
  void setMathContainer(CMathContainer *) {}
  void aggregateCounters(const COptProblem &) {}
  C_FLOAT64 getEstimatedSubtaskError() const { return 0.0; }
  void randomizeStartValues(CConfigurableRNG & rng);

  std::vector< double > mValues; // current parameter values (what the items point to)
  long mEvaluations = 0;
protected:
  std::vector< COptItem * > mItems;
  std::vector< COptItem * > mConstraints;
  C_FLOAT64 mCalculateValue;
  C_FLOAT64 mSolutionValue;
  CVector< C_FLOAT64 > mSolutionVariables;
  bool mResidualsRequired = false;
  CVector< C_FLOAT64 > mResiduals;
  CMatrix< C_FLOAT64 > mTimeSensJac;
  friend class CFitProblem;
};

class CFitProblem : public COptProblem
{
public:
  using COptProblem::COptProblem;
  const CVector< C_FLOAT64 > & getResiduals() const { return mResiduals; }
  void setResidualsRequired(const bool & required) { mResidualsRequired = required; }
  bool getUseTimeSens() const { return false; }
  CMatrix< C_FLOAT64 > & getTimeSensJac() { return mTimeSensJac; }
};
#endif
