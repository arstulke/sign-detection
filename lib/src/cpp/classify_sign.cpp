#include <opencv2/imgproc.hpp>

#include "assets.hpp"
#include "classify_sign.hpp"
#include "operators/colorized_canny.hpp"

void drawContour(cv::Mat &dst, std::vector<cv::Point2i> contour)
{
    // TODO add second color for constrast
    // TODO increase thickness
    int thickness = std::max((int) round(2.6 / 1000 * dst.rows), 2);

    std::vector<std::vector<cv::Point2i>> contours = {contour};
    cv::Scalar color = cv::Scalar(0, 0, 255, 255);
    cv::drawContours(dst, contours, 0, color, thickness, cv::LINE_8);
}

void writeLabel(cv::Mat &dst, std::string label, std::vector<cv::Point2i> contour)
{
    // TODO add second color for constrast
    // TODO increase thickness
    int fontFace = cv::FONT_HERSHEY_SIMPLEX;
    double fontScale = std::max(1.3 / 1000 * dst.rows, 1.0);
    int thickness = fontScale * 2;
    int baseline = 0;
    cv::Size textSize = cv::getTextSize(label, fontFace, fontScale, thickness, &baseline);

    cv::Rect boundingBox = cv::boundingRect(contour);
    int x = boundingBox.x + (boundingBox.width - textSize.width) / 2;
    int y = boundingBox.y + (boundingBox.height + textSize.height) / 2;
    cv::Scalar color = cv::Scalar(255, 0, 0, 255);
    cv::putText(dst, label, cv::Point2i(x, y), fontFace, fontScale, color, thickness);
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

    // check if sign patterns are matching
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

    // mark matching result
    printf("detected type: %s\n", signPattern.name.c_str());
    drawContour(dst, contour);
    writeLabel(dst, signPattern.name, contour);
}
