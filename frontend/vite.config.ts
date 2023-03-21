import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		viteStaticCopy({
			targets: [
				{
					src: "node_modules/sign-detection-lib/src/wasm-build/main.wasm",
					dest: "assets",
				},
			],
		}),
	],
	build: {
		minify: false,
	},
	base: "./",
});
