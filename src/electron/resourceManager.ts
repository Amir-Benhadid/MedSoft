import fs from 'fs';
import os from 'os';
import osUtils from 'os-utils';

const POLLING_INTERVAL = 500;

/**
 * Polls system resources at regular intervals.
 * Currently disabled - the polling logic is commented out.
 */
export function pollResources() {
	setInterval(async () => {
	}, POLLING_INTERVAL);
}

/**
 * Gets static system information that doesn't change during runtime.
 *
 * @returns Object containing total storage (GB), CPU model, and total memory (GB)
 */
export function getStaticData() {
	const totalStorage = getStorageData().total;
	const cpuModel = os.cpus()[0].model;
	const totalMemoryGB = Math.floor(osUtils.totalmem() / 1024);

	return {
		totalStorage,
		cpuModel,
		totalMemoryGB,
	};
}

/**
 * Gets storage information for the root filesystem.
 * Requires Node.js 18+ for fs.statfsSync.
 *
 * @returns Object containing total storage (GB) and usage percentage (0-1)
 */
function getStorageData() {
	const stats = fs.statfsSync(process.platform === 'win32' ? 'C://' : '/');
	const total = stats.bsize * stats.blocks;
	const free = stats.bsize * stats.bfree;

	return {
		total: Math.floor(total / 1_000_000_000),
		usage: 1 - free / total,
	};
}
