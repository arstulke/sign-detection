import { useRef, useState } from "react";
import Webcam from "react-webcam";
import { useInterval } from "../hooks/useInterval";
import { Frame } from "sign-detection-lib";
import { useSignDetector } from "../lib/useSignDetector";
import AspectRatioContainer from "./AspectRatioContainer";

interface SignDetectionProps {
	fps?: number;
	showWebcam?: boolean;
}

export default function SignDetection({ fps, showWebcam }: SignDetectionProps) {
	if (!fps || fps <= 0) {
		fps = 10;
	}
	const intervalBetweenFrames = Math.round(1000 / fps);

	const webcamRef = useRef<Webcam>(null);
	const outputCanvasRef = useRef<HTMLCanvasElement>(null);

	const signDetector = useSignDetector((frame: Frame) => {
		const ctx = outputCanvasRef.current?.getContext("2d"); // TODO cache context?
		if (!ctx) return;

		const uint8Array = new Uint8ClampedArray(frame.buffer);
		const imageData = new ImageData(uint8Array, frame.width, frame.height);
		ctx.putImageData(imageData, 0, 0);
	});

	const webcamVideo = webcamRef.current?.video;
	const [videoWidth, setVideoWidth] = useState(0);
	const [videoHeight, setVideoHeight] = useState(0);
	if (webcamVideo) {
		webcamVideo.onplay = () => {
			setVideoWidth(webcamVideo.videoWidth);
			setVideoHeight(webcamVideo.videoHeight);
		};
	}

	useInterval(
		async () => {
			if (!signDetector) return;
			if (!webcamRef.current) return;

			const canvas = webcamRef.current?.getCanvas();
			if (!canvas) return;

			const ctx = canvas.getContext("2d"); // TODO cache this value
			if (!ctx) return;

			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			signDetector.processFrame({
				buffer: imageData.data.buffer,
				width: canvas.width,
				height: canvas.height,
			});
		},
		intervalBetweenFrames,
		[signDetector, webcamRef.current],
	);

	const webcamAspectRatio =
		videoWidth && videoHeight ? videoWidth / videoHeight : 1;
	const webcam = (
		<div className={showWebcam ? "" : "absolute invisible"}>
			<div className="absolute m-3 px-1 py-0.5 text-xl text-white bg-black">
				Webcam
			</div>
			<div
				className="max-w-full max-h-full"
				style={{ aspectRatio: webcamAspectRatio }}
			>
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
			</div>
		</div>
	);

	const output = (
		<div>
			<div className="absolute m-3 px-1 py-0.5 text-xl text-white bg-black">
				Output
			</div>
			<canvas
				className="max-w-full max-h-full"
				ref={outputCanvasRef}
				width={videoWidth}
				height={videoHeight}
			/>
		</div>
	);

	return (
		<AspectRatioContainer
			elementAspectRatio={webcamAspectRatio}
			one={webcam}
			two={output}
		/>
	);
}
