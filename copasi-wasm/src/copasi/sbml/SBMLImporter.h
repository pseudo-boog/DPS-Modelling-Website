#pragma once
#include <cmath>
#include <limits>
struct SBMLImporter
{
  static bool areApproximatelyEqual(const double & x, const double & y, const double & t = 1e-9)
  {
    double Scale = (fabs(x) + fabs(y)) * t;
    if (Scale < 100.0 * std::numeric_limits< double >::min()) return true;
    return 2 * fabs(x - y) < Scale;
  }
};
