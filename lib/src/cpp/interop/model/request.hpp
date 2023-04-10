#include "bitmap.hpp"

#ifndef INTEROP__MODEL__REQUEST
#define INTEROP__MODEL__REQUEST

class Request
{
public:
   Bitmap4C input;

   Request(int32_t width, int32_t height);
   void release();
};

#endif
