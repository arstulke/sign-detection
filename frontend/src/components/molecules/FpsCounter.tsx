import { ForwardedRef, forwardRef, useImperativeHandle, useState } from "react";
import { useCurrentDate } from "../../hooks/useCurrentDate";

interface FpsCounterProps {}

export interface FpsCounterHandle {
	addFrame(): void;
}

const SECONDS_TO_CONSIDER = 10;
const MAX_DISPLAYABLE_FPS = 200;
const MAX_TIMESTAMPS = MAX_DISPLAYABLE_FPS * 10;

const FpsCounter = forwardRef(
	(_: FpsCounterProps, ref: ForwardedRef<FpsCounterHandle>) => {
		const [framesObj] = useState({ frames: [] as number[] });

		const { frames } = framesObj;
		const nowDate = useCurrentDate();
		const fps = calculateFps(frames, nowDate?.getTime());

		useImperativeHandle(
			ref,
			() => {
				return {
					addFrame() {
						const now = new Date().getTime();
						framesObj.frames.push(now);

						const reachedCapacity = frames.length >= MAX_TIMESTAMPS;
						if (reachedCapacity) {
							frames.shift();
						}
					},
				};
			},
			[],
		);

		return <>{fps}</>;
	},
);

function calculateFps(frames: number[], now?: number): number {
	if (!now) return -1;
	if (frames.length === 0) return -1;

	const firstTimeToConsider = now - 1000 * SECONDS_TO_CONSIDER;
	const framesToConsider = frames.filter(
		(frame) => frame >= firstTimeToConsider,
	);
	if (framesToConsider.length === 0) {
		return -1;
	}

	const firstFrame = framesToConsider[0];
	const durationMs = now - firstFrame;
	const frameCount = framesToConsider.length;
	return Math.round((frameCount * 1000) / durationMs);
}

export default FpsCounter;
