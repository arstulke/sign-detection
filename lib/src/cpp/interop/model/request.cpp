#include "bitmap.hpp"
#include "request.hpp"

Request::Request(int32_t width, int32_t height) {
    this->input = Bitmap4C(width, height);
}

void Request::release()
{
    this->input.release();
}
