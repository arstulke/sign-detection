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

			const { outputFrame, start, preComputation, postComputation, end } =
				await signDetector.processFrame(frame);
			outputCanvasRef.current.drawFrame(outputFrame, new Date(start));

			if (isLoggingEnabled) {
				const [threadPoolWait, computation, threadPoolOut] = [
					start,
					preComputation,
					postComputation,
					end,
				]
					.map((isoString) => new Date(isoString).getTime())
					.map((date, i, dates) => date - dates.at(i - 1)!)
					.slice(1);
				console.log(
					`processed frame, threadPoolWait=${threadPoolWait}ms, computation=${computation}ms, threadPoolOut=${threadPoolOut}ms`,
				);
			}
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
