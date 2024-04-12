import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
	plugins: [solidPlugin(), VitePWA({ registerType: 'autoUpdate' })],
	server: {
		port: 3000,
	},
});
