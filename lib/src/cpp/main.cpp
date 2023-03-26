#include <stdio.h>
#include <emscripten/bind.h>
#include <opencv2/imgproc.hpp>

using namespace emscripten;
using namespace cv;

class Bitmap4C_t
{
    public:
      uintptr_t ptr;
      int32_t width;
      int32_t height;
      int32_t byteLength;
      static const int32_t BYTES_PER_PIXEL = 4;

      Bitmap4C_t(int32_t width, int32_t height) {
        int32_t byteLength = width * height * BYTES_PER_PIXEL;
        uint8_t* outputArray = new uint8_t[byteLength];
        
        this->width = width;
        this->height = height;
        this->byteLength = byteLength;
        this->ptr = reinterpret_cast<uintptr_t>(outputArray);
      }
};

struct Response_t
{
    Bitmap4C_t output;
};

int customGarbageCount = 2;
uintptr_t* customGarbage = new uintptr_t[customGarbageCount];

Response_t processFrame(Bitmap4C_t input) {
    uint8_t* inputArray = reinterpret_cast<uint8_t*>(input.ptr);

    Bitmap4C_t output(input.width, input.height);
    uint8_t* outputArray = reinterpret_cast<uint8_t*>(output.ptr);

    for (int i = 0; i < input.byteLength; i+=4) {
      int r = inputArray[i + 0];
      int g = inputArray[i + 1];
      int b = inputArray[i + 2];
      int a = inputArray[i + 3];
      int avg = (r+g+b) / 3;
      outputArray[i + 0] = avg;
      outputArray[i + 1] = avg;
      outputArray[i + 2] = avg;
      outputArray[i + 3] = a;
    }

    Response_t response = { /*output=*/ output };

    customGarbage[0] = input.ptr;
    customGarbage[1] = response.output.ptr;

    Mat drawing = Mat::zeros(3, 3, CV_8UC3);
    drawing.release();

    return response;
}

void freeMemory() {
  for (int i = 0; i < customGarbageCount; i++) {
    if (customGarbage[i] != 0) {
      uintptr_t ptr = customGarbage[i]; 
      void* castedPtr = reinterpret_cast<void *>(ptr);
      free(castedPtr);
    }
  }
}

EMSCRIPTEN_BINDINGS(image) {
  class_<Bitmap4C_t>("Bitmap4C")
    .constructor<int32_t, int32_t>()
    .property("ptr", &Bitmap4C_t::ptr)
    .property("width", &Bitmap4C_t::width)
    .property("height", &Bitmap4C_t::height)
    .property("byteLength", &Bitmap4C_t::byteLength)
    ;

  class_<Response_t>("Response")
    .property("output", &Response_t::output)
    ;

  function("processFrame", &processFrame);
  function("freeMemory", &freeMemory);
}
