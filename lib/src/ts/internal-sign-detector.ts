import "./worker-shim.ts";
import instantiateWasm from "./wasm-build/main.js";

import {
  Frame,
  ProcessFrameTaskInput,
  ProcessFrameTaskOutput,
} from "./types.ts";

export type WasmFileLoader = (filename: string) => Promise<Uint8Array>;

export async function loadWasmFile(
  urlOrString: URL | string,
): ReturnType<WasmFileLoader> {
  const response = await fetch(urlOrString);
  if (!response.ok) {
    throw new Error(`Could not fetch file from "${urlOrString}"`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

const DefaultWasmFileLoader: WasmFileLoader = async (filename: string) => {
  const url = new URL("./wasm-build/" + filename, import.meta.url);
  try {
    return await loadWasmFile(url);
  } catch {
    // dnt-shim-ignore
    return await Deno.readFile(url);
  }
};

declare class Bitmap4C {
  ptr: number;
  width: number;
  height: number;
  readonly byteLength: number;

  constructor(width: number, height: number);
}

declare class Request {
  input: Bitmap4C;
  release(): void;

  constructor(width: number, height: number);
}

declare class Response {
  output: Bitmap4C;

  private constructor();
  release(): void;
}

interface CustomWasmInstance {
  HEAPU8: Uint8Array;

  Bitmap4C: typeof Bitmap4C;
  Request: typeof Request;
  Response: typeof Response;
  processFrame(input: Request): Response;
  test(): void;
  freeMemory(): void;
}

export class InternalSignDetector {
  loaded: Promise<void>;

  private wasmInstance: CustomWasmInstance;

  constructor(wasmFileLoader: WasmFileLoader = DefaultWasmFileLoader) {
    this.loaded = (async () => {
      const wasmBinary = await wasmFileLoader("main.wasm");
      this.wasmInstance = await instantiateWasm({ wasmBinary });
    })();
  }

  async processFrame({
    inputFrame,
    start,
  }: ProcessFrameTaskInput): Promise<ProcessFrameTaskOutput> {
    await this.loaded;

    const preComputation = new Date().toISOString();

    const request: Request = this.convertFrameToRequest(inputFrame);
    const response: Response = this.wasmInstance.processFrame(request);
    const outputFrame: Frame = this.convertResponseToFrame(response);

    request.release();
    response.release();

    const memorySize = this.wasmInstance.HEAPU8.byteLength;
    const postComputation = new Date().toISOString();
    return {
      outputFrame,
      start,
      preComputation,
      postComputation,
      memorySize,
    };
  }

  private convertFrameToRequest({ width, height, arr }: Frame): Request {
    const request = new this.wasmInstance.Request(width, height);
    this.wasmInstance.HEAPU8.set(arr, request.input.ptr);
    return request;
  }

  private convertResponseToFrame(response: Response): Frame {
    return this.convertBitmap4CToFrame(response.output);
  }

  private convertBitmap4CToFrame(
    { ptr, width, height, byteLength }: Bitmap4C,
  ): Frame {
    const arr = new Uint8ClampedArray(
      this.wasmInstance.HEAPU8.buffer.slice(ptr, ptr + byteLength),
    );
    return { arr, width, height };
  }
}
