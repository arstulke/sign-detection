import { Frame, ProcessFrameInput, ProcessFrameOutput } from "./types.ts";
import { WorkerConstructor, WorkerPool } from "./deps.ts";

export type ProcessedFrameListener = (processedFrame: Frame) => void;

export class SignDetector {
  private readonly pool: WorkerPool;

  constructor(
    private readonly threadCount: number = 1,
    signDetectorWorker: WorkerConstructor = SignDetectorWorker,
  ) {
    this.pool = new WorkerPool(signDetectorWorker);
  }

  async start() {
    await this.pool.started();
    await this.pool.scaleTo(this.threadCount);
  }

  async processFrame(
    frame: Frame,
  ): Promise<ProcessFrameOutput & { end: string }> {
    const { outputFrame, start, preComputation, postComputation } = await this
      .pool.run<
      ProcessFrameInput,
      ProcessFrameOutput
    >("processFrame", {
      inputFrame: frame,
      start: new Date().toISOString(),
    });
    return {
      outputFrame,
      start,
      preComputation,
      postComputation,
      end: new Date().toISOString(),
    };
  }

  async stop() {
    await this.pool.terminate(false); // false means force termination
  }
}

class SignDetectorWorker extends Worker {
  constructor() {
    super(new URL("./builtin-worker.ts", import.meta.url), { type: "module" });
  }
}
