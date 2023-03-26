#include <opencv2/imgproc.hpp>

#ifndef COLORIZED_CANNY
#define COLORIZED_CANNY
#endif

void colorizedCanny(cv::Mat& src, cv::Mat& dst, double lowerThreshold, double upperThreshold);
