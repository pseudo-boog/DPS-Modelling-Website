#pragma once
#include <memory>
#include <functional>
struct COpenMPConfig { static void RegisterApplyCallback(std::shared_ptr< std::function< void() > >) {} };
