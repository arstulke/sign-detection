#include <opencv2/imgproc.hpp>

#include "detect_signs.hpp"
#include "operators/colorized_canny.hpp"

// TODO array for describing detected signs?
void detectSigns(cv::Mat &src, cv::Mat &dst)
{
    cv::Mat gray;
    colorizedCanny(src, gray, 75, 150);
    cv::cvtColor(gray, dst, cv::COLOR_GRAY2RGBA);
}
