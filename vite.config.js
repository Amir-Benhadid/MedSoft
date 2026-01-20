import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react({
			// Enable Fast Refresh for development
			fastRefresh: true,
			babel: {
				// The React Compiler plugin goes here
				plugins: ["babel-plugin-react-compiler"],
			  },
		}),
	],
	server: {
		port: 3000,
		strictPort: false, // Allow fallback to next available port
		hmr: {
			overlay: true,
			clientPort: 3000,
		},
		watch: {
			usePolling: true,
		},
		cors: true,
	},
	build: {
		outDir: 'dist-react',
		emptyOutDir: true,
		sourcemap: true,
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['react', 'react-dom'],
					mui: ['@mui/material', '@mui/icons-material'],
				},
			},
		},
	},
	base: './',
	resolve: {
		alias: {
			'@': resolve(process.cwd(), './src'),
		},
		extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
	},
	optimizeDeps: {
		include: [
			'react',
			'react-dom',
			'@mui/material',
			'@mui/icons-material',
			'@mui/x-date-pickers',
			'@emotion/react',
			'@emotion/styled',
		],
	},
});
