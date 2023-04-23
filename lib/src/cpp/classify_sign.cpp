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

    // TODO rotate 4 times
    // TODO compare only with quadraliteral signs

    // TODO position sign class label

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
        writeLabel(dst, "unknown");
    }

    // TODO write sign class
    cv::Scalar color1 = cv::Scalar(0, 0, 255, 255);
    std::vector<std::vector<cv::Point2i>> contours = {contour};
    cv::drawContours(dst, contours, 0, color1, 2, cv::LINE_8);
}
