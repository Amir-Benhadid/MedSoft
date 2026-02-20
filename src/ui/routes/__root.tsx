import { createRootRoute, Outlet } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { SetupWizard } from '@/ui/components/setup/SetupWizard';
import { AppLoader } from '@/ui/components/setup/AppLoader';
import { ConfigProvider } from '@/ui/contexts/ConfigContext';
import { SheetStackProvider } from '@/ui/components/ui/sheet-stack';

export const Route = createRootRoute({
	component: RootComponent,
	notFoundComponent: () => (
		<div style={{ padding: '2rem', textAlign: 'center' }}>
			<h1>404 - Page Not Found</h1>
			<p>The page you're looking for doesn't exist.</p>
		</div>
	),
});

function RootComponent() {
	const [isChecking, setIsChecking] = useState(true);
	const [isSetup, setIsSetup] = useState(false);
	const [config, setConfig] = useState<any>({});	// Determine window mode from URL
	const searchParams = new URLSearchParams(window.location.search);
	const isMainMode = searchParams.get('window') === 'main';

	const checkSetup = async () => {
		try {
			const result = await window.electronAPI.checkSetup();
			setIsSetup(result.isSetup);
			setConfig(result.config || {});
		} catch (error) {
			console.error('Failed to check setup', error);
			setIsSetup(false);
		} finally {
			setIsChecking(false);
		}
	};	useEffect(() => {
		checkSetup();
	}, []);	const handleSetupComplete = () => {
		checkSetup();
	};

	const handleLoaderComplete = () => {
		// Launch main window and close this loader window
		window.electronAPI.launchMainWindow();
	};

	if (isChecking) {
		return null;
	}

	// Main Window Mode: Always render app directly
	if (isMainMode) {
		return (
			<ConfigProvider config={config}>
				<SheetStackProvider>
					<div className="bg-background" style={{ width: '100%', height: '100vh' }}>
						<Outlet />
					</div>
				</SheetStackProvider>
			</ConfigProvider>
		);
	}

	// Loader/Setup Window Mode
	if (!isSetup) {
		return <SetupWizard onComplete={handleSetupComplete} />;
	}

	// Show loader if setup is complete (in loader window)
	return <AppLoader logoPath={config.logoPath} businessName={config.businessName} onComplete={handleLoaderComplete} />;
}
