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
    bool match = false;
    SignPattern signPattern = UNKNOWN_SIGN_PATTERN;
    for (size_t i = 0; i < signPatterns.size(); i++) {
        signPattern = signPatterns[i];
        if (signPattern.match(sign))
        {
            printf("pattern %d is matching\n", (int) i);
            writeLabel(dst, "pattern_" + std::to_string((int) i));
            match = true;
            break;
        }
    }

    if (!match) {
        printf("no matching sign found\n");
        writeLabel(dst, "unknown");
    }

    // TODO write sign class
    cv::Scalar color1 = cv::Scalar(0, 0, 255, 255);
    std::vector<std::vector<cv::Point2i>> contours = {contour};
    cv::drawContours(dst, contours, 0, color1, 2, cv::LINE_8);
}
