import { useState } from "react";
import SignDetection from "./components/organisms/SignDetection";

function App() {
	const [isDebug, setIsDebug] = useState(true);
	const maxGrabberFps = isDebug ? 1 : 60;

	return (
		<div className="p-6 w-full h-full flex flex-col space-y-4">
			<div className="flex space-x-4 items-center">
				<button
					className="w-[6.5rem] py-2 px-3 rounded-xl text-white bg-blue-500 hover:bg-blue-600 border border-blue-300"
					onClick={() => setIsDebug(!isDebug)}
				>
					{isDebug ? "Run faster" : "Run slower"}
				</button>
				<span>Max Grabber FPS: {maxGrabberFps}</span>
			</div>
			<div className="flex-grow h-full">
				<SignDetection
					fps={maxGrabberFps}
					showWebcam="grabbed"
					isLoggingEnabled={false}
				/>
			</div>
		</div>
	);
}

export default App;
