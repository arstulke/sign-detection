#include <opencv2/imgproc.hpp>

#include "crop_sign.hpp"

void cropQuadraliteralSign(cv::Mat &src, cv::Mat &dst, std::vector<cv::Point> approximated_contour)
{
    // get bounding box of approximated contour
    cv::Rect bounding_box = cv::boundingRect(approximated_contour);
    double width = bounding_box.width;
    double height = bounding_box.height;

    // TODO implement crop
    src(bounding_box).copyTo(dst);
}
