export interface Frame {
  arr: Uint8ClampedArray;
  width: number;
  height: number;
}

export interface ProcessFrameInput {
  inputFrame: Frame;
  start: string;
}

export interface ProcessFrameOutput {
  outputFrame: Frame;
  start: string;
  preComputation: string;
  postComputation: string;
}
