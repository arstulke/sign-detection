// @deno-types="./wasm-build/main.d.ts"
import {
  __AdaptedExports,
  __Record4,
  instantiate as instantiateWasm,
} from "./wasm-build/main.js";

import { exposeSingleFunction } from "./deps.ts";
import { Frame, ProcessFrameInput, ProcessFrameOutput } from "./types.ts";

type WasmModuleLoader = () => Promise<WebAssembly.Module>;

export const WorkerWasmModuleLoader: WasmModuleLoader = async () => {
  const url = new URL("./wasm-build/main.wasm", import.meta.url);
  try {
    return await WebAssembly.compileStreaming(fetch(url));
  } catch {
    // dnt-shim-ignore
    const wasmCode = await Deno.readFile(url);
    return WebAssembly.compile(wasmCode);
  }
};

export async function runWorker(wasmModuleLoader?: WasmModuleLoader) {
  const imageProcessor = new ImageProcessor(wasmModuleLoader);
  await imageProcessor.loaded;

  exposeSingleFunction<ProcessFrameInput, ProcessFrameOutput>(
    (input: ProcessFrameInput) => imageProcessor.processFrameObject(input),
    "processFrame",
  );
}

type ProcessFrameFn = (typeof __AdaptedExports)["processFrame"];
type WasmBitmap = __Record4<never>;

class ImageProcessor {
  loaded: Promise<void>;

  private processFrame: ProcessFrameFn;

  constructor(wasmModuleLoader: WasmModuleLoader = WorkerWasmModuleLoader) {
    this.loaded = (async () => {
      const wasmModule = await wasmModuleLoader();
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
