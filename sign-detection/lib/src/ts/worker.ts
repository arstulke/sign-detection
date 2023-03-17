// @deno-types="./wasm-build/main.d.ts"
import {
  __AdaptedExports,
  __Record4,
  instantiate as instantiateWasm,
} from "./wasm-build/main.js";

import { exposeSingleFunction } from "./deps.ts";
import { Frame, ProcessFrameInput, ProcessFrameOutput } from "./types.ts";

export async function runWorker() {
  const imageProcessor = new ImageProcessor();
  await imageProcessor.loaded;

  exposeSingleFunction<ProcessFrameInput, ProcessFrameOutput>(
    (input: ProcessFrameInput) => imageProcessor.processFrameObject(input),
    "processFrame",
  );
}

type ProcessFrameFn = (typeof __AdaptedExports)["processFrame"];
type WasmBitmap = __Record4<undefined>;

class ImageProcessor {
  loaded: Promise<void>;

  private processFrame: ProcessFrameFn;

  constructor() {
    this.loaded = (async () => {
      const wasmCode = await Deno.readFile(
        // TODO is this working with vite?
        new URL("./wasm-build/main.wasm", import.meta.url),
      );
      const wasmModule = new WebAssembly.Module(wasmCode);
      const wasmInstance = await instantiateWasm(wasmModule, {
        env: {
          abort: () => console.error("aborted"),
        },
      });

      this.processFrame = wasmInstance.processFrame as ProcessFrameFn;
    })();
  }

  async processFrameObject({
    inputFrame,
    start,
  }: ProcessFrameInput): ProcessFrameOutput {
    const inputImage = convertFrameToWasmBitmap(inputFrame);
    const response = this.processFrame(inputImage);

    return {
      outputFrame: convertWasmBitmapToFrame(response.output),
      start,
      end: new Date().toISOString(),
    };
  }
}

function convertFrameToWasmBitmap(
  { buffer, width, height }: Frame,
): WasmBitmap {
  return {
    arr: new Uint8Array(buffer),
    width,
    height,
  };
}

function convertWasmBitmapToFrame({ arr, width, height }: WasmBitmap): Frame {
  return {
    buffer: arr.buffer,
    width,
    height,
  };
}
