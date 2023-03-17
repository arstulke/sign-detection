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
	drawFrame(frame: Frame): void;
}

const OutputCanvas = forwardRef(
	(
		{ className, width, height }: OutputCanvasProps,
		ref: ForwardedRef<OutputCanvasHandle>,
	) => {
		const canvasRef = useRef<HTMLCanvasElement>(null);

		const ctx = useMemo(() => {
			return canvasRef.current?.getContext("2d");
		}, [canvasRef.current]);

		useImperativeHandle(
			ref,
			() => {
				const defaultHandle = {
					drawFrame() {},
				};
				if (!ctx) return defaultHandle;

				return {
					drawFrame(frame: Frame) {
						const uint8Array = new Uint8ClampedArray(frame.buffer);
						const imageData = new ImageData(
							uint8Array,
							frame.width,
							frame.height,
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
