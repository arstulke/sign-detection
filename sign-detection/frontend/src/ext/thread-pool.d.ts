export class WorkerPool {
	constructor(workerConstructor: new () => Worker);
	started(): Promise<this>;
	scaleTo(targetSize: number): Promise<this>;
	completed(): Promise<this>;
	terminate(gracefully?: boolean): Promise<void>;

	run<In, Out>(taskName: string, input: In): Promise<Out>;
}

export function exposeSingleFunction<In, Out>(
	fn: (input: In) => Out | Promise<Out>,
	taskName: string,
);
