import { useState } from "react";
import { useInterval } from "./useInterval";

export function useCurrentDate(
	refreshIntervalMs: number = 10,
): Date | undefined {
	const [date, setDate] = useState<Date>();

	useInterval(() => {
		setDate(new Date());
	}, refreshIntervalMs);

	return date;
}
