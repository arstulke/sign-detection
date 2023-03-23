import {
  Frame,
  ProcessFrameResult,
  ProcessFrameTaskInput,
  ProcessFrameTaskOutput,
} from "./types.ts";
import { WorkerConstructor, WorkerPool } from "./deps.ts";

export type ProcessedFrameListener = (processedFrame: Frame) => void;

export class SignDetector {
  private readonly pool: WorkerPool;
  private readonly memorySizeLastValues: number[];

  constructor(
    private readonly threadCount: number = 1,
    signDetectorWorker: WorkerConstructor = SignDetectorWorker,
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

    const { memorySize, memorySizeUnit } = this.addMemorySizeAndCalculateAvg(
      memorySizeBytes,
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

  private addMemorySizeAndCalculateAvg(
    memorySizeBytes: number,
  ): { memorySize: number; memorySizeUnit: string } {
    // TODO thread-pool: add IDs/index to WorkerThreads for identifying the total memory usage
    this.memorySizeLastValues.shift();
    this.memorySizeLastValues.push(memorySizeBytes);

    const avg = this.memorySizeLastValues.reduce((a, b) => a + b, 0) /
      this.memorySizeLastValues.length;
    const [scaled, memorySizeUnit] = [[0, ""], [10, "KiB"], [20, "MiB"], [
      30,
      "GiB",
    ]]
      .map(([exponent, unit]: [number, string]) => {
        return [avg / Math.pow(2, exponent), unit] as [number, string];
      })
      .find(([s], idx, arr) => s < 1024 || (idx === arr.length - 1));
    const rounded = Math.round(scaled);

    return { memorySize: rounded, memorySizeUnit };
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
