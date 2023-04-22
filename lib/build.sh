#!/bin/sh

docker_tag=${1:-latest}

# generate c++ assets
./generate-assets.ts

# compile c++ to wasm
mkdir -p ./src/ts/wasm-build/
rm -rf ./src/ts/wasm-build/*
docker run \
    --rm \
    -v $(pwd):/data \
    -w /data \
    ghcr.io/arstulke/sign-detection/emscripten-opencv:$docker_tag \
        em++ \
        $(find src/cpp -type f -name "*.cpp") \
        /opencv-em/packaging/build_wasm/lib/libopencv_core.a \
        /opencv-em/packaging/build_wasm/lib/libopencv_imgproc.a \
        --bind \
        -I /opencv-em/packaging/build_wasm/opencv/include \
        -I /opencv-em/packaging/build_wasm/opencv/modules/core/include \
        -I /opencv-em/packaging/build_wasm/opencv/modules/imgproc/include \
        -I /opencv-em/packaging/build_wasm/ \
        -o src/ts/wasm-build/main.js \
        -sWASM=1 \
        -sLLD_REPORT_UNDEFINED \
        -sERROR_ON_UNDEFINED_SYMBOLS=0 \
        -sTOTAL_MEMORY=4MB \
        -sALLOW_MEMORY_GROWTH \
        -sEXPORTED_FUNCTIONS=[] \
        -sENVIRONMENT=web \
        -sEXPORT_ES6=1

local_user=$(id -u):$(id -g)
docker run \
    --rm \
    -v $(pwd):/data \
    -w /data \
    ghcr.io/arstulke/sign-detection/emscripten-opencv:$docker_tag \
        chown -R ${local_user} ./src/ts/wasm-build/

# package as npm
rm -rf ./npm/*
./package-as-npm.ts
mkdir -p ./npm/src/wasm-build/
cp ./src/ts/wasm-build/main.wasm ./npm/src/wasm-build/main.wasm
