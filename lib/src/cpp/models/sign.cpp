#include <opencv2/imgproc.hpp>

#include "sign.hpp"

// Sign
void prepareForSign(cv::Mat &originalCanny, cv::Mat &canny, cv::Mat &invertedDilated)
{
  int diagonalLength = ceil(sqrt(pow(originalCanny.cols, 2) + pow(originalCanny.rows, 2)));
  if (diagonalLength % 2 == 1)
  {
    diagonalLength++;
  }

  cv::Rect roi = cv::Rect(
      (diagonalLength - originalCanny.cols) / 2, // x
      (diagonalLength - originalCanny.rows) / 2, // y
      originalCanny.cols,                        // width
      originalCanny.rows                         // height
  );
  canny = cv::Mat::zeros(diagonalLength, diagonalLength, CV_8UC1);
  originalCanny.copyTo(canny(roi));

  cv::Mat dilated;
  cv::Mat dilateElement = cv::getStructuringElement(cv::MORPH_ELLIPSE, cv::Size(21, 21));
  cv::dilate(canny, dilated, dilateElement);
  cv::bitwise_not(dilated, invertedDilated);
}

Sign::Sign(cv::Mat originalCanny, int rotationCount)
{
  cv::Mat canny, invertedDilated;
  prepareForSign(originalCanny, canny, invertedDilated);

  this->canny = canny;
  this->invertedDilated = invertedDilated;

  this->rotationCount = rotationCount;
  this->canny_2.resize(rotationCount);
  this->invertedDilated_2.resize(rotationCount);
  this->canny_2[0] = canny;
  this->invertedDilated_2[0] = invertedDilated;

  double angle = 360.0 / rotationCount;
  for (int i = 1; i < rotationCount; i++)
  {
    cv::Mat rotationMatrix = cv::getRotationMatrix2D(cv::Point2f(canny.cols / 2, canny.rows / 2), i * angle, 1.0);
    cv::Mat rotationMatrix2 = cv::getRotationMatrix2D(cv::Point2f(canny.cols / 2, canny.rows / 2), i * angle, 1.0);

    cv::warpAffine(canny, this->canny_2[i], rotationMatrix, canny.size());
    cv::warpAffine(invertedDilated, this->invertedDilated_2[i], rotationMatrix2, invertedDilated.size());
  }
}

// SignPattern
SignPattern::SignPattern(cv::Mat canny, std::string name) : Sign(canny, 1)
{
  this->name = name;
}

bool matchSingle(cv::Mat cannyA, cv::Mat invertedDilatedA, cv::Mat cannyB, cv::Mat invertedDilatedB)
{
  // erase: result = (normal - dilated)
  cv::Mat erasedA;
  cv::Mat erasedB;
  cv::bitwise_and(cannyA, invertedDilatedB, erasedA);
  cv::bitwise_and(cannyB, invertedDilatedA, erasedB);

  // count white pixels
  int countA = cv::countNonZero(cannyA);
  int countB = cv::countNonZero(cannyB);
  int countErasedA = cv::countNonZero(erasedA);
  int countErasedB = cv::countNonZero(erasedB);

  // calculate relative erased pixels
  double relErasedFromA = 1 - (countErasedA / (double)countA);
  double relErasedFromB = 1 - (countErasedB / (double)countB);

  // TODO improve thresholds
  bool isAMatching = relErasedFromA >= 0.80;
  bool isBMatching = relErasedFromB >= 0.80;

  return isAMatching && isBMatching;
}

bool SignPattern::match(Sign other) const
{
  for (int i = 0; i < this->rotationCount; i++)
  {
    for (int j = 0; j < other.rotationCount; j++)
    {
      if (matchSingle(this->canny_2[i], this->invertedDilated_2[i], other.canny_2[j], other.invertedDilated_2[j]))
      {
        return true;
      }
    }
  }
  return false;
}
