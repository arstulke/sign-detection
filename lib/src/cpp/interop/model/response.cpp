#include "bitmap.hpp"
#include "bitmap.hpp"
#include "response.hpp"

Response::Response(Bitmap4C output) {
    this->output = output;
}

void Response::release()
{
    this->output.release();
}
