import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		tanstackStart(),
		tsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tailwindcss(),
		react(),
	],
	// resolve: {
	// 	alias: {
	// 		"@": path.resolve(__dirname, "./src"),
	// 	},
	// },
});
