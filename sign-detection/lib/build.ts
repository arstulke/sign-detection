#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write --allow-net --allow-run

import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";
import asc from "npm:assemblyscript/asc";
import { stderr, stdout } from "https://deno.land/std@0.113.0/node/process.ts";

await emptyDir("./npm");
await emptyDir("./src/ts/wasm-build");

console.log("Compiling WASM...");
await asc.main([
  "src/asc/main.ts",
  "--bindings",
  "raw",
  "--outFile",
  "src/ts/wasm-build/main.wasm",
  "--textFile",
  "src/ts/wasm-build/main.wat",
], {
  stdout,
  stderr,
});
console.log("Compiling WASM... done");
console.log();

await build({
  entryPoints: ["./src/ts/mod.ts"],
  outDir: "./npm",
  typeCheck: false,
  test: false,
  shims: {
    // see JS docs for overview and more options
    deno: true,
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
