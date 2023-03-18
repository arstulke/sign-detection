import { useRef, useState } from "react";
import { useInterval } from "../hooks/useInterval";
import { useSignDetector } from "../hooks/useSignDetector";
import AspectRatioContainer from "./AspectRatioContainer";
import OutputCanvas, { OutputCanvasHandle } from "./OutputCanvas";
import WebcamWrapper, { WebcamWrapperHandle } from "./WebcamWrapper";

interface SignDetectionProps {
	fps?: number;
	showWebcam?: boolean;
	isLoggingEnabled?: boolean;
}

export default function SignDetection({
	fps,
	showWebcam,
	isLoggingEnabled,
}: SignDetectionProps) {
	if (!fps || fps <= 0) {
		fps = 10;
	}
	const intervalBetweenFrames = Math.round(1000 / fps);

	const signDetector = useSignDetector();
	const webcamRef = useRef<WebcamWrapperHandle>(null);
	const outputCanvasRef = useRef<OutputCanvasHandle>(null);

	const [videoWidth, setVideoWidth] = useState<number>();
	const [videoHeight, setVideoHeight] = useState<number>();
	const [videoAspectRatio, setVideoAspectRatio] = useState<number>();

	useInterval(
		async () => {
			if (!signDetector) return;
			if (!webcamRef.current) return;
			if (!outputCanvasRef.current) return;

			const frame = webcamRef.current.grabFrame();
			if (!frame) return;

			const { outputFrame, start, end } = await signDetector.processFrame(
				frame,
			);
			const startDate = new Date(start);
			if (isLoggingEnabled) {
				const delayMs = new Date(end).getTime() - startDate.getTime();
				console.log(`processed frame, delay=${delayMs}ms`);
			}
			outputCanvasRef.current.drawFrame(outputFrame, startDate);
		},
		intervalBetweenFrames,
		[signDetector, webcamRef.current],
	);

	const webcam = (
		<div className={showWebcam ? "" : "absolute invisible"}>
			<div className="absolute m-3 px-1 py-0.5 text-xl text-white bg-black">
				Webcam
			</div>
			<div
				className="max-w-full max-h-full"
				style={{ aspectRatio: videoAspectRatio ?? 1 }}
			>
				<WebcamWrapper
					ref={webcamRef}
					onVideoDimensions={({
						videoWidth,
						videoHeight,
						videoAspectRatio,
					}) => {
						setVideoWidth(videoWidth);
						setVideoHeight(videoHeight);
						setVideoAspectRatio(videoAspectRatio);
					}}
				/>
			</div>
		</div>
	);

	const output = (
		<div>
			<div className="absolute m-3 px-1 py-0.5 text-xl text-white bg-black">
				Output
			</div>
			<OutputCanvas
				className="max-w-full max-h-full"
				ref={outputCanvasRef}
				width={videoWidth ?? 100}
				height={videoHeight ?? 100}
			/>
		</div>
	);

	return (
		<AspectRatioContainer
			elementAspectRatio={videoAspectRatio ?? 1}
			containerClasses="gap-6"
			one={webcam}
			two={output}
		/>
	);
}
