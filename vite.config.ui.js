import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import { resolve } from 'path';
import { defineConfig } from 'vite';

// Resolve the UI index.html
const root = resolve(__dirname, 'src/ui');

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react({
			fastRefresh: true,
			babel: {
				plugins: ['babel-plugin-react-compiler'],
			},
		}),
		TanStackRouterVite({
			routesDirectory: './routes',
			generatedRouteTree: './routeTree.gen.ts',
		}),
	],
	server: {
		host: '127.0.0.1',
		port: 3001,
		strictPort: false,
		hmr: {
			overlay: true,
			clientPort: 3001,
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
					tanstack: [
						'@tanstack/react-router',
						'@tanstack/react-query',
					],
				},
			},
		},
	},
	base: './',
	root,
	resolve: {
		alias: {
			'@': resolve(process.cwd(), './src'),
			react: resolve(process.cwd(), './node_modules/react'),
			'react-dom': resolve(process.cwd(), './node_modules/react-dom'),
		},
		extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
	},
	optimizeDeps: {
		include: [
			'react',
			'react-dom',
			'@tanstack/react-router',
			'@tanstack/react-query',
		],
	},
});

