import { useEffect } from "react";

export function useInterval(
	fn: () => void,
	intervalMs: number,
	deps: React.DependencyList = [],
) {
	useEffect(() => {
		const intervalId = setInterval(fn, intervalMs);
		return () => clearInterval(intervalId);
	}, deps);
}
