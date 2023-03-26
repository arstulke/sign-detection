#include <stdio.h>
#include <emscripten/bind.h>
#include <opencv2/imgproc.hpp>

using namespace emscripten;

class Bitmap4C_t
{
    private:
      cv::Mat* mat;
      bool freeMat;
      bool freePtr;
    public:
      uintptr_t ptr;
      int32_t width;
      int32_t height;
      int32_t byteLength;
      static const int32_t BYTES_PER_PIXEL = 4;

      // TODO can this be private?
      Bitmap4C_t() {
        this->freeMat = false;
        this->freePtr = false;
      }

      Bitmap4C_t(int32_t width, int32_t height) {
        int32_t byteLength = width * height * BYTES_PER_PIXEL;
        uint8_t* outputArray = new uint8_t[byteLength];

        cv::Mat* mat = new cv::Mat(height, width, CV_8UC4, outputArray);
        
        this->mat = mat;
        this->freeMat = true;
        this->freePtr = true;
        this->width = width;
        this->height = height;
        this->byteLength = byteLength;
        this->ptr = reinterpret_cast<uintptr_t>(outputArray);
      }

      Bitmap4C_t(cv::Mat* mat) {
        this->mat = mat;
        this->freeMat = true;
        this->freePtr = false;
        this->width = mat->cols;
        this->height = mat->rows;
        this->byteLength = mat->total() * BYTES_PER_PIXEL;
        this->ptr = reinterpret_cast<uintptr_t>(mat->data);
      }

      cv::Mat getMat() {
        return *this->mat;
      }

      void release() {
        if (this->freeMat) {
          this->mat->release();
        }

        if (this->freePtr) {
          void* castedPtr = reinterpret_cast<void *>(this->ptr);
          free(castedPtr);
        }
      }
};

struct Response_t
{
    Bitmap4C_t output;
};

int customGarbageCount = 2;
Bitmap4C_t* customGarbage = new Bitmap4C_t[customGarbageCount];

Response_t processFrame(Bitmap4C_t inputBitmap) {
    cv::Mat input = inputBitmap.getMat();
    cv::Mat gray, output;
    cv::cvtColor(input, gray, cv::COLOR_RGBA2GRAY);
    cv::cvtColor(gray, output, cv::COLOR_GRAY2RGBA);

    Response_t response = { /*output=*/ Bitmap4C_t(&output) };

    customGarbage[0] = inputBitmap;
    customGarbage[1] = response.output;

    return response;
}

void freeMemory() {
  for (int i = 0; i < customGarbageCount; i++) {
    Bitmap4C_t bitmap = customGarbage[i]; 
    bitmap.release();
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
