#include <opencv2/imgproc.hpp>

#include "bitmap.hpp"

Bitmap4C::Bitmap4C()
{
  this->freeMat = false;
  this->freePtr = false;
}

Bitmap4C::Bitmap4C(int32_t width, int32_t height)
{
  int32_t byteLength = width * height * BYTES_PER_PIXEL;
  uint8_t *outputArray = new uint8_t[byteLength];

  cv::Mat *mat = new cv::Mat(height, width, CV_8UC4, outputArray);

  this->mat = mat;
  this->freeMat = true;
  this->freePtr = true;
  this->width = width;
  this->height = height;
  this->byteLength = byteLength;
  this->ptr = reinterpret_cast<uintptr_t>(outputArray);
}

Bitmap4C::Bitmap4C(cv::Mat *mat)
{
  this->mat = mat;
  this->freeMat = true;
  this->freePtr = false;
  this->width = mat->cols;
  this->height = mat->rows;
  this->byteLength = mat->total() * BYTES_PER_PIXEL;
  this->ptr = reinterpret_cast<uintptr_t>(mat->data);
}

cv::Mat Bitmap4C::getMat()
{
  return *this->mat;
}

void Bitmap4C::release()
{
  if (this->freeMat)
  {
    this->mat->release();
  }

  if (this->freePtr)
  {
    void *castedPtr = reinterpret_cast<void *>(this->ptr);
    free(castedPtr);
  }
}
