#include <opencv2/imgproc.hpp>

#include "sign_pattern.hpp"

SignPattern::SignPattern(cv::Mat cannyRgba) {
  cv::cvtColor(cannyRgba, this->canny, cv::COLOR_RGBA2GRAY);
}
