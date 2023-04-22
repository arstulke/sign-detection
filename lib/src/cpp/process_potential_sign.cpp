#include <math.h>
#include <opencv2/imgproc.hpp>

#include "process_potential_sign.hpp"
#include "crop_sign.hpp"
#include "classify_sign.hpp"
#include "models/polygon.hpp"

void processPotentialSign(cv::Mat &src, cv::Mat &dst, std::vector<cv::Point2i> contour, double area_threshold)
{
    Polygon polygon = Polygon(contour);

    // check area using area_threshold
    if (polygon.getArea() < area_threshold) return;

    // check compactness
    double compactness = polygon.getCompactness();
    if (compactness < 0 || compactness > 5) return;

    // approximate contour and count vertices
    std::vector<cv::Point2i> approximated_contour;
    cv::approxPolyDP(contour, approximated_contour, polygon.getPerimeter() * 0.0125, true);
    int vertices_count = (int) approximated_contour.size();

    // determine shape of approximated contour and crop sign
    cv::Mat cropped;
    if (vertices_count == 4) {
        cropQuadraliteralSign(src, cropped, contour, approximated_contour);
    } else {
        return;
    }

    // TODO pass sign shape for filtering templates
    classifySign(cropped, dst, contour);
    // TODO retrieve sign class
}
