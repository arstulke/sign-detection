import { useRef, useState } from "react";
import Webcam from "react-webcam";
import { useInterval } from "./hooks/useInterval";
import { Frame } from "./lib/sign-detector";
import { useSignDetector } from "./lib/useSignDetector";

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
	const [videoWidth, setVideoWidth] = useState(0);
	const [videoHeight, setVideoHeight] = useState(0);

	const signDetector = useSignDetector((frame: Frame) => {
		const image = new Image();
		image.onload = () => {
			const ctx = outputCanvasRef.current?.getContext("2d");
			if (!ctx) return;

			ctx.drawImage(image, 0, 0);
		};
		image.src = frame;
	});

	const webcamVideo = webcamRef.current?.video;
	if (webcamVideo) {
		webcamVideo.onplay = () => {
			setVideoWidth(webcamVideo.videoWidth);
			setVideoHeight(webcamVideo.videoHeight);
		};
	}

	useInterval(
		() => {
			if (!signDetector) return;
			if (!webcamRef.current) return;

			const screenshot = webcamRef.current.getScreenshot();
			if (!screenshot) return;

			signDetector.processFrame(screenshot);
		},
		intervalBetweenFrames,
		[signDetector, webcamRef.current],
	);

	return (
		<>
			<div className={showWebcam ? "" : "absolute invisible"}>
				Webcam:
				<Webcam
					ref={webcamRef}
					audio={false}
					screenshotFormat="image/jpeg"
					videoConstraints={{
						facingMode: "environment",
					}}
				/>
			</div>
			<div>
				Output:
				<canvas ref={outputCanvasRef} width={videoWidth} height={videoHeight} />
			</div>
		</>
	);
}
