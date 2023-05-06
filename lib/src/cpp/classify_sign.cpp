#include <opencv2/imgproc.hpp>

#include "assets.hpp"
#include "classify_sign.hpp"
#include "operators/colorized_canny.hpp"

double getFontScale(cv::Mat img) {
    // TODO use image width and height for calculating font size
    return std::max(1.3 / 1000 * img.rows, 1.0);
}

int getInnerThickness(cv::Mat img) {
    return 2.0 * getFontScale(img);
}

int getOuterThickness(cv::Mat img) {
    int innerThickness = getInnerThickness(img);
    return innerThickness + std::max((int) (innerThickness * 1.0), 4);
}

void drawContour(cv::Mat &dst, std::vector<cv::Point2i> contour)
{
    std::vector<std::vector<cv::Point2i>> contours = {contour};
    cv::drawContours(dst, contours, 0, cv::Scalar(255, 255, 255, 255), getOuterThickness(dst), cv::LINE_8);
    cv::drawContours(dst, contours, 0, cv::Scalar(0, 0, 255, 255), getInnerThickness(dst), cv::LINE_8);
}

void writeLabel(cv::Mat &dst, std::string label, std::vector<cv::Point2i> contour)
{
    int fontFace = cv::FONT_HERSHEY_SIMPLEX;
    double fontScale = getFontScale(dst);
    int innerThickness = getInnerThickness(dst);
    int outerThickness = getOuterThickness(dst);
    int baseline = 0;
    cv::Size textSize = cv::getTextSize(label, fontFace, fontScale, outerThickness, &baseline);

    cv::Rect boundingBox = cv::boundingRect(contour);
    int x = boundingBox.x + (boundingBox.width - textSize.width) / 2;
    int y = boundingBox.y + (boundingBox.height + textSize.height) / 2;
    cv::putText(dst, label, cv::Point2i(x, y), fontFace, fontScale, cv::Scalar(255, 255, 255, 255), outerThickness);
    cv::putText(dst, label, cv::Point2i(x, y), fontFace, fontScale, cv::Scalar(255, 0, 0, 255), innerThickness);
}

// TODO how to return sign_class
void classifySign(cv::Mat &cropped, cv::Mat &dst, std::vector<cv::Point2i> contour)
{
    // calculate colorized canny
    cv::Mat canny;
    colorizedCanny(cropped, canny, 75, 150);
    Sign sign = Sign(canny, 4);

    // TODO add enum for sign shape
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
