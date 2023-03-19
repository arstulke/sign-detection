import { ReactNode } from "react";

interface OverlayTextProps {
	children?: ReactNode;
}

export default function ({ children }: OverlayTextProps) {
	return (
		<div className="m-3 px-1 py-0.5 text-xl text-white bg-black">
			{children}
		</div>
	);
}
