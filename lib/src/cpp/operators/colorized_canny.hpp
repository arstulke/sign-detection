#include <opencv2/imgproc.hpp>

#ifndef OPERATORS__COLORIZED_CANNY
#define OPERATORS__COLORIZED_CANNY

void colorizedCanny(cv::Mat &src, cv::Mat &dst, double lowerThreshold, double upperThreshold);

#endif
