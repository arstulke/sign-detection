#!/usr/bin/env -S deno run --allow-read --allow-write

import {
  Frame,
  ISignDetector,
  MainThreadedSignDetector,
  MultiThreadedSignDetector,
} from "./src/ts/mod.ts";
import { join } from "https://deno.land/std/path/mod.ts";
import { decode, DecodeResult, encode } from "https://deno.land/x/pngs/mod.ts";

const fileArgument = Deno.args[0];

const inputDir = "img/in";
const outputDir = "img/out";
const workerThreads = 10;
const isMultiThreaded = workerThreads >= 1 && !fileArgument;

const signDetector: ISignDetector = isMultiThreaded
  ? new MultiThreadedSignDetector()
  : new MainThreadedSignDetector();
await signDetector.start();
await processInputDir();
await signDetector.stop();

// functions

async function processInputDir(): Promise<void> {
  if (isMultiThreaded) {
    console.log();
  }
  console.log(`⚙ processing input directory "${inputDir}"`);
  const promises: Promise<void>[] = Array(Math.max(1, workerThreads))
    .map(() => Promise.resolve());

  for await (const dirEntry of Deno.readDir(inputDir)) {
    await promises.shift(); // remove first promise and await it
    const promise = processDirEntry(dirEntry); // create promise
    promises.push(promise); // queue new promise
  }

  await Promise.all(promises);
  console.log(`✓ processed input directory "${inputDir}"`);
}

async function processDirEntry(dirEntry: Deno.DirEntry): Promise<void> {
  const { name: filename } = dirEntry;
  const inputPath = join(inputDir, filename);
  const outputPath = join(outputDir, filename);

  if (fileArgument && fileArgument !== filename) {
    return;
  }

  try {
    console.log(`  ⚙ loading           "${inputPath}"`);
    const inputFile = await Deno.readFile(inputPath);
    const inputImage = decode(inputFile);
    const inputFrame: Frame = convertToFrame(inputImage);

    console.log(`  ⚙ processing        "${inputPath}"`);
    const { outputFrame } = await signDetector.processFrame(inputFrame);

    console.log(`  ⚙ writing           "${inputPath}" as "${outputPath}"`);
    const outputFile = encode(
      outputFrame.arr,
      outputFrame.width,
      outputFrame.height,
    );
    await Deno.writeFile(outputPath, outputFile);
    console.log(`  ✓ exported          "${inputPath}" as "${outputPath}"`);
  } catch (err) {
    console.log(`  x failed to process "${inputPath}"`);
  }
}

function convertToFrame(inputImage: DecodeResult): Frame {
  if (inputImage.colorType === 2) {
    return {
      arr: rgbToRgba(inputImage.image),
      width: inputImage.width,
      height: inputImage.height,
    };
  }

  if (inputImage.colorType === 6) {
    return {
      arr: inputImage.image,
      width: inputImage.width,
      height: inputImage.height,
    };
  }

  throw new Error(`Image has unimplemented colorType=${inputImage.colorType}`);
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
