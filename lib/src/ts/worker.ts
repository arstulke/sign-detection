import { exposeSingleFunction } from "./deps.ts";
import {
  InternalSignDetector,
  WasmBinaryLoader,
} from "./internal-sign-detector.ts";
import { ProcessFrameTaskInput, ProcessFrameTaskOutput } from "./types.ts";

export async function runWorker(wasmModuleLoader?: WasmBinaryLoader) {
  const imageProcessor = new InternalSignDetector(wasmModuleLoader);
  await imageProcessor.loaded;

  exposeSingleFunction<ProcessFrameTaskInput, ProcessFrameTaskOutput>(
    (input: ProcessFrameTaskInput) => imageProcessor.processFrame(input),
    "processFrame",
  );
}
