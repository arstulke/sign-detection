import { ReactNode, useRef } from "react";
import { useElementSize } from "../hooks/useElementSize";

export interface AspectRatioContainerProps {
	elementAspectRatio: number;
	containerClasses?: string;
	one: ReactNode;
	two: ReactNode;
}

export default function ({
	elementAspectRatio,
	containerClasses,
	one,
	two,
}: AspectRatioContainerProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const containerSize = useElementSize(containerRef);

	const isLandscape = containerSize
		? containerSize.width / containerSize.height > elementAspectRatio
		: true;

	const gridDimensionClasses = isLandscape
		? "grid-rows-1 grid-cols-2"
		: "grid-rows-2 grid-cols-1";

	return (
		<div
			className={`w-full h-full grid ${containerClasses} ${gridDimensionClasses}`}
			ref={containerRef}
		>
			{one}
			{two}
		</div>
	);
}
