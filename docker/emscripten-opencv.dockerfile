FROM emscripten/emsdk:3.1.34

ENV EMSCRIPTEN=/emsdk/upstream/emscripten/

COPY opencv-em /opencv-em
RUN git clone -b 4.7.0 --depth 1 https://github.com/opencv/opencv.git /opencv-em/opencv && \
    wget -qO /usr/local/bin/ninja.gz https://github.com/ninja-build/ninja/releases/latest/download/ninja-linux.zip && \
    gunzip /usr/local/bin/ninja.gz && \
    chmod a+x /usr/local/bin/ninja && \
    apt update && \
    apt install -y rsync && \
    cd /opencv-em && \
    ./build.sh cmake

WORKDIR /data

LABEL org.opencontainers.image.source https://github.com/arstulke/sign-detection
LABEL org.opencontainers.image.description Helper Image with Emscripten and OpenCV for building the WASM module
