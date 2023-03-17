import { WorkerPool } from "../ext/thread-pool";
import SignDetectorWorker from "./sign-detector-worker?worker";
import { Frame, ProcessFrameInput, ProcessFrameOutput } from "./types";

export type ProcessedFrameListener = (processedFrame: Frame) => void;

export class SignDetector {
	private listener: ProcessedFrameListener = () => null;
	private readonly pool: WorkerPool;

	constructor() {
		this.pool = new WorkerPool(SignDetectorWorker);
	}

	setProcessedFrameListener(listener: ProcessedFrameListener) {
		this.listener = listener;
	}

	async start() {
		await this.pool.started();
		await this.pool.scaleTo(9); // TODO scale to time_to_process/interval = time_to_process * frame_rate / 1000
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
