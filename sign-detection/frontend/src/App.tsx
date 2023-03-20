import SignDetection from "./components/organisms/SignDetection";

function App() {
	return (
		<div className="p-6 w-full h-full">
			<SignDetection fps={60} showWebcam="grabbed" isLoggingEnabled={false} />
		</div>
	);
}

export default App;
