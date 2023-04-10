#include <opencv2/imgproc.hpp>

#ifndef INTEROP__MODEL__BITMAP
#define INTEROP__MODEL__BITMAP

class Bitmap4C
{
private:
  cv::Mat *mat;
  bool freeMat;
  bool freePtr;

public:
  uintptr_t ptr;
  int32_t width;
  int32_t height;
  int32_t byteLength;
  static const int32_t BYTES_PER_PIXEL = 4;

  Bitmap4C();
  Bitmap4C(int32_t width, int32_t height);
  Bitmap4C(cv::Mat *mat);

  cv::Mat getMat();

  void release();
};

#endif
