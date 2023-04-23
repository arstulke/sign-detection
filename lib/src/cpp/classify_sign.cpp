#include <opencv2/imgproc.hpp>

#include "assets.hpp"
#include "classify_sign.hpp"
#include "operators/colorized_canny.hpp"

void drawContour(cv::Mat &dst, std::vector<cv::Point2i> contour)
{
    std::vector<std::vector<cv::Point2i>> contours = {contour};
    cv::drawContours(dst, contours, 0, cv::Scalar(0, 0, 255, 255), 2, cv::LINE_8);
}

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
    SignPattern signPattern = UNKNOWN_SIGN_PATTERN;
    for (size_t i = 0; i < signPatterns.size(); i++)
    {
        SignPattern currentSignPattern = signPatterns[i];
        if (currentSignPattern.match(sign))
        {
            signPattern = currentSignPattern;
            break;
        }
    }
    printf("detected type: %s\n", signPattern.name.c_str());

    drawContour(dst, contour);
    writeLabel(dst, signPattern.name);
}
