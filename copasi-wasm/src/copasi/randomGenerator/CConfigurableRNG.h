// shim of COPASI's CConfigurableRNG: COPASI's default engine (Mersenne Twister, 64-bit output)
#pragma once
#include <random>
#include <cstdint>
#include <limits>
class CConfigurableRNG
{
public:
  using result_type = std::mt19937_64::result_type;
  enum struct Type { R250 = 0, MersenneTwister, MersenneTwister64, SobolSequence };
  CConfigurableRNG(Type engineType = Type::MersenneTwister, result_type initialSeed = 0) : mType(engineType) { seed(initialSeed); }
  void seed(result_type newSeed) { mSeed = newSeed; mEngine.seed((std::mt19937::result_type) newSeed); }
  result_type operator()() { return mEngine(); }
  void discard(result_type z) { mEngine.discard(z); }
  constexpr static result_type min() { return 0; }
  constexpr static result_type max() { return std::numeric_limits< result_type >::max(); }
  Type getType() const { return mType; }
private:
  std::independent_bits_engine< std::mt19937, 64, result_type > mEngine;
  Type mType;
  result_type mSeed;
};
