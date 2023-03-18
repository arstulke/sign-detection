import SignDetection from "./components/SignDetection";

function App() {
	return (
		<div className="p-6 w-full h-full">
			<SignDetection fps={10} showWebcam={true} isLoggingEnabled={true} />
		</div>
	);
}

// TODO Queue of ThreadPool should allow the definiton of a maximum capacity of waiting tasks and which to keep (first or last)
export default App;
