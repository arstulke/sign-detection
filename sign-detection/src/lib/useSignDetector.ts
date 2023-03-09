import { useEffect, useState } from "react";
import { ProcessedFrameListener, SignDetector } from "./sign-detector";

export function useSignDetector(listener: ProcessedFrameListener) {
	const [signDetector, setSignDetector] = useState<SignDetector>();
	useEffect(() => {
		async function createSignDetector() {
			const signDetector = new SignDetector();
			signDetector.setProcessedFrameListener(listener);
			await signDetector.start();
			return signDetector;
		}

		if (!signDetector) {
			createSignDetector().then((result) => setSignDetector(result));
		} else {
			return function cleanup() {
				signDetector.stop();
			};
		}
	}, [signDetector]);

	return signDetector;
}
