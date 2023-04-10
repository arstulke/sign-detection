import { useRef, useState } from "react";
import { useInterval } from "../../hooks/useInterval";
import { useSignDetector } from "../../hooks/sign-detector/useSignDetector";
import AspectRatioContainer from "../atoms/AspectRatioContainer";
import OutputCanvas, { OutputCanvasHandle } from "../molecules/OutputCanvas";
import Overlay from "../atoms/Overlay";
import OverlayText from "../atoms/OverlayText";
import WebcamWrapper, { WebcamWrapperHandle } from "../molecules/WebcamWrapper";

interface SignDetectionProps {
	fps?: number;
	showWebcam: "original" | "grabbed" | "none";
	isLoggingEnabled?: boolean;
	onMemorySize?: (memorySize: number, memorySizeUnit: string) => void;
}

export default function SignDetection({
	fps,
	showWebcam,
	isLoggingEnabled,
	onMemorySize,
}: SignDetectionProps) {
	if (!fps || fps <= 0) {
		fps = 1;
	}
	const intervalBetweenFrames = Math.round(1000 / fps);

	const signDetector = useSignDetector(true);
	const webcamRef = useRef<WebcamWrapperHandle>(null);
	const grabbedCanvasRef = useRef<OutputCanvasHandle>(null);
	const outputCanvasRef = useRef<OutputCanvasHandle>(null);

	const [videoWidth, setVideoWidth] = useState<number>();
	const [videoHeight, setVideoHeight] = useState<number>();
	const [videoAspectRatio, setVideoAspectRatio] = useState<number>();

	useInterval(
		async () => {
			if (!signDetector) return;
			if (!webcamRef.current) return;
			if (!outputCanvasRef.current) return;

			try {
				const frame = webcamRef.current.grabFrame();
				if (!frame) return;

				if (grabbedCanvasRef.current) {
					grabbedCanvasRef.current.drawFrame(frame, new Date());
				}

				const {
					outputFrame,
					start,
					preComputation,
					postComputation,
					end,
					memorySize,
					memorySizeUnit,
				} = await signDetector.processFrame(frame);
				outputCanvasRef.current.drawFrame(outputFrame, new Date(start));
				if (onMemorySize) {
					onMemorySize(memorySize, memorySizeUnit);
				}

				if (isLoggingEnabled) {
					const [queueWait, computation, queueToDraw] = [
						start,
						preComputation,
						postComputation,
						end,
					]
						.map((isoString) => new Date(isoString).getTime())
						.map((date, i, dates) => date - dates.at(i - 1)!)
						.slice(1);
					console.log(
						`processed frame, queueWait=${queueWait}ms, computation=${computation}ms, queueToDraw=${queueToDraw}ms`,
					);
				}
			} catch (err) {
				if ((err as { canceledWaiting?: boolean }).canceledWaiting) return;
				console.warn(err);
			}
		},
		intervalBetweenFrames,
		[signDetector, webcamRef.current],
	);

	const webcam = (
		<div className={showWebcam === "none" ? "absolute invisible" : "relative"}>
			<Overlay
				containerClasses="w-full max-w-full max-h-full z-10"
				containerStyles={{ aspectRatio: videoAspectRatio }}
				topLeft={<OverlayText>Webcam</OverlayText>}
			/>
			<div
				className={`max-w-full max-h-full ${
					showWebcam !== "original" ? "absolute invisible" : ""
				}`}
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
			<OutputCanvas
				className={`w-full max-w-full h-full max-h-full ${
					showWebcam !== "grabbed" ? "absolute invisible" : ""
				}`}
				ref={grabbedCanvasRef}
				width={videoWidth ?? 100}
				height={videoHeight ?? 100}
				aspectRatio={videoAspectRatio}
			/>
		</div>
	);

	const output = (
		<div className="relative">
			<Overlay
				containerClasses="w-full max-w-full max-h-full z-10"
				containerStyles={{ aspectRatio: videoAspectRatio }}
				topLeft={<OverlayText>Output</OverlayText>}
			/>
			<OutputCanvas
				className="w-full max-w-full h-full max-h-full"
				ref={outputCanvasRef}
				width={videoWidth ?? 100}
				height={videoHeight ?? 100}
				aspectRatio={videoAspectRatio}
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
