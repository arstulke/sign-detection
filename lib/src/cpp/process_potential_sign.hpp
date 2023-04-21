#include <opencv2/imgproc.hpp>

#ifndef PROCESS_POTENTIAL_SIGN
#define PROCESS_POTENTIAL_SIGN

void processPotentialSign(cv::Mat &src, cv::Mat &dst, std::vector<cv::Point2i> contour, double area_threshold);

#endif
