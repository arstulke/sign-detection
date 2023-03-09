export type Frame = string;

export type ProcessedFrameListener = (processedFrame: Frame) => void;

export class SignDetector {
	private listener: ProcessedFrameListener = () => null;

	constructor() {}

	setProcessedFrameListener(listener: ProcessedFrameListener) {
		this.listener = listener;
	}

	async start() {
		// TODO implement
	}

	async processFrame(frame: Frame) {
		// TODO implement real processing

		// simulates processing of the frames
		await new Promise<void>((resolve) => {
			setTimeout(() => resolve(), 500);
		});

		this.listener(frame);
	}

	async stop() {
		// TODO implement
	}
}
