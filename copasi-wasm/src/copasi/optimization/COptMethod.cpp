// evaluate() and setSolution() follow COPASI's COptMethod.cpp line by line (OpenMP removed).
#include "copasi/optimization/COptMethod.h"
#include "copasi/optimization/COptProblem.h"
#include "copasi/optimization/COptTask.h"

COptMethod::COptMethod(const CDataContainer * pParent, const CTaskEnum::Method & methodType, const CTaskEnum::Task & taskType, const bool & parallel)
  : CCopasiMethod(pParent, methodType, taskType), mpParentTask(NULL), mParallel(parallel), mMathContext(parallel), mProblemContext(parallel),
    mRandomContext(parallel), mLogVerbosity(0), mMethodLog(), mBestValue(std::numeric_limits< C_FLOAT64 >::infinity()), mProceed(true)
{
  assertParameter("Log Verbosity", CCopasiParameter::Type::UINT, (unsigned C_INT32) 0);
}
COptMethod::COptMethod(const COptMethod & src, const CDataContainer * pParent, const bool & parallel)
  : CCopasiMethod(pParent, src.getSubType(), src.getType()), mpParentTask(NULL), mParallel(parallel), mMathContext(parallel), mProblemContext(parallel),
    mRandomContext(parallel), mLogVerbosity(0), mMethodLog(), mBestValue(std::numeric_limits< C_FLOAT64 >::infinity()), mProceed(true)
{
  mParameters = src.mParameters;
}
COptMethod::~COptMethod() {}
bool COptMethod::optimise() { return false; }
bool COptMethod::setProblem(CCopasiProblem * pProblem)
{
  mProblemContext.setMaster(static_cast< COptProblem * >(pProblem));
  return true;
}
bool COptMethod::initialize()
{
  mBestValue = std::numeric_limits< C_FLOAT64 >::infinity();
  mProceed = true;
  if (mProblemContext.master() == NULL) return false;
  CConfigurableRNG::Type RNG = (getParameter("Random Number Generator") != NULL) ? (CConfigurableRNG::Type) getValue< unsigned C_INT32 >("Random Number Generator") : CConfigurableRNG::Type::MersenneTwister;
  unsigned C_INT32 seed = (getParameter("Seed") != NULL) ? getValue< unsigned C_INT32 >("Seed") : 0;
  mRandomContext.release();
  mRandomContext.init(RNG, seed);
  mpParentTask = const_cast< COptTask * >(static_cast< const COptTask * >(getObjectParent()));
  if (!mpParentTask) return false;
  mLogVerbosity = getValue< unsigned C_INT32 >("Log Verbosity");
  mMethodLog = COptLog();
  return true;
}
bool COptMethod::cleanup() { return true; }
unsigned C_INT32 COptMethod::getMaxLogVerbosity() const { return 0; }
C_FLOAT64 COptMethod::getBestValue() const { return mBestValue; }
C_FLOAT64 COptMethod::getCurrentValue() const { return std::numeric_limits< C_FLOAT64 >::quiet_NaN(); }
const CVector< C_FLOAT64 > * COptMethod::getBestParameters() const { return NULL; }
const CVector< C_FLOAT64 > * COptMethod::getCurrentParameters() const { return NULL; }

C_FLOAT64 COptMethod::evaluate(const EvaluationPolicyFlag & policy)
{
  if (!mProceed)
    return std::numeric_limits< C_FLOAT64 >::infinity();
  COptProblem *& pOptProblem = mProblemContext.active();
  if (!pOptProblem->calculate())
    signalStop();
  C_FLOAT64 EvaluationValue = pOptProblem->getCalculateValue();
  if (!std::isnan(EvaluationValue)
      && EvaluationValue != std::numeric_limits< C_FLOAT64 >::infinity())
    {
      bool ParametricConstraintsViolated = ((policy & EvaluationPolicy::Parameter) && !pOptProblem->checkParametricConstraints());
      bool FunctionalConstraintsViolated = ((policy & EvaluationPolicy::Constraints) && !pOptProblem->checkFunctionalConstraints());
      if (ParametricConstraintsViolated || FunctionalConstraintsViolated)
        {
          if (policy & EvaluationPolicy::Reflect)
            {
              C_FLOAT64 Factor = 0.0;
              if (ParametricConstraintsViolated) Factor += pOptProblem->getParametricConstraintsViolation();
              if (FunctionalConstraintsViolated) Factor += pOptProblem->getFunctionalConstraintsViolation();
              if (EvaluationValue < 0.0) EvaluationValue *= 1.0 - Factor;
              else EvaluationValue *= 1.0 + Factor;
              C_FLOAT64 BestValue = mBestValue;
              if (EvaluationValue < BestValue) EvaluationValue = BestValue + exp(EvaluationValue - BestValue);
              else EvaluationValue += exp(BestValue - EvaluationValue);
            }
          else
            EvaluationValue = std::numeric_limits< C_FLOAT64 >::infinity();
        }
    }
  return EvaluationValue;
}

bool COptMethod::setSolution(const C_FLOAT64 & value, const CVector< C_FLOAT64 > & variables, const bool & algorithmOrder)
{
  bool solutionUpdated = false;
  if (value < mBestValue)
    {
      mBestValue = value;
      solutionUpdated = true;
    }
  if (solutionUpdated && mBestValue < 1.e-6 * std::numeric_limits< C_FLOAT64 >::max())
    {
      if (!mProblemContext.master()->setSolution(value, variables, algorithmOrder))
        signalStop();
      mpParentTask->output(COutputInterface::DURING);
    }
  return solutionUpdated;
}

std::pair< C_FLOAT64, bool > COptMethod::objectiveValue(COptProblem * pProblem, const CVectorCore< C_FLOAT64 > & parameters)
{
  const std::vector< COptItem * > & OptItemList = pProblem->getOptItemList(true);
  bool inDomain = true;
  for (size_t i = 0; i < OptItemList.size(); i++)
    {
      C_FLOAT64 value = parameters[i];
      inDomain &= OptItemList[i]->setItemValue(value, COptItem::CheckPolicyFlag::None);
    }
  pProblem->calculate();
  return {pProblem->getCalculateValue(), inDomain};
}
