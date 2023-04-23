#include <opencv2/imgproc.hpp>

#include "assets.hpp"
#include "classify_sign.hpp"
#include "operators/colorized_canny.hpp"

void writeLabel(cv::Mat &dst, std::string label)
{
    cv::putText(dst, label, cv::Point2i(10, dst.rows / 2), cv::FONT_HERSHEY_SIMPLEX, 1, cv::Scalar(255, 0, 0, 255), 2);
}

// TODO how to return sign_class
void classifySign(cv::Mat &cropped, cv::Mat &dst, std::vector<cv::Point2i> contour)
{
    // calculate colorized canny
    cv::Mat canny;
    colorizedCanny(cropped, canny, 75, 150);
    Sign sign = Sign(canny);

    // TODO compare
    // rotate 4 times
    // compare only with quadraliteral signs

    if (fireExtinguisher1.match(sign))
    {
        printf("fireExtinguisher1 is matching\n");
        writeLabel(dst, "fireExthinguisher1");
    }
    else if (fireExtinguisher2.match(sign))
    {
        printf("fireExtinguisher2 is matching\n");
        writeLabel(dst, "fireExthinguisher2");
    }
    else if (firstAid.match(sign))
    {
        printf("firstAid is matching\n");
        writeLabel(dst, "firstAid");
    }
    else
    {
        printf("no matching sign found\n");
        writeLabel(dst, "noMatch");
        return;
    }

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

    return;
    cv::Mat dst_part = canny;
    dst_part.copyTo(dst(cv::Rect((dst.cols - dst_part.cols) / 2, 0, dst_part.cols, dst_part.rows)));
    printf("breakpoint99\n");
}
