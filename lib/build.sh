#!/bin/sh

docker_tag=${1:-latest}

# compile c++ to wasm
mkdir -p ./src/ts/wasm-build/
rm -rf ./src/ts/wasm-build/*
docker run \
    --rm \
    -v $(pwd):/data \
    -w /data \
    ghcr.io/arstulke/sign-detection/emscripten-opencv:$docker_tag \
        em++ \
        src/cpp/main.cpp \
        /opencv-em/packaging/build_wasm/lib/libopencv_core.a \
        /opencv-em/packaging/build_wasm/lib/libopencv_imgproc.a \
        --bind \
        -I /opencv-em/packaging/build_wasm/opencv/include \
        -I /opencv-em/packaging/build_wasm/opencv/modules/core/include \
        -I /opencv-em/packaging/build_wasm/opencv/modules/imgproc/include \
        -I /opencv-em/packaging/build_wasm/ \
        -o src/ts/wasm-build/main.js \
        -sWASM=1 \
        -s LLD_REPORT_UNDEFINED \
        -s ERROR_ON_UNDEFINED_SYMBOLS=0 \
        -sALLOW_MEMORY_GROWTH \
        -sEXPORTED_FUNCTIONS=[] \
        -sENVIRONMENT=web \
        -sEXPORT_ES6=1

# package as npm
rm -rf ./npm/*
./package-as-npm.ts
mkdir -p ./npm/src/wasm-build/
cp ./src/ts/wasm-build/main.wasm ./npm/src/wasm-build/main.wasm
