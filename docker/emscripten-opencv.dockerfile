FROM emscripten/emsdk:3.1.34

# Install requirements
RUN apt update && apt install -y \
    # OpenCV dependencies
    build-essential cmake git libgtk2.0-dev pkg-config libavcodec-dev libavformat-dev libswscale-dev \
    python3-dev python3-numpy libtbb2 libtbb-dev libjpeg-dev libpng-dev libtiff-dev libdc1394-dev \
    libcanberra-gtk-module libcanberra-gtk3-module

# Clone, build and install OpenCV
RUN git clone -b 4.7.0 --depth 1 https://github.com/opencv/opencv.git /opencv && \
    cd /opencv && mkdir build && cd build && \
    cmake -D CMAKE_BUILD_TYPE=Release -D CMAKE_INSTALL_PREFIX=/usr/local .. && \
    make -j"$(nproc)" && \
    make install
RUN rm -rf /opencv

WORKDIR /data

LABEL org.opencontainers.image.source https://github.com/arstulke/sign-detection
LABEL org.opencontainers.image.description Helper Image with emscripten and opencv for building the wasm module
