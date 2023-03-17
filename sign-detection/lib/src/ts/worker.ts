import { exposeSingleFunction } from "./deps.ts";
import { ProcessFrameInput, ProcessFrameOutput } from "./types.ts";

export async function runWorker() {
  // TODO prepare wasm module
  // TODO error handling in exposeSingleFunction
  exposeSingleFunction<ProcessFrameInput, ProcessFrameOutput>(processFrame, "processFrame");
}

async function processFrame({ inputFrame, start }: ProcessFrameInput) {
  // simulating processing delay
  await sleep(150);

  const data = new Uint8ClampedArray(inputFrame.buffer);
  // TODO transfer the uint8 array to webassembly
  // TODO receiver the uint8 array from webassembly
  return {
    outputFrame: inputFrame,
    start,
    end: new Date().toISOString(),
  };
}

// busyWaiting is not working. idk why not
function busyWaiting(waitTimeMs: number) {
  const start = Date.now();
  const end = start + Math.max(0, waitTimeMs);
  let current = null;
  while (current == null || current < end) {
    current = Date.now();
  }
  console.log(start, end, Date.now());
}

function sleep(waitTimeMs: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), waitTimeMs);
  });
}
