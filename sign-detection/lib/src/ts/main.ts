import { Frame, ProcessFrameInput, ProcessFrameOutput } from "./types.ts";
import { WorkerConstructor, WorkerPool } from "./deps.ts";

export type ProcessedFrameListener = (processedFrame: Frame) => void;

export class SignDetector {
  private listener: ProcessedFrameListener = () => null;
  private readonly pool: WorkerPool;

  constructor(
    private readonly threadCount: number,
    signDetectorWorker: WorkerConstructor = SignDetectorWorker,
  ) {
    this.pool = new WorkerPool(signDetectorWorker);
  }

  setProcessedFrameListener(listener: ProcessedFrameListener) {
    this.listener = listener;
  }

  async start() {
    await this.pool.started();
    await this.pool.scaleTo(this.threadCount);
  }

  async processFrame(frame: Frame) {
    const { outputFrame } = await this.pool.run<
      ProcessFrameInput,
      ProcessFrameOutput
    >("processFrame", {
      inputFrame: frame,
      start: new Date().toISOString(),
    });
    this.listener(outputFrame);
  }

  async stop() {
    await this.pool.terminate(false); // false means force termination
  }
}

class SignDetectorWorker extends Worker {
  constructor() {
    super(new URL("./worker.ts", import.meta.url), { type: "module" });
  }
}
