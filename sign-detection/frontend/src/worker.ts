import "./worker-shim";
import { runWorker, loadWasmBinary } from "sign-detection-lib";

runWorker(() => {
	return loadWasmBinary("main.wasm");
});
