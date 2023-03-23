#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write --allow-net --allow-run

import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

await emptyDir("./npm");
await emptyDir("./src/ts/wasm-build");

console.log("Compiling WASM...");
await Deno.mkdir("./src/ts/wasm-build/", { recursive: true });
const emscriptenVersion = "3.1.34";
console.log(Deno.cwd());
const dockerPrefixCommand = [
  "docker",
  "run",
  "--rm",
  "-v",
  `${Deno.cwd()}:/data`,
  "-w",
  "/data",
  `emscripten/emsdk:${emscriptenVersion ?? "latest"}`,
];
const emscriptenCommand = [
  "em++",
  "--bind",
  "src/cpp/main.cpp",
  "-o",
  "src/ts/wasm-build/main.js",
  "-sWASM=1",
  "-sALLOW_MEMORY_GROWTH",
  "-sEXPORTED_FUNCTIONS=[]",
  "-sENVIRONMENT=web",
  "-sEXPORT_ES6=1",
];
await Deno.run({
  cmd: [
    ...dockerPrefixCommand,
    ...emscriptenCommand,
  ],
}).status();
console.log("Compiling WASM... done");
console.log();

await build({
  entryPoints: ["./src/ts/mod.ts"],
  outDir: "./npm",
  typeCheck: false,
  test: false,
  shims: {
    // see JS docs for overview and more options
    deno: false,
  },
  compilerOptions: {
    lib: ["es2021", "dom"],
  },
  package: {
    // package.json properties
    name: "sign-detection-lib",
    private: true,
    version: "0.0.0",
    type: "module",
  },
});

await Deno.mkdir("./npm/src/wasm-build/", { recursive: true });
await Deno.copyFile(
  "./src/ts/wasm-build/main.wasm",
  "./npm/src/wasm-build/main.wasm",
);
