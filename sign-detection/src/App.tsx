import SignDetection from "./SignDetection";

function App() {
	return <SignDetection fps={60} showWebcam={false} />;
}

// TODO Queue of ThreadPool should allow the definiton of a maximum capacity of waiting tasks and which to keep (first or last)
export default App;
