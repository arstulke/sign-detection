import "./worker-shim";

import { loadWasmBinary, runWorker } from "sign-detection-lib";

runWorker(() => {
	return loadWasmBinary("main.wasm");
});
