import {
	ForwardedRef,
	forwardRef,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import Webcam from "react-webcam";
import { Frame } from "sign-detection-lib";

interface VideoDimensions {
	videoWidth: number;
	videoHeight: number;
	videoAspectRatio: number;
}

interface WebcamWrapperProps {
	onVideoDimensions: (videoDimensions: VideoDimensions) => void;
}

export interface WebcamWrapperHandle {
	grabFrame(): Frame | null;
}

const WebcamWrapper = forwardRef(
	(
		{ onVideoDimensions }: WebcamWrapperProps,
		ref: ForwardedRef<WebcamWrapperHandle>,
	) => {
		const webcamRef = useRef<Webcam>(null);

		const webcamVideo = webcamRef.current?.video;
		const [videoWidth, setVideoWidth] = useState(0);
		const [videoHeight, setVideoHeight] = useState(0);
		if (webcamVideo) {
			webcamVideo.onplay = () => {
				const { videoWidth, videoHeight } = webcamVideo;
				const videoAspectRatio = videoWidth / videoHeight;

				setVideoWidth(webcamVideo.videoWidth);
				setVideoHeight(webcamVideo.videoHeight);

				onVideoDimensions({ videoWidth, videoHeight, videoAspectRatio });
			};
		}

		const canvasContext = useMemo(() => {
			const video = webcamRef.current?.video;
			if (!video) return;
			if (videoWidth <= 0) return;
			if (videoHeight <= 0) return;

			const canvas = document.createElement("canvas");
			canvas.width = videoWidth;
			canvas.height = videoHeight;
			return canvas.getContext("2d", { willReadFrequently: true });
		}, [webcamRef.current, videoWidth, videoHeight]);

		useImperativeHandle(
			ref,
			() => {
				const defaultHandle = {
					grabFrame() {
						return null;
					},
				};
				const video = webcamRef.current?.video;
				if (!video) return defaultHandle;
				if (!canvasContext) return defaultHandle;

				return {
					grabFrame() {
						canvasContext.drawImage(video, 0, 0);
						const imageData = canvasContext.getImageData(
							0,
							0,
							videoWidth,
							videoHeight,
						);
						return {
							buffer: imageData.data.buffer,
							width: videoWidth,
							height: videoHeight,
						};
					},
				};
			},
			[webcamRef.current, canvasContext],
		);

		return (
			<Webcam
				ref={webcamRef}
				audio={false}
				screenshotFormat="image/jpeg"
				videoConstraints={{
					facingMode: "environment",
				}}
				minScreenshotWidth={videoWidth}
				minScreenshotHeight={videoHeight}
			/>
		);
	},
);

export default WebcamWrapper;
