type Statistics = {
	cpuUsage: number;
	ramUsage: number;
	storageUsage: number;
};

type StaticData = {
	totalStorage: number;
	cpuModel: string;
	totalMemoryGB: number;
};

type View = 'CPU' | 'RAM' | 'STORAGE';

type FrameWindowAction = 'CLOSE' | 'MAXIMIZE' | 'MINIMIZE';

type EventPayloadMapping = {
	statistics: Statistics;
	getStaticData: StaticData;
	changeView: View;
	sendFrameAction: FrameWindowAction;
};

type UnsubscribeFunction = () => void;

interface Window {
	electron: {
		subscribeStatistics: (
			callback: (statistics: Statistics) => void
		) => UnsubscribeFunction;
		getStaticData: () => Promise<StaticData>;
		subscribeChangeView: (
			callback: (view: View) => void
		) => UnsubscribeFunction;
		sendFrameAction: (payload: FrameWindowAction) => void;
		invoke: (channel: string, ...args: any[]) => Promise<any>;
		onDataChanged: (callback: (resource: string) => void) => () => void;
		test: () => string;
		getVersion: () => Promise<string>;
		getServerIP: () => Promise<string>;
		onUpdateAvailable: (callback: (info: any) => void) => void;
		onDownloadProgress: (callback: (progress: any) => void) => void;
		onUpdateDownloaded: (callback: (info: any) => void) => void;
		quitAndInstall: () => void;
		onUpdateError: (callback: (error: any) => void) => void;
	};
}
