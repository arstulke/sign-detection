import { useEffect, useState } from "react";
import { SignDetector, ProcessedFrameListener } from "sign-detection-lib";
import SignDetectorWorker from "../worker?worker";

export function useSignDetector() {
	const [signDetector, setSignDetector] = useState<SignDetector>();
	useEffect(() => {
		async function createSignDetector() {
			const signDetector = new SignDetector(
				9, // 9 is maximum on most devices. formula: time_to_process/interval = time_to_process * frame_rate / 1000
				SignDetectorWorker,
			);
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
