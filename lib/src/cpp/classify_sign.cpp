#include <opencv2/imgproc.hpp>

#include "assets.hpp"
#include "classify_sign.hpp"
#include "operators/colorized_canny.hpp"

// TODO how to return sign_class
void classifySign(cv::Mat &cropped, cv::Mat &dst, std::vector<cv::Point2i> contour)
{
    cv::cvtColor(firstAid.canny, dst, cv::COLOR_GRAY2RGBA);
    printf("w=%d,h=%d\n", dst.cols, dst.rows);
    return;

    // calculate colorized canny
    cv::Mat tmp;
    cv::Mat canny;
    colorizedCanny(cropped, tmp, 75, 150);
    cv::cvtColor(tmp, canny, cv::COLOR_GRAY2RGBA);

    // TODO write sign class
    // cv::Scalar color1 = cv::Scalar(rng.uniform(0, 256), rng.uniform(0, 256), rng.uniform(0, 256), 255);
    cv::Scalar color1 = cv::Scalar(0, 0, 255, 255);
    std::vector<std::vector<cv::Point2i>> contours = {contour};
    cv::drawContours(dst, contours, 0, color1, 2, cv::LINE_8);
    /*
    cv::Scalar color2 = cv::Scalar(255, 0, 0, 255);
    for (int i = 0; i < approximated_contour.size(); i++) {
        cv::circle(dst, approximated_contour.at(i), 4, color2, -1);
    }
    */

    cv::Mat dst_part = canny;
    dst_part.copyTo(dst(cv::Rect((dst.cols - dst_part.cols) / 2, 0, dst_part.cols, dst_part.rows)));
    printf("breakpoint99\n");
}
