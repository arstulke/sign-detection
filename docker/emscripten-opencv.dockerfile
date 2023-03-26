FROM emscripten/emsdk:3.1.34

RUN git clone --depth 1 https://github.com/webarkit/opencv-em.git /opencv-em
RUN cd /opencv-em && \
    git submodule update --init
RUN wget -qO /usr/local/bin/ninja.gz https://github.com/ninja-build/ninja/releases/latest/download/ninja-linux.zip && \
    gunzip /usr/local/bin/ninja.gz && \
    chmod a+x /usr/local/bin/ninja
ENV EMSCRIPTEN=/emsdk/upstream/emscripten/
RUN apt update && apt install -y rsync
RUN cd /opencv-em && ./build.sh cmake

WORKDIR /data

LABEL org.opencontainers.image.source https://github.com/arstulke/sign-detection
LABEL org.opencontainers.image.description Helper Image with emscripten and opencv for building the wasm module
