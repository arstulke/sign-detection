#include <stdio.h>
#include <emscripten/bind.h>
#include <opencv2/imgproc.hpp>

#include "detect_signs.hpp"
#include "interop/bitmap.hpp"

using namespace emscripten;

struct Response_t
{
  Bitmap4C_t output;
};

int customGarbageCount = 2;
Bitmap4C_t *customGarbage = new Bitmap4C_t[customGarbageCount];

Response_t processFrame(Bitmap4C_t inputBitmap)
{
  cv::Mat input = inputBitmap.getMat();
  cv::Mat output;
  detectSigns(input, output);

  Response_t response = {/*output=*/Bitmap4C_t(&output)};

  customGarbage[0] = inputBitmap;
  customGarbage[1] = response.output;

  return response;
}

void freeMemory()
{
  for (int i = 0; i < customGarbageCount; i++)
  {
    Bitmap4C_t bitmap = customGarbage[i];
    bitmap.release();
  }
}

EMSCRIPTEN_BINDINGS(image)
{
  class_<Bitmap4C_t>("Bitmap4C")
      .constructor<int32_t, int32_t>()
      .property("ptr", &Bitmap4C_t::ptr)
      .property("width", &Bitmap4C_t::width)
      .property("height", &Bitmap4C_t::height)
      .property("byteLength", &Bitmap4C_t::byteLength);

  class_<Response_t>("Response")
      .property("output", &Response_t::output);

  function("processFrame", &processFrame);
  function("freeMemory", &freeMemory);
}
