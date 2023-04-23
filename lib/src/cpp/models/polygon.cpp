#include "polygon.hpp"

Polygon::Polygon(std::vector<cv::Point2i> contour) {
    this->contour = contour;
    this->is_area_defined = false;
    this->is_perimeter_defined = false;

    this->clockwiseContour = contour;
    if (cv::contourArea(contour, true) < 0) {
        std::reverse(this->clockwiseContour.begin(), this->clockwiseContour.end());
    }
}

double Polygon::getArea() {
    if (this->is_area_defined) {
        return this->area;
    }

    double area = cv::contourArea(this->contour, false);
    this->area = area;
    this->is_area_defined = true;
    
    return area;
}

double Polygon::getPerimeter() {
    if (this->is_perimeter_defined) {
        return this->perimeter;
    }

    double perimeter = cv::arcLength(contour, true);
    this->perimeter = perimeter;
    this->is_perimeter_defined = true;
    
    return perimeter;
}

double Polygon::getCompactness() {
    double area = this->getArea();
    double perimeter = this->getPerimeter();

    if (area == 0) return -1;
    return perimeter * perimeter / (4 * M_PI * area);
}
