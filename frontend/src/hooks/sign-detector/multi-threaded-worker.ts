import { loadWasmFile, runWorker } from "sign-detection-lib";

runWorker((filename: string) => {
	return loadWasmFile(filename);
});
