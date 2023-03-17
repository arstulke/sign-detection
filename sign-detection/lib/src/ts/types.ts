export interface Frame {
  buffer: ArrayBuffer;
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
  end: string;
}
