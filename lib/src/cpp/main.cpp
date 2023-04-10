#include <stdio.h>
#include <emscripten/bind.h>
#include <opencv2/imgproc.hpp>

#include "detect_signs.hpp"
#include "interop/model/bitmap.hpp"
#include "interop/model/request.hpp"
#include "interop/model/response.hpp"

using namespace emscripten;

Response processFrame(Request request)
{
  cv::Mat input = request.input.getMat();
  cv::Mat output;
  
  detectSigns(input, output);

  return Response(Bitmap4C(&output));
}

EMSCRIPTEN_BINDINGS(image)
{
  class_<Bitmap4C>("Bitmap4C")
      .property("ptr", &Bitmap4C::ptr)
      .property("width", &Bitmap4C::width)
      .property("height", &Bitmap4C::height)
      .property("byteLength", &Bitmap4C::byteLength);

  class_<Request>("Request")
      .constructor<int32_t, int32_t>()
      .property("input", &Request::input)
      .function("release", &Request::release);

  class_<Response>("Response")
      .property("output", &Response::output)
      .function("release", &Response::release);

  function("processFrame", &processFrame);
}
