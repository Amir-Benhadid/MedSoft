import { app } from 'electron';
import path from 'path';
import { isDev } from './utils.js';

/**
 * Gets the path to the preload script.
 * In development, looks in the current directory; in production, looks one level up.
 *
 * @returns The absolute path to the preload script file
 */
export function getPreloadPath() {
	return path.join(
		app.getAppPath(),
		isDev() ? '.' : '..',
		'/dist-electron/preload.cjs'
	);
}

/**
 * Gets the path to the UI HTML file.
 *
 * @returns The absolute path to the index.html file
 */
export function getUIPath() {
	return path.join(app.getAppPath(), '/dist-react/index.html');
}

/**
 * Gets the path to the assets directory.
 * In development, looks in the current directory; in production, looks one level up.
 *
 * @returns The absolute path to the assets directory
 */
export function getAssetPath() {
	return path.join(app.getAppPath(), isDev() ? '.' : '..', '/src/assets');
}
