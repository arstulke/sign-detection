#include <opencv2/imgproc.hpp>

#include "sign.hpp"

// Sign
Sign::Sign(cv::Mat canny)
{
  this->canny = canny;

  cv::Mat dilated;
  cv::Mat dilateElement = cv::getStructuringElement(cv::MORPH_ELLIPSE, cv::Size(21, 21));
  cv::dilate(this->canny, dilated, dilateElement);
  cv::bitwise_not(dilated, this->invertedDilated);
}

// SignPattern
SignPattern::SignPattern(cv::Mat canny, std::string name) : Sign(canny)
{
  this->name = name;
}

bool SignPattern::match(Sign other) const
{
  // erase: result = (normal - dilated)
  cv::Mat erasedThis;
  cv::Mat erasedOther;
  cv::bitwise_and(this->canny, other.invertedDilated, erasedThis);
  cv::bitwise_and(other.canny, this->invertedDilated, erasedOther);

  // count white pixels
  int countThis = cv::countNonZero(this->canny);
  int countOther = cv::countNonZero(other.canny);
  int countErasedThis = cv::countNonZero(erasedThis);
  int countErasedOther = cv::countNonZero(erasedOther);

  // calculate relative erased pixels
  double relErasedFromThis = 1 - (countErasedThis / (double)countThis);
  double relErasedFromOther = 1 - (countErasedOther / (double)countOther);

  // TODO improve thresholds
  bool isThisMatching = relErasedFromThis >= 0.80;
  bool isOtherMatching = relErasedFromOther >= 0.80;

  return isThisMatching && isOtherMatching;
}
