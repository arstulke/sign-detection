import { exposeSingleFunction } from "../ext/thread-pool";
import { ProcessFrameInput, ProcessFrameOutput } from "./types";

exposeSingleFunction<ProcessFrameInput, ProcessFrameOutput>(
	(input: ProcessFrameInput) => {
		// TODO simulate work
		// TODO implement image processing
		return { outputFrame: input.inputFrame };
	},
	"processFrame",
);
