import { Frame, ISignDetector, ProcessFrameResult } from "./types.ts";
import {
  InternalSignDetector,
  WasmFileLoader,
} from "./internal-sign-detector.ts";
import { formatWithStorageUnit } from "./format-utils.ts";

export class MainThreadedSignDetector implements ISignDetector {
  private readonly internalSignDetector: InternalSignDetector;

  constructor(
    wasmFileLoader?: WasmFileLoader,
  ) {
    this.internalSignDetector = new InternalSignDetector(wasmFileLoader);
  }

  async start() {
    await this.internalSignDetector.loaded;
  }

  async processFrame(
    frame: Frame,
  ): Promise<ProcessFrameResult> {
    const {
      outputFrame,
      start,
      preComputation,
      postComputation,
      memorySize: memorySizeInBytes,
    } = await this.internalSignDetector.processFrame({
      inputFrame: frame,
      start: new Date().toISOString(),
    });

    const { value: memorySize, unit: memorySizeUnit } = formatWithStorageUnit(
      memorySizeInBytes,
    );

    return {
      outputFrame,
      start,
      preComputation,
      postComputation,
      end: new Date().toISOString(),
      memorySize,
      memorySizeUnit,
    };
  }

  async stop() {
  }
}
