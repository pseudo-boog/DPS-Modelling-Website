// shim of COPASI's CCopasiMethod / CCopasiParameterGroup: a name -> number parameter store
#pragma once
#include <map>
#include <string>
#include "copasi/copasi.h"
#include "copasi/utilities/CProcessReport.h"

class CDataContainer {};
#define NO_PARENT static_cast< const CDataContainer * >(nullptr)
class CMathContainer;
class CCopasiProblem;

struct CTaskEnum
{
  enum struct Task { optimization, parameterFitting, timeCourse, steadyState, UnsetTask };
  enum struct Method
  {
    UnsetMethod, Statistics, CoranaWalk, DifferentialEvolution, SRES, EvolutionaryProgram, GeneticAlgorithm,
    GeneticAlgorithmSR, HookeJeeves, LevenbergMarquardt, NelderMead, ParticleSwarm, Praxis, RandomSearch,
    ScatterSearch, SimulatedAnnealing, SteepestDescent, TruncatedNewton, NL2SOL
  };
};
struct CCopasiParameter
{
  enum struct Type { DOUBLE, UDOUBLE, INT, UINT, BOOL, GROUP, STRING, CN, KEY, FILE, EXPRESSION, INVALID };
};
enum struct eUserInterfaceFlag { editable, basic, unsupported };
struct CDataObject { enum Flag { ValueInt, ValueDbl, ValueBool }; };
struct COutputInterface { enum Activity { BEFORE = 1, DURING = 2, AFTER = 4, MONITORING = 8 }; };

class CCopasiMethod : public CDataContainer
{
public:
  CCopasiMethod(const CDataContainer * pParent, const CTaskEnum::Method & methodType, const CTaskEnum::Task & taskType)
    : mpParent(pParent), mSubType(methodType), mType(taskType) {}
  virtual ~CCopasiMethod() {}
  virtual bool elevateChildren() { return true; }
  virtual void print(std::ostream * /* ostream */) const {}
  virtual void signalMathContainerChanged() {}
  virtual bool isValidProblem(const CCopasiProblem *) { return true; }

  const CTaskEnum::Method & getSubType() const { return mSubType; }
  const CTaskEnum::Task & getType() const { return mType; }
  const CDataContainer * getObjectParent() const { return mpParent; }

  template < class T, class... Rest > double * assertParameter(const std::string & name, CCopasiParameter::Type, const T & value, Rest...)
  {
    auto it = mParameters.find(name);
    if (it == mParameters.end()) it = mParameters.emplace(name, (double) value).first;
    return &it->second;
  }
  double * getParameter(const std::string & name)
  {
    auto it = mParameters.find(name);
    return it == mParameters.end() ? nullptr : &it->second;
  }
  template < class T > T getValue(const std::string & name) const
  {
    auto it = mParameters.find(name);
    return it == mParameters.end() ? T() : (T) it->second;
  }
  template < class T > bool setValue(const std::string & name, const T & value)
  {
    mParameters[name] = (double) value;
    return true;
  }
  template < class T, class F > void addObjectReference(const std::string &, T &, F) {}
  void initObjects() {}

  std::map< std::string, double > mParameters;
protected:
  const CDataContainer * mpParent;
  CTaskEnum::Method mSubType;
  CTaskEnum::Task mType;
  CMathContainer * mpContainer = nullptr;
  CProcessReportLevel mProcessReport;
};
