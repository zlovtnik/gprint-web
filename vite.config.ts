import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import compression from 'vite-plugin-compression';

export default defineConfig({
	plugins: [
		sveltekit(),
		tailwindcss(),
		// Gzip compression for all assets
		compression({
			algorithm: 'gzip',
			ext: '.gz',
			threshold: 1024, // Only compress files > 1KB
			deleteOriginFile: false
		}),
		// Brotli compression (better than gzip, ~20% smaller)
		compression({
			algorithm: 'brotliCompress',
			ext: '.br',
			threshold: 1024,
			deleteOriginFile: false
		})
	],
	build: {
		// Enable minification
		minify: 'esbuild',
		// Target modern browsers for smaller bundles
		target: 'es2022',
		// Disable source maps for smaller builds
		sourcemap: false,
		// CSS code splitting
		cssCodeSplit: true,
		// Chunk size warning threshold
		chunkSizeWarningLimit: 500
	}
});
