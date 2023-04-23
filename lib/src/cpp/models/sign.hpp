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

const SignPattern UNKNOWN_SIGN_PATTERN = SignPattern(cv::Mat::zeros(1, 1, CV_8UC1));

#endif
