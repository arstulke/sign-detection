#include <math.h>
#include <opencv2/imgproc.hpp>

#include "locate_signs.hpp"
#include "process_potential_sign.hpp"
#include "operators/colorized_canny.hpp"

// TODO array for describing detected signs?
void locateSigns(cv::Mat &src, cv::Mat &dst)
{
    // TODO resize to fixed size

    // writer src image as grayscale to dst
    cv::Mat gray;
    cv::cvtColor(src, gray, cv::COLOR_RGBA2GRAY);
    cv::cvtColor(gray, dst, cv::COLOR_GRAY2RGBA);

    // calculate colorized canny
    cv::Mat gaussian;
    cv::Mat canny_output;
    cv::GaussianBlur(src, gaussian, cv::Size(9, 9), 0);
    colorizedCanny(gaussian, canny_output, 75, 150);

    // calculate area threshold for potential sign
    double image_area = src.cols * src.rows;
    double sign_area_threshold = image_area / 1000.0;

    // find contours in colorized canny output
    std::vector<std::vector<cv::Point2i>> contours;
    std::vector<cv::Vec4i> hierarchy;
    cv::findContours(canny_output, contours, hierarchy, cv::RETR_CCOMP, cv::CHAIN_APPROX_NONE);

    for (size_t i = 0; i < contours.size(); i++)
    {
        if (hierarchy[i][3] == -1) // if has no parent
        {
            processPotentialSign(src, dst, contours.at(i), sign_area_threshold);
        }
    }
}
