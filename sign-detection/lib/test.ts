#!/usr/bin/env -S deno run --allow-read

import { Frame, SignDetector } from "./src/ts/mod.ts";

function logFrame(name: string, { buffer, width, height }: Frame): void {
  // maybe write image to file
  console.log("frame=" + name, { arr: new Uint8Array(buffer), width, height });
}

function createInputFrame() {
  const bytesPerPixel = 4;
  const width = 3;
  const height = 3;
  const data = new Uint8Array(width * height * bytesPerPixel);
  for (let i = 0; i < data.byteLength; i += bytesPerPixel) {
    const avg = (i + 1) * 5;
    data[i + 0] = avg - 2;
    data[i + 1] = avg;
    data[i + 2] = avg + 2;
  }
  const input = {
    buffer: data.buffer,
    width,
    height,
  };
  return input;
}

const signDetector = new SignDetector();
await signDetector.start();

const input = createInputFrame();
logFrame("input", input);
const output = await signDetector.processFrame(input);
logFrame("output", output);

await signDetector.stop();
