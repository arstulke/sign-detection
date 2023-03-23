import { useEffect, useState } from "react";
import { SignDetector, ProcessedFrameListener } from "sign-detection-lib";
import SignDetectorWorker from "../worker?worker";

export function useSignDetector() {
	const [signDetector, setSignDetector] = useState<SignDetector>();
	useEffect(() => {
		async function createSignDetector() {
			// min=1
			// opt=3 (works fine)
			// max=9 (on most devices)
			// formula: time_to_process/interval = time_to_process * frame_rate / 1000
			const threadCount = 3;
			const signDetector = new SignDetector(threadCount, SignDetectorWorker);
			await signDetector.start();
			return signDetector;
		}

		if (!signDetector) {
			createSignDetector().then((result) => setSignDetector(result));
		} else {
			return function cleanup() {
				signDetector.stop();
				setSignDetector(undefined);
			};
		}
	}, [signDetector]);

	return signDetector;
}
