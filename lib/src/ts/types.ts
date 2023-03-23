export interface Frame {
  arr: Uint8ClampedArray;
  width: number;
  height: number;
}

export interface ProcessFrameTaskInput {
  inputFrame: Frame;
  start: string;
}

export interface ProcessFrameTaskOutput {
  outputFrame: Frame;
  start: string;
  preComputation: string;
  postComputation: string;
  memorySize: number;
}

export interface ProcessFrameResult extends ProcessFrameTaskOutput {
  end: string;
  memorySizeUnit: string;
}
