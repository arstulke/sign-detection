import {
  Frame,
  ISignDetector,
  ProcessFrameResult,
  ProcessFrameTaskInput,
  ProcessFrameTaskOutput,
} from "./types.ts";
import { WorkerConstructor, WorkerPool } from "./deps.ts";
import { formatWithStorageUnit } from "./format-utils.ts";

export class MultiThreadedSignDetector implements ISignDetector {
  private readonly pool: WorkerPool;
  private readonly memorySizeLastValues: number[];

  constructor(
    private readonly threadCount: number = 1,
    signDetectorWorker: WorkerConstructor = DefaultSignDetectorWorker,
  ) {
    this.pool = new WorkerPool(signDetectorWorker, {
      maxWaitingValues: 1,
      deleteWaitingValueAction: "first",
    });
    this.memorySizeLastValues = new Array<number>(threadCount).fill(0);
  }

  async start() {
    await this.pool.started();
    await this.pool.scaleTo(this.threadCount);
  }

  async processFrame(
    frame: Frame,
  ): Promise<ProcessFrameResult> {
    const {
      outputFrame,
      start,
      preComputation,
      postComputation,
      memorySize: memorySizeBytes,
    } = await this
      .pool.run<
      ProcessFrameTaskInput,
      ProcessFrameTaskOutput
    >("processFrame", {
      inputFrame: frame,
      start: new Date().toISOString(),
    });

    const { value: memorySize, unit: memorySizeUnit } = this
      .addMemorySizeAndCalculateAvg(memorySizeBytes);

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

  private addMemorySizeAndCalculateAvg(
    memorySizeBytes: number,
  ): { value: number; unit: string } {
    // TODO thread-pool: add IDs/index to WorkerThreads for identifying the total memory usage
    this.memorySizeLastValues.shift();
    this.memorySizeLastValues.push(memorySizeBytes);

    const avg = this.memorySizeLastValues.reduce((a, b) => a + b, 0) /
      this.memorySizeLastValues.length;
    return formatWithStorageUnit(avg);
  }

  async stop() {
    await this.pool.terminate(false); // false means force termination
  }
}

class DefaultSignDetectorWorker extends Worker {
  constructor() {
    super(new URL("./builtin-worker.ts", import.meta.url), { type: "module" });
  }
}
