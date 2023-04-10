import { ISignDetector, SingleThreadedSignDetector, loadWasmBinary } from "sign-detection-lib";

export function createMainThreadedSignDetector(): ISignDetector {
	return new SingleThreadedSignDetector(() => {
		return loadWasmBinary("assets/main.wasm");
	});
}
