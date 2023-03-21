#include <stdio.h>
#include <emscripten/bind.h>

using namespace emscripten;

struct Bitmap4C_t
{
    uintptr_t ptr;
    int32_t width;
    int32_t height;
    // add method for calculating the byte length of the bitmap
};

struct Response_t
{
    Bitmap4C_t output;
};

int customGarbageCount = 2;
uintptr_t* customGarbage = new uintptr_t[customGarbageCount];

Response_t processFrame(Bitmap4C_t input) {
    uint8_t* inputArray = reinterpret_cast<uint8_t*>(input.ptr);
    int inputByteLength = input.width * input.height * 4;

    uint8_t* outputArray = new uint8_t[inputByteLength];

    for (int i = 0; i < inputByteLength; i+=4) {
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

    Response_t response;
    response.output.ptr = reinterpret_cast<uintptr_t>(outputArray);
    response.output.width = input.width;
    response.output.height = input.height;

    customGarbage[0] = input.ptr;
    customGarbage[1] = response.output.ptr;

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
    .constructor<>()
    .property("ptr", &Bitmap4C_t::ptr)
    .property("width", &Bitmap4C_t::width)
    .property("height", &Bitmap4C_t::height)
    ;

  class_<Response_t>("Response")
    .constructor<>()
    .property("output", &Response_t::output)
    ;

  function("processFrame", &processFrame);
  function("freeMemory", &freeMemory);
}
