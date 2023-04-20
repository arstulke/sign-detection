#include <opencv2/imgproc.hpp>

#include "crop_sign.hpp"

void cropQuadraliteralSign(cv::Mat &src, cv::Mat &dst, std::vector<cv::Point> approximated_contour)
{
    // TODO implement crop
    src.copyTo(dst);
}
