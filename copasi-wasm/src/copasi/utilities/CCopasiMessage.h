// shim: COPASI messages are only collected, never shown
#pragma once
#define MCopasiBase 5000
#define MCOptimization 6000
#define MCFitting 7000
class CCopasiMessage
{
public:
  enum Type { RAW = 0, TRACE, COMMANDLINE, WARNING, ERROR, EXCEPTION, RAW_FILTERED, TRACE_FILTERED, COMMANDLINE_FILTERED, WARNING_FILTERED, ERROR_FILTERED };
  template < typename... Args > CCopasiMessage(Type, Args...) {}
};
#include <cstdlib>
inline void __FatalError(const char * = nullptr, int = 0) { std::abort(); }
#define fatalError() __FatalError(__FILE__, __LINE__)
