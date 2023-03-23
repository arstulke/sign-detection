import instantiateWasm from "./wasm-build/main.js";

import { exposeSingleFunction } from "./deps.ts";
import {
  Frame,
  ProcessFrameTaskInput,
  ProcessFrameTaskOutput,
} from "./types.ts";

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

  exposeSingleFunction<ProcessFrameTaskInput, ProcessFrameTaskOutput>(
    (input: ProcessFrameTaskInput) => imageProcessor.processFrameObject(input),
    "processFrame",
  );
}

declare class Bitmap4C {
  ptr: number;
  width: number;
  height: number;
  readonly byteLength: number;

  constructor(width: number, height: number);
}

interface Response {
  output: Bitmap4C;
}

interface CustomWasmInstance {
  HEAPU8: Uint8Array;

  Bitmap4C: typeof Bitmap4C;
  processFrame(input: Bitmap4C): Response;
  test(): void;
  freeMemory(): void;
}

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
  }: ProcessFrameTaskInput): ProcessFrameTaskOutput {
    const preComputation = new Date().toISOString();

    const inputBitmap4C = this.convertFrameToBitmap4C(inputFrame);
    const response = this.wasmInstance.processFrame(inputBitmap4C);
    const outputFrame: Frame = this.convertBitmap4CToFrame(response.output);
    this.wasmInstance.freeMemory();

    const memorySize = this.wasmInstance.HEAPU8.byteLength;

    const postComputation = new Date().toISOString();
    return {
      outputFrame,
      start,
      preComputation,
      postComputation,
      memorySize,
    };
  }

  private convertFrameToBitmap4C(frame: Frame): Bitmap4C {
    const bitmap4C = new this.wasmInstance.Bitmap4C(frame.width, frame.height);
    this.wasmInstance.HEAPU8.set(frame.arr, bitmap4C.ptr);
    return bitmap4C;
  }

  private convertBitmap4CToFrame({ ptr, width, height }: Bitmap4C): Frame {
    const byteLength = width * height * 4;
    const arr = new Uint8ClampedArray(
      this.wasmInstance.HEAPU8.buffer.slice(ptr, ptr + byteLength),
    );
    return { arr, width, height };
  }
}
