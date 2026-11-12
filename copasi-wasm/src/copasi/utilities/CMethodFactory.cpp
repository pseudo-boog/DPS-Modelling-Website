#include "copasi/utilities/CMethodFactory.h"
#include "copasi/optimization/COptMethodStatistics.h"
#include "copasi/optimization/COptMethodDE.h"
#include "copasi/optimization/COptMethodSRES.h"
#include "copasi/optimization/COptMethodEP.h"
#include "copasi/optimization/COptMethodGA.h"
#include "copasi/optimization/COptMethodGASR.h"
#include "copasi/optimization/COptMethodHookeJeeves.h"
#include "copasi/optimization/COptMethodLevenbergMarquardt.h"
#include "copasi/optimization/COptMethodNelderMead.h"
#include "copasi/optimization/COptMethodPS.h"
#include "copasi/optimization/COptMethodPraxis.h"
#include "copasi/optimization/CRandomSearch.h"
#include "copasi/optimization/COptMethodSS.h"
#include "copasi/optimization/COptMethodSA.h"
#include "copasi/optimization/COptMethodSteepestDescent.h"
#include "copasi/optimization/COptMethodTruncatedNewton.h"
#include "copasi/optimization/COptMethodNL2SOL.h"

CCopasiMethod * CMethodFactory::create(const CTaskEnum::Task & taskType, const CTaskEnum::Method & methodType, const CDataContainer * pParent)
{
  typedef CTaskEnum::Method M;
  switch (methodType)
    {
      case M::Statistics: return new COptMethodStatistics(pParent, methodType, taskType);
      case M::DifferentialEvolution: return new COptMethodDE(pParent, methodType, taskType, false);
      case M::SRES: return new COptMethodSRES(pParent, methodType, taskType, false);
      case M::EvolutionaryProgram: return new COptMethodEP(pParent, methodType, taskType, false);
      case M::GeneticAlgorithm: return new COptMethodGA(pParent, methodType, taskType, false);
      case M::GeneticAlgorithmSR: return new COptMethodGASR(pParent, methodType, taskType, false);
      case M::HookeJeeves: return new COptMethodHookeJeeves(pParent, methodType, taskType);
      case M::LevenbergMarquardt: return new COptMethodLevenbergMarquardt(pParent, methodType, taskType);
      case M::NelderMead: return new COptMethodNelderMead(pParent, methodType, taskType);
      case M::ParticleSwarm: return new COptMethodPS(pParent, methodType, taskType, false);
      case M::Praxis: return new COptMethodPraxis(pParent, methodType, taskType);
      case M::RandomSearch: return new CRandomSearch(pParent, methodType, taskType);
      case M::ScatterSearch: return new COptMethodSS(pParent, methodType, taskType, false);
      case M::SimulatedAnnealing: return new COptMethodSA(pParent, methodType, taskType);
      case M::SteepestDescent: return new COptMethodSteepestDescent(pParent, methodType, taskType);
      case M::TruncatedNewton: return new COptMethodTruncatedNewton(pParent, methodType, taskType);
      case M::NL2SOL: return new COptMethodNL2SOL(pParent, methodType, taskType);
      default: return nullptr;
    }
}
