#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write --allow-net --allow-run

import { build } from "https://deno.land/x/dnt@0.33.1/mod.ts";

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
