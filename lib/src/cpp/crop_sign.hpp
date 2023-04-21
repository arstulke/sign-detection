#include <opencv2/imgproc.hpp>

#ifndef CROP_SIGN
#define CROP_SIGN

void cropQuadraliteralSign(cv::Mat &src, cv::Mat &dst, std::vector<cv::Point2i> contour, std::vector<cv::Point2i> approximated_contour);

#endif
