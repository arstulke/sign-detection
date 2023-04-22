#include <opencv2/imgproc.hpp>

#ifndef CLASSIFY_SIGN
#define CLASSIFY_SIGN

void classifySign(cv::Mat &cropped, cv::Mat &dst, std::vector<cv::Point2i> contour);

#endif
