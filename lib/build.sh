#!/bin/sh

# compile c++ to wasm
mkdir -p ./src/ts/wasm-build/
rm -rf ./src/ts/wasm-build/*
docker build -t wasm-builder -f wasm-builder.dockerfile .
docker run \
    --rm \
    -v $(pwd):/data \
    -w /data \
    wasm-builder \
        em++ \
        src/cpp/main.cpp \
        --bind \
        -o src/ts/wasm-build/main.js \
        -sWASM=1 \
        -sALLOW_MEMORY_GROWTH \
        -sEXPORTED_FUNCTIONS=[] \
        -sENVIRONMENT=web \
        -sEXPORT_ES6=1

# package as npm
rm -rf ./npm/*
./package-as-npm.ts
mkdir -p ./npm/src/wasm-build/
cp ./src/ts/wasm-build/main.wasm ./npm/src/wasm-build/main.wasm
