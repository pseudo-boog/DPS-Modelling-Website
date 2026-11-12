// shim: single-threaded problem context (master == active)
#pragma once
class CMathContainer;
class CMathContext
{
public:
  CMathContext(const bool & = false) {}
  bool sync() { return false; }
  CMathContainer *& master() { return mp; }
  CMathContainer * mp = nullptr;
};
template < class Problem > class CProblemContext
{
public:
  CProblemContext(const bool & = false) {}
  Problem *& active() { return mpMaster; }
  Problem *& master() { return mpMaster; }
  Problem * const & active() const { return mpMaster; }
  Problem * const & master() const { return mpMaster; }
  size_t size() const { return 1; }
  Problem ** threadData() { return &mpMaster; }
  void setMaster(Problem * p) { mpMaster = p; }
  void setMathContext(CMathContext &) {}
private:
  Problem * mpMaster = nullptr;
};
