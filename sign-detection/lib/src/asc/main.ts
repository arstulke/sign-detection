class RgbBitmap {
  arr: Uint8Array;
  width: i32;
  height: i32;
}

class Response {
  output: RgbBitmap;
}

const BYTES_PER_PIXEL = 4;

export function calculateBitmapByteLength(
  width: i32,
  height: i32,
): i32 {
  return width * height * BYTES_PER_PIXEL;
}

function createBitmap(width: i32, height: i32): RgbBitmap {
  const imageByteLength = calculateBitmapByteLength(width, height);
  const arr = new Uint8Array(imageByteLength);
  return { arr, width, height };
}

export function processFrame(input: RgbBitmap): Response {
  const output = createBitmap(input.width, input.height);
  for (let i = 0; i < output.arr.byteLength; i += BYTES_PER_PIXEL) {
    const r = i32(input.arr[i + 0]);
    const g = i32(input.arr[i + 1]);
    const b = i32(input.arr[i + 2]);
    const avg = (r + g + b) / 3;
    output.arr[i + 0] = avg;
    output.arr[i + 1] = avg;
    output.arr[i + 2] = avg;
    output.arr[i + 3] = 255;
  }
  return { output };
}
