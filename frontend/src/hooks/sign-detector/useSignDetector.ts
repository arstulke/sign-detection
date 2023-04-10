import { useEffect, useState } from "react";
import { ISignDetector } from "sign-detection-lib";
import { createMultiThreadedSignDetector } from "./multi-threaded";
import { createMainThreadedSignDetector } from "./main-threaded";

export function useSignDetector(useMultithreading?: boolean): Pick<ISignDetector, "processFrame"> | undefined {
	const [signDetector, setSignDetector] = useState<ISignDetector>();
	useEffect(() => {
		async function createSignDetector() {
			const signDetector = useMultithreading ? createMultiThreadedSignDetector() : createMainThreadedSignDetector();
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
	}, [signDetector, useMultithreading]);

	return signDetector;
}
