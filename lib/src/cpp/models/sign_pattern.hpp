#include <opencv2/imgproc.hpp>

#ifndef MODELS__SIGN_PATTERN
#define MODELS__SIGN_PATTERN

class SignPattern
{
public:
    cv::Mat canny;
    SignPattern(cv::Mat cannyRgba);
};

#endif
