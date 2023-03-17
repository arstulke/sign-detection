#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write --allow-net --allow-run

import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: [
    "./src/ts/mod.ts",
  ],
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
