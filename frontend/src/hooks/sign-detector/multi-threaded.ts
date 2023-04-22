import { ISignDetector, MultiThreadedSignDetector } from "sign-detection-lib";
import SignDetectorWorker from "./multi-threaded-worker?worker";

export function createMultiThreadedSignDetector(): ISignDetector {
	// min=1
	// opt=3 (works fine)
	// max=9 (on most devices)
	// formula: time_to_process/interval = time_to_process * frame_rate / 1000
	const threadCount = 3;
	return new MultiThreadedSignDetector(threadCount, SignDetectorWorker);
}
