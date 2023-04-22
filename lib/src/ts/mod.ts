export type { Frame, ISignDetector } from "./types.ts";

export { MultiThreadedSignDetector } from "./multi-threaded-sign-detector.ts";
export { MainThreadedSignDetector } from "./main-threaded-sign-detector.ts";

export type { WasmFileLoader } from "./internal-sign-detector.ts";
export { loadWasmFile } from "./internal-sign-detector.ts";
export { runWorker } from "./worker.ts";
