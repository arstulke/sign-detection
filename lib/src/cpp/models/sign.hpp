#include <opencv2/imgproc.hpp>

#ifndef MODELS__SIGN
#define MODELS__SIGN

class Sign
{
public:
    cv::Mat canny;
    cv::Mat invertedDilated;
    Sign(cv::Mat canny);
};

class SignPattern : public Sign {
public:
    using Sign::Sign;
    bool match(Sign other) const;
};

SignPattern createSignPatternForRgba(cv::Mat cannyRgba);

#endif
