#include <opencv2/imgproc.hpp>

#include "colorized_canny.hpp"

void colorizedCanny(cv::Mat &src, cv::Mat &dst, double lowerThreshold, double upperThreshold)
{
    cv::Mat channels[4];
    split(src, channels);

    cv::Mat cannyChannels[3];
    cv::Canny(channels[0], cannyChannels[0], lowerThreshold, upperThreshold);
    cv::Canny(channels[1], cannyChannels[1], lowerThreshold, upperThreshold);
    cv::Canny(channels[2], cannyChannels[2], lowerThreshold, upperThreshold);

    // logical or
    dst.create(src.rows, src.cols, CV_8UC1);
    cv::bitwise_or(cannyChannels[0], cannyChannels[1], dst);
    cv::bitwise_or(dst, cannyChannels[2], dst);
}
