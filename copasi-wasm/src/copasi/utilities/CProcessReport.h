// shim of COPASI's progress reporting: forwards progress of one item to the host (JavaScript)
#pragma once
#include <string>
#include <functional>
#include <vector>
#include <cstddef>

#include "copasi/copasi.h"

class CProcessReportLevel
{
public:
  explicit operator bool() const { return true; }
  template < class T > size_t addItem(const std::string &, const T & value, const T * pMax = nullptr)
  {
    const T * pValue = &value;
    mItems.push_back([pValue, pMax]() { host_progress((double) *pValue, pMax ? (double) *pMax : -1.0); });
    return mItems.size() - 1;
  }
  bool progressItem(const size_t & handle)
  {
    if (handle < mItems.size()) mItems[handle]();
    return true;
  }
  bool finishItem(const size_t &) { return true; }
  bool proceed() { return true; }
private:
  std::vector< std::function< void() > > mItems;
};
