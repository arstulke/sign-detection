#include "bitmap.hpp"

#ifndef INTEROP__MODEL__RESPONSE
#define INTEROP__MODEL__RESPONSE

class Response
{
public:
   Bitmap4C output;

   Response(Bitmap4C output);
   void release();
};

#endif
