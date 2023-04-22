import { exposeSingleFunction } from "./deps.ts";
import {
  InternalSignDetector,
  WasmFileLoader,
} from "./internal-sign-detector.ts";
import { ProcessFrameTaskInput, ProcessFrameTaskOutput } from "./types.ts";

export async function runWorker(wasmFileLoader?: WasmFileLoader) {
  const imageProcessor = new InternalSignDetector(wasmFileLoader);
  await imageProcessor.loaded;

  exposeSingleFunction<ProcessFrameTaskInput, ProcessFrameTaskOutput>(
    (input: ProcessFrameTaskInput) => imageProcessor.processFrame(input),
    "processFrame",
  );
}
