import { runWorker } from "sign-detection-lib";

runWorker(() => {
	return WebAssembly.compileStreaming(fetch("main.wasm"));
});
