#include <opencv2/imgproc.hpp>

#ifndef INTEROP__BITMAP
#define INTEROP__BITMAP

class Bitmap4C_t
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

  Bitmap4C_t();
  Bitmap4C_t(int32_t width, int32_t height);
  Bitmap4C_t(cv::Mat *mat);

  cv::Mat getMat();

  void release();
};

#endif
