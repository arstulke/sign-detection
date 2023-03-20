import instantiateWasm from "./wasm-build/main.js";

import { exposeSingleFunction } from "./deps.ts";
import { Frame, ProcessFrameInput, ProcessFrameOutput } from "./types.ts";

type WasmBinaryLoader = () => Promise<Uint8Array>;

export async function loadWasmBinary(
  urlOrString: URL | string,
): ReturnType<WasmBinaryLoader> {
  const response = await fetch(urlOrString);
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

const DefaultWasmBinaryLoader: WasmBinaryLoader = async () => {
  const url = new URL("./wasm-build/main.wasm", import.meta.url);
  try {
    return await loadWasmBinary(url);
  } catch {
    // dnt-shim-ignore
    return await Deno.readFile(url);
  }
};

export async function runWorker(wasmModuleLoader?: WasmBinaryLoader) {
  const imageProcessor = new ImageProcessor(wasmModuleLoader);
  await imageProcessor.loaded;

  exposeSingleFunction<ProcessFrameInput, ProcessFrameOutput>(
    (input: ProcessFrameInput) => imageProcessor.processFrameObject(input),
    "processFrame",
  );
}

class Bitmap4C {
  ptr: number;
  width: number;
  height: number;
}

interface Response {
  output: Bitmap4C;
}

interface CustomWasmInstance {
  _malloc: (byteLength: number) => number;
  HEAPU8: Uint8Array;

  Bitmap4C: typeof Bitmap4C;
  processFrame: ProcessFrameFn;
  freeMemory: FreeMemoryFn;
}

type ProcessFrameFn = (input: Bitmap4C) => Response;
type FreeMemoryFn = () => void;

class ImageProcessor {
  loaded: Promise<void>;

  private wasmInstance: CustomWasmInstance;

  constructor(wasmBinaryLoader: WasmBinaryLoader = DefaultWasmBinaryLoader) {
    this.loaded = (async () => {
      const wasmBinary = await wasmBinaryLoader();
      this.wasmInstance = await instantiateWasm({ wasmBinary });
    })();
  }

  async processFrameObject({
    inputFrame,
    start,
  }: ProcessFrameInput): ProcessFrameOutput {
    const preComputation = new Date().toISOString();

    const inputImage = this.convertFrameToBitmap4C(inputFrame);
    const response = this.wasmInstance.processFrame(inputImage);
    const outputFrame: Frame = this.convertBitmap4CToFrame(response.output);
    this.wasmInstance.freeMemory();

    const postComputation = new Date().toISOString();
    return {
      outputFrame,
      start,
      preComputation,
      postComputation,
    };
  }

  private convertFrameToBitmap4C(frame: Frame): Bitmap4C {
    const ptr = this.wasmInstance._malloc(frame.arr.length);
    this.wasmInstance.HEAPU8.set(frame.arr, ptr);

    const img = new this.wasmInstance.Bitmap4C();
    img.ptr = ptr;
    img.width = frame.width;
    img.height = frame.height;
    return img;
  }

  private convertBitmap4CToFrame({ ptr, width, height }: Bitmap4C): Frame {
    const byteLength = width * height * 4;
    const arr = new Uint8ClampedArray(
      this.wasmInstance.HEAPU8.buffer.slice(ptr, ptr + byteLength),
    );
    return { arr, width, height };
  }
}
