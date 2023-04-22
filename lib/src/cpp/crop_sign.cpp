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

    // transform contour
    cv::Rect bounding_box_approx = cv::boundingRect(approximated_contour_i);
    float approx_size = bounding_box_approx.width > bounding_box_approx.height ? bounding_box_approx.width : bounding_box_approx.height;
    relative_border = 0.1;
    absolute_border = 0;
    x_border = (int)(approx_size * relative_border + absolute_border);
    y_border = (int)(approx_size * relative_border + absolute_border);
    src_corners = approximated_contour;
    dst_corners = {
        {x_border, y_border},
        {approx_size + x_border, y_border},
        {approx_size + x_border, approx_size + y_border},
        {x_border, approx_size + y_border}};
    cv::Mat transform_contour_mat = cv::getPerspectiveTransform(src_corners, dst_corners, cv::DECOMP_LU);
    std::vector<cv::Point2f> transformed_contour;
    cv::perspectiveTransform(contour, transformed_contour, transform_contour_mat);
    cv::Size transformed_contour_size = cv::Size(approx_size + 2 * x_border, approx_size + 2 * y_border);

    // approximate transformed contour
    std::vector<cv::Point2f> transformed_approximated_contour;
    cv::approxPolyDP(transformed_contour, transformed_approximated_contour, cv::arcLength(transformed_contour, true) * 0.0125, true);

    // transform image
    cv::Rect bounding_box_transformed = cv::boundingRect(transformed_contour);
    float transformed_size = bounding_box_transformed.width > bounding_box_transformed.height ? bounding_box_transformed.width : bounding_box_transformed.height;
    relative_border = 0.015;
    absolute_border = 0;
    x_border = (int)(transformed_size * relative_border + absolute_border);
    y_border = (int)(transformed_size * relative_border + absolute_border);
    src_corners = transformed_approximated_contour;
    dst_corners = {
        {x_border, y_border},
        {transformed_size + x_border, y_border},
        {transformed_size + x_border, transformed_size + y_border},
        {x_border, transformed_size + y_border}};
    cv::Mat transform_image_mat = cv::getPerspectiveTransform(src_corners, dst_corners, cv::DECOMP_LU);
    cv::Size transformed_image_size = cv::Size(transformed_size + 2 * x_border, transformed_size + 2 * y_border);

    // warp image
    cv::Mat tmp;
    cv::warpPerspective(src, tmp, transform_contour_mat, transformed_contour_size);
    cv::warpPerspective(tmp, dst, transform_image_mat, transformed_image_size);
}
