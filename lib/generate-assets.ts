#!/usr/bin/env -S deno run --allow-read --allow-write

import { decode } from "https://deno.land/x/pngs/mod.ts";

const outputFile = "src/cpp/assets.cpp";
const signPatternsPixelPerLine = 6;
const signPatternsValuesPerPixel = 4;
const signPatternsValuesPerLine = signPatternsPixelPerLine *
  signPatternsValuesPerPixel;

generateAssets();

// functions

async function generateAssets(): Promise<void> {
  const signPatterns = await generateSignPatterns();
  const assets = `#include <opencv2/imgproc.hpp>

#include "assets.hpp"
#include "models/sign.hpp"

${signPatterns}
`;
  Deno.writeTextFile(outputFile, assets);
}

async function generateSignPatterns(): Promise<string> {
  console.log(`⚙ processing patterns`);
  const signPatterns = [
    {
      name: "fireExtinguisher1",
      filename: "img/patterns/fire-extinguisher-1.png",
    },
    {
      name: "fireExtinguisher2",
      filename: "img/patterns/fire-extinguisher-2.png",
    },
    {
      name: "firstAid",
      filename: "img/patterns/first-aid.png",
    },
  ];
  const promises: Promise<string>[] = signPatterns
    .map(({ name, filename }) => generateSingleSignPattern(name, filename));

  const signPatternArrayString = "" + 
`const std::vector<const SignPattern> signPatterns = {
  ${signPatterns.map(({ name }) => name).join(",\n  ")}
};`;

  const results: string[] = await Promise.all(promises);
  results.push(signPatternArrayString);
  const result = results.join("\n\n");

  console.log(`✓ processed patterns`);
  return result;
}

async function generateSingleSignPattern(
  name: string,
  filename: string,
): Promise<string> {
  console.log(`  ⚙ loading    "${name}"`);
  const file = await Deno.readFile(filename);
  let { image, colorType, width, height } = decode(file);
  if (colorType === 2) {
    image = rgbToRgba(image);
  }

  console.log(`  ⚙ generating "${name}"`);
  const indexValuesBeforeLineBreak = width * signPatternsValuesPerPixel;
  const arr: string[] = [];
  for (let i = 0; i < image.byteLength; i+=4) {
    const v = image[i];
    arr.push(`${v}`.padStart(3, " "));
    if ((i + signPatternsValuesPerPixel) % indexValuesBeforeLineBreak == 0) {
      arr.push(",\n  ");
    } else {
      arr.push(", ");
    }
  }

  arr.pop();
  const signPattern = `uint8_t ${name}_canny_array[] = {
  ${arr.join("")}
};
cv::Mat ${name}_canny = cv::Mat(${height}, ${width}, CV_8UC1, reinterpret_cast<void*>(${name}_canny_array));
const SignPattern ${name} = SignPattern(${name}_canny, "${name}");`;

  console.log(`  ✓ generated  "${name}"`);
  return signPattern;
}

function rgbToRgba(rgb: Uint8Array): Uint8ClampedArray {
  const pixelCount = rgb.length / 3;
  const rgba = new Uint8ClampedArray(pixelCount * 4);
  for (let i = 0; i < pixelCount; i++) {
    rgba[i * 4 + 0] = rgba[i * 3 + 0];
    rgba[i * 4 + 1] = rgba[i * 3 + 1];
    rgba[i * 4 + 2] = rgba[i * 3 + 2];
    rgba[i * 4 + 3] = 255;
  }
  return rgba;
}
