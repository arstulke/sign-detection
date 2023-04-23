#include <opencv2/imgproc.hpp>

#include "crop_sign.hpp"

void cropQuadraliteralSign(cv::Mat &src, cv::Mat &dst, std::vector<cv::Point2i> contour_i, std::vector<cv::Point2i> approximated_contour_i)
{
    std::vector<cv::Point2f> contour;
    std::vector<cv::Point2f> approximated_contour;
    cv::Mat(contour_i).convertTo(contour, cv::Mat(contour).type());
    cv::Mat(approximated_contour_i).convertTo(approximated_contour, cv::Mat(approximated_contour).type());

    // init variables
    std::vector<cv::Point2f> src_corners(4);
    std::vector<cv::Point2f> dst_corners(4);
    float relative_border, absolute_border, x_border, y_border;

    // transform image
    float transformed_size = 256;
    x_border = 5;
    y_border = x_border;
    src_corners = approximated_contour;
    dst_corners = {
        {x_border, y_border},
        {transformed_size - x_border, y_border},
        {transformed_size - x_border, transformed_size - y_border},
        {x_border, transformed_size - y_border}};
    cv::Mat transform_image_mat = cv::getPerspectiveTransform(src_corners, dst_corners, cv::DECOMP_LU);
    cv::Size transformed_image_size = cv::Size(transformed_size, transformed_size);

    // prepare dst
    dst = cv::Mat::zeros(transformed_image_size, CV_8UC4);

    // warp image
    cv::Mat tmp;
    cv::warpPerspective(src, dst, transform_image_mat, transformed_image_size);
}
