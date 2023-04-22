import {
	ISignDetector,
	loadWasmFile,
	MainThreadedSignDetector,
} from "sign-detection-lib";

export function createMainThreadedSignDetector(): ISignDetector {
	return new MainThreadedSignDetector((filename: string) => {
		return loadWasmFile("assets/" + filename);
	});
}
