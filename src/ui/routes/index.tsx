/**
 * Landing Page Route
 * 
 * Main entry point of the application. Displays role selection cards
 * (Secretary and Doctor) and handles PIN authentication for doctor access.
 * Also provides access to settings dialog.
 */

import { useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { User, Stethoscope, Settings } from 'lucide-react';
import { Button } from '@/ui/components/ui/button';
import { HeaderSection } from '@/ui/components/landing/HeaderSection';
import { PinDialog } from '@/ui/components/landing/PinDialog';
import { RoleCard } from '@/ui/components/landing/RoleCard';
import { SettingsDialog } from '@/ui/components/landing/SettingsDialog';
import { usePinDialog } from '@/ui/hooks/usePinDialog';
import { useSettingsDialog } from '@/ui/hooks/useSettingsDialog';
import { useNavigation } from '@/ui/hooks/useNavigation';
import { useConfig } from '@/ui/contexts/ConfigContext';

export const Route = createFileRoute('/')({
	component: LandingPage,
});

/**
 * Landing page component
 * 
 * Renders role selection interface with:
 * - Secretary access (no PIN required)
 * - Doctor access (PIN required)
 * - Settings button (PIN required)
 * 
 * Automatically redirects to secretary if app is in secretary-only mode.
 * 
 * @returns {JSX.Element} Landing page component
 */
function LandingPage() {
	const { goToSecretary } = useNavigation();
	const { appMode } = useConfig();

	useEffect(() => {
		if (appMode === 'secretary') {
			goToSecretary();
		}
	}, [appMode, goToSecretary]);

	const settingsDialog = useSettingsDialog();
	const pinDialog = usePinDialog(() => {
		settingsDialog.openDialog();
	});


	const handleSecretaryAccess = () => {
		goToSecretary();
	};

	const handleDoctorAccess = () => {
		pinDialog.openDialog('doctor');
	};

	const handleSettingsClick = () => {
		pinDialog.openDialog('settings');
	};

	return (
		<>
			<div className="min-h-screen bg-[#f8fafc] flex items-center justify-center relative p-3 sm:p-6 lg:p-8 overflow-hidden">
				{/* Background decorative elements */}
				<div className="absolute top-[-10%] left-[-10%] w-[60%] sm:w-[40%] h-[60%] sm:h-[40%] bg-blue-100/50 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />
				<div className="absolute bottom-[-10%] right-[-10%] w-[60%] sm:w-[40%] h-[60%] sm:h-[40%] bg-indigo-100/50 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none" />

				<div className="max-w-6xl w-full relative z-10 flex flex-col items-center px-2 sm:px-4">
					<HeaderSection />

					<div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 justify-center items-stretch w-full max-w-4xl mt-4 px-2">
						<RoleCard
							icon={User}
							iconColor="text-blue-600"
							title="Secrétaire"
							description="Gérez les rendez-vous, accueillez les patients et coordonnez l'activité quotidienne du cabinet."
							buttonText="Espace Secrétariat"
							buttonColor="bg-blue-600 text-white"
							onClick={handleSecretaryAccess}
						/>

						{appMode !== 'secretary' && (
							<RoleCard
								icon={Stethoscope}
								iconColor="text-indigo-600"
								title="Docteur"
								description="Accédez aux dossiers médicaux, gérez les consultations et suivez l'historique clinique."
								buttonText="Espace Docteur"
								buttonColor="bg-indigo-600 text-white"
								onClick={handleDoctorAccess}
								requiresLock
								animationDelay="0.15s"
							/>
						)}
					</div>

					<div className="fixed top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8">
						<Button
							variant="outline"
							size="icon"
							className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-white/80 backdrop-blur-md shadow-xl border-slate-100 hover:bg-white hover:scale-110 active:scale-95 transition-all duration-300 group"
							onClick={handleSettingsClick}
						>
							<Settings className="h-5 w-5 sm:h-6 sm:w-6 text-slate-500 group-hover:rotate-90 transition-transform duration-500" />
						</Button>
					</div>
				</div>
			</div>

			<PinDialog
				isOpen={pinDialog.isOpen}
				onOpenChange={(open) => {
					if (!open) pinDialog.closeDialog();
				}}
				pin={pinDialog.pin}
				setPin={pinDialog.setPin}
				showPin={pinDialog.showPin}
				setShowPin={pinDialog.setShowPin}
				error={pinDialog.error}
				purpose={pinDialog.purpose}
				onSubmit={pinDialog.handleSubmit}
				onKeyPress={pinDialog.handleKeyPress}
				isLoading={pinDialog.isLoading}
			/>

			<SettingsDialog
				isOpen={settingsDialog.isOpen}
				onOpenChange={(open) => {
					if (!open) settingsDialog.closeDialog();
				}}
				newPin={settingsDialog.newPin}
				setNewPin={settingsDialog.setNewPin}
				confirmPin={settingsDialog.confirmPin}
				setConfirmPin={settingsDialog.setConfirmPin}
				showNewPin={settingsDialog.showNewPin}
				setShowNewPin={settingsDialog.setShowNewPin}
				showConfirmPin={settingsDialog.showConfirmPin}
				setShowConfirmPin={settingsDialog.setShowConfirmPin}
				tab={settingsDialog.tab}
				setTab={settingsDialog.setTab}
				onPinUpdate={settingsDialog.handlePinUpdate}
				isLoading={settingsDialog.isLoading}
			/>
		</>
	);
}

