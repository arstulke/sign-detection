import {
	ForwardedRef,
	forwardRef,
	useImperativeHandle,
	useMemo,
	useRef,
} from "react";
import { Frame } from "sign-detection-lib";

interface OutputCanvasProps {
	className?: string;
	width: number;
	height: number;
}

export interface OutputCanvasHandle {
	drawFrame(frame: Frame, start: Date): void;
}

// TODO display the fps

const OutputCanvas = forwardRef(
	(
		{ className, width, height }: OutputCanvasProps,
		ref: ForwardedRef<OutputCanvasHandle>,
	) => {
		const canvasRef = useRef<HTMLCanvasElement>(null);

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
					},
				};
			},
			[ctx],
		);

		return (
			<canvas
				ref={canvasRef}
				className={className}
				width={width}
				height={height}
			/>
		);
	},
);

export default OutputCanvas;
