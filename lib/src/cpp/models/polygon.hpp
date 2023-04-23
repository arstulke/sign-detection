#include <opencv2/imgproc.hpp>

#ifndef MODELS__POLYGON
#define MODELS__POYLGON

class Polygon {
    public:
        Polygon(std::vector<cv::Point2i> contour);
        double getArea();
        double getPerimeter();
        double getCompactness();
    private:
        std::vector<cv::Point2i> contour;

        double area;
        bool is_area_defined;

        double perimeter;
        bool is_perimeter_defined;
};

#endif
