#include <opencv2/imgproc.hpp>

#ifndef MODELS__SIGN
#define MODELS__SIGN

class Sign
{
public:
    int rotationCount;
    std::vector<cv::Mat> canny;
    std::vector<cv::Mat> invertedDilated;

    Sign(cv::Mat canny, int rotationCount);
};

class SignPattern : public Sign
{
public:
    std::string name;

    SignPattern(cv::Mat canny, std::string name);
    bool match(Sign other) const;
};

const SignPattern UNKNOWN_SIGN_PATTERN = SignPattern(cv::Mat::zeros(1, 1, CV_8UC1), "unknown");

#endif
