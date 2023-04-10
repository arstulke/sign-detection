import { ISignDetector, MainThreadedSignDetector, loadWasmBinary } from "sign-detection-lib";

export function createMainThreadedSignDetector(): ISignDetector {
	return new MainThreadedSignDetector(() => {
		return loadWasmBinary("assets/main.wasm");
	});
}
