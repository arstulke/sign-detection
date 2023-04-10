export type { Frame, ISignDetector } from "./types.ts";

export { MultiThreadedSignDetector } from "./multi-threaded-sign-detector.ts";
export { SingleThreadedSignDetector } from "./single-threaded-sign-detector.ts";

export type { WasmBinaryLoader } from "./internal-sign-detector.ts";
export { loadWasmBinary } from "./internal-sign-detector.ts";
export { runWorker } from "./worker.ts";
