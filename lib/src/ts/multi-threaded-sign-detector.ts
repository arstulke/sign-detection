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
  private readonly memorySizeMap: Map<string, number> = new Map<
    string,
    number
  >();

  constructor(
    private readonly threadCount: number = 1,
    signDetectorWorker: WorkerConstructor = DefaultSignDetectorWorker,
  ) {
    this.pool = new WorkerPool(signDetectorWorker, {
      maxWaitingValues: 1,
      deleteWaitingValueAction: "first",
    });
  }

  async start() {
    await this.pool.started();
    await this.pool.scaleTo(this.threadCount);
    this.memorySizeMap.clear();
  }

  async processFrame(
    frame: Frame,
  ): Promise<ProcessFrameResult> {
    const {
      outputFrame,
      start,
      preComputation,
      postComputation,
      memorySize: singleMemorySize,
    } = await this
      .pool.run<
      ProcessFrameTaskInput,
      ProcessFrameTaskOutput
    >("processFrame", {
      inputFrame: frame,
      start: new Date().toISOString(),
    });

    this.memorySizeMap.set("ID0", singleMemorySize); // TODO use ID of the thread (handle stopped/replaced threads?)
    const memorySizeSum = [...this.memorySizeMap.values()].reduce(
      (a, b) => a + b,
      0,
    );
    const { value: memorySize, unit: memorySizeUnit } = formatWithStorageUnit(
      memorySizeSum,
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
    await this.pool.terminate(false); // false means force termination
  }
}

class DefaultSignDetectorWorker extends Worker {
  constructor() {
    super(new URL("./builtin-worker.ts", import.meta.url), { type: "module" });
  }
}
