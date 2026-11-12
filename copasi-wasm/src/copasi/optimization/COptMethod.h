// shim of COPASI's COptMethod: same interface as COPASI 4.x (copasi/optimization/COptMethod.h),
// single-threaded, with the evaluation / solution logic copied from COptMethod.cpp.
#ifndef COPASI_COptMethod
#define COPASI_COptMethod
#include <string>
#include <memory>
#include <functional>
#include "copasi/OpenMP/CProblemContext.h"
#include "copasi/OpenMP/COpenMPConfig.h"
#include "copasi/utilities/CCopasiMethod.h"
#include "copasi/optimization/COptLog.h"
#include "copasi/OpenMP/CRandomContext.h"
#include "copasi/core/CVector.h"

class COptProblem;
class COptItem;
class COptTask;

class COptMethod : public CCopasiMethod
{
public:
  enum struct EvaluationPolicy { Parameter, Constraints, Reflect, __SIZE };
  typedef CFlags< EvaluationPolicy > EvaluationPolicyFlag;

protected:
  COptTask * mpParentTask;
  bool mParallel;
  CMathContext mMathContext;
  CProblemContext< COptProblem > mProblemContext;
  CRandomContext mRandomContext;
  unsigned C_INT32 mLogVerbosity;
  COptLog mMethodLog;
  std::shared_ptr< std::function< void() > > mOpenMPApplyCallback;

public:
  COptMethod(const CDataContainer * pParent, const CTaskEnum::Method & methodType, const CTaskEnum::Task & taskType, const bool & parallel);
  COptMethod(const COptMethod & src, const CDataContainer * pParent, const bool & parallel);
  virtual ~COptMethod();
  virtual bool optimise();
  virtual bool setProblem(CCopasiProblem * pProblem);
  virtual bool initialize();
  virtual unsigned C_INT32 getMaxLogVerbosity() const;
  const COptLog & getMethodLog() const { return mMethodLog; }
  virtual C_FLOAT64 getBestValue() const final;
  virtual C_FLOAT64 getCurrentValue() const;
  virtual const CVector< C_FLOAT64 > * getBestParameters() const;
  virtual const CVector< C_FLOAT64 > * getCurrentParameters() const;
  virtual void openMPApplyCallback() {}

protected:
  virtual C_FLOAT64 evaluate(const EvaluationPolicyFlag & policy) final;
  virtual bool setSolution(const C_FLOAT64 & value, const CVector< C_FLOAT64 > & variables, const bool & algorithmOrder) final;
  void aggregateCounters() {}
  bool proceed() const { return mProceed; }
  void signalStop() { mProceed = false; }
  static std::pair< C_FLOAT64, bool > objectiveValue(COptProblem * pProblem, const CVectorCore< C_FLOAT64 > & parameters);
  virtual bool cleanup();

private:
  C_FLOAT64 mBestValue;
  bool mProceed;
};
#endif
