import {
	ForwardedRef,
	forwardRef,
	useImperativeHandle,
	useMemo,
	useRef,
} from "react";
import { Frame } from "sign-detection-lib";
import FpsCounter, { FpsCounterHandle } from "./FpsCounter";
import Overlay from "../atoms/Overlay";
import OverlayText from "../atoms/OverlayText";

interface OutputCanvasProps {
	className?: string;
	width: number;
	height: number;
	aspectRatio: number | undefined;
}

export interface OutputCanvasHandle {
	drawFrame(frame: Frame, start: Date): void;
}

// TODO display the fps

const OutputCanvas = forwardRef(
	(
		{ className, width, height, aspectRatio }: OutputCanvasProps,
		ref: ForwardedRef<OutputCanvasHandle>,
	) => {
		const canvasRef = useRef<HTMLCanvasElement>(null);
		const fpsCounterRef = useRef<FpsCounterHandle>(null);

		const ctx = useMemo(() => {
			return canvasRef.current?.getContext("2d") as
				| (CanvasRenderingContext2D & { lastFrame: Date })
				| undefined;
		}, [canvasRef.current]);

		useImperativeHandle(
			ref,
			() => {
				const defaultHandle = {
					drawFrame() {},
				};
				if (!ctx) return defaultHandle;

				return {
					drawFrame(frame: Frame, start: Date) {
						// ignoring old frames
						if (ctx.lastFrame && ctx.lastFrame > start) return;

						ctx.lastFrame = start;
						const imageData = new ImageData(
							frame.arr,
							frame.width,
							frame.height,
							{ colorSpace: "srgb" },
						);
						ctx.putImageData(imageData, 0, 0);

						if (fpsCounterRef.current) {
							fpsCounterRef.current.addFrame();
						}
					},
				};
			},
			[ctx],
		);

		return (
			<div className={`relative ${className}`}>
				<Overlay
					containerClasses="w-full max-w-full max-h-full"
					containerStyles={{ aspectRatio }}
					topRight={
						<OverlayText>
							FPS: <FpsCounter ref={fpsCounterRef} />
						</OverlayText>
					}
				/>
				<canvas
					ref={canvasRef}
					className="max-w-full max-h-full"
					width={width}
					height={height}
				/>
			</div>
		);
	},
);

export default OutputCanvas;
