import { CSSProperties, ReactNode } from "react";

interface OverlayProps {
	containerClasses?: string;
	containerStyles?: CSSProperties;
	aspectRatio?: number;
	topLeft?: ReactNode;
	topRight?: ReactNode;
}

export default function Overlay({
	containerClasses,
	containerStyles,
	topLeft,
	topRight,
}: OverlayProps) {
	const wrappedTopLeft = (
		<div
			className={`absolute grid ${containerClasses}`}
			style={containerStyles}
		>
			<div className="self-start justify-self-start">{topLeft}</div>
		</div>
	);

	const wrappedTopRight = (
		<div
			className={`absolute grid ${containerClasses}`}
			style={containerStyles}
		>
			<div className="self-start justify-self-end">{topRight}</div>
		</div>
	);

	return (
		<>
			{topLeft ? wrappedTopLeft : null}
			{topRight ? wrappedTopRight : null}
		</>
	);
}
