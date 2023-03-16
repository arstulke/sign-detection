import useResizeObserver from "@react-hook/resize-observer";
import { MutableRefObject, RefObject, useLayoutEffect, useState } from "react";

export function useElementSize(
	target: RefObject<HTMLElement>,
): DOMRectReadOnly | undefined {
	const [size, setSize] = useState<DOMRectReadOnly>();

	useLayoutEffect(() => {
		if (!target.current) return;

		const initialSize = target.current.getBoundingClientRect();
		setSize(initialSize);
	}, [target]);

	// Where the magic happens
	useResizeObserver(target, (entry) => setSize(entry.contentRect));
	return size;
}
