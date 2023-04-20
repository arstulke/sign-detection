#include <math.h>
#include <opencv2/imgproc.hpp>

#include "locate_signs.hpp"
#include "process_potential_sign.hpp"
#include "operators/colorized_canny.hpp"

cv::RNG rng(12345);

// TODO array for describing detected signs?
void locateSigns(cv::Mat &src, cv::Mat &dst)
{
    // writer src image as grayscale to dst
    cv::Mat gray;
    cv::cvtColor(src, gray, cv::COLOR_RGBA2GRAY);
    cv::cvtColor(gray, dst, cv::COLOR_GRAY2RGBA);

    // calculate colorized canny
    cv::Mat canny_output;
    colorizedCanny(src, canny_output, 75, 150);

    // calculate area threshold for potential sign
    double image_area = src.cols * src.rows;
    double sign_area_threshold = image_area / 10000.0;

    // find contours in colorized canny output
    std::vector<std::vector<cv::Point>> contours;
    std::vector<cv::Vec4i> hierarchy;
    cv::findContours(canny_output, contours, hierarchy, cv::RETR_TREE, cv::CHAIN_APPROX_NONE);

    for (size_t i = 0; i < contours.size(); i++)
    {
        processPotentialSign(src, dst, contours, (int) i, sign_area_threshold);
    }
}
