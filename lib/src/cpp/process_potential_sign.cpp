#include <math.h>
#include <opencv2/imgproc.hpp>

#include "process_potential_sign.hpp"
#include "crop_sign.hpp"
#include "classify_sign.hpp"
#include "models/polygon.hpp"

void processPotentialSign(cv::Mat &src, cv::Mat &dst, std::vector<std::vector<cv::Point>> contours, int contour_idx, double area_threshold)
{
    std::vector<cv::Point> contour = contours.at(contour_idx);
    Polygon polygon = Polygon(contour);

    // check area using area_threshold
    if (polygon.getArea() < area_threshold) return;

    // check compactness
    double compactness = polygon.getCompactness();
    if (compactness < 0 || compactness > 5) return;

    // approximate contour and count vertices
    std::vector<cv::Point> approximated_contour;
    cv::approxPolyDP(contour, approximated_contour, polygon.getPerimeter() * 0.0125, true);
    int vertices_count = (int) approximated_contour.size();

    // determine shape of approximated contour and crop sign
    cv::Mat cropped;
    if (vertices_count == 4) {
        cropQuadraliteralSign(src, cropped, approximated_contour);

        // copy cropped to top center
        cropped.copyTo(dst(cv::Rect((dst.cols - cropped.cols) / 2, 0, cropped.cols, cropped.rows)));
    } else {
        return;
    }

    // TODO pass sign shape for filtering templates
    classifySign(cropped);
    // TODO retrieve sign class
    // TODO draw contour and write sign class

    // cv::Scalar color1 = cv::Scalar(rng.uniform(0, 256), rng.uniform(0, 256), rng.uniform(0, 256), 255);
    cv::Scalar color1 = cv::Scalar(0, 0, 255, 255);
    cv::Scalar color2 = cv::Scalar(255, 0, 0, 255);
    cv::drawContours(dst, contours, contour_idx, color1, 2, cv::LINE_8);
    for (int i = 0; i < approximated_contour.size(); i++) {
        cv::circle(dst, approximated_contour.at(i), 4, color2, -1);
    }
}
