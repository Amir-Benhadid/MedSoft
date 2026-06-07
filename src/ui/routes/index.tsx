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
	const { appMode, serverMode } = useConfig();

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

	const handleForceSettingsAccess = () => {
		pinDialog.closeDialog();
		settingsDialog.openDialog();
	};

	return (
		<>
			<div className="h-screen bg-[#f8fafc] flex items-center justify-center relative overflow-hidden p-[2vh] sm:p-[3vh]">
				{/* Background decorative elements */}
				<div className="absolute top-[-10%] left-[-10%] w-[70%] sm:w-[60%] md:w-[40%] h-[70%] sm:h-[60%] md:h-[40%] bg-blue-100/50 rounded-full blur-[60px] sm:blur-[80px] md:blur-[120px] pointer-events-none" />
				<div className="absolute bottom-[-10%] right-[-10%] w-[70%] sm:w-[60%] md:w-[40%] h-[70%] sm:h-[60%] md:h-[40%] bg-indigo-100/50 rounded-full blur-[60px] sm:blur-[80px] md:blur-[120px] pointer-events-none" />

				<div className="max-w-7xl w-full h-full relative z-10 flex flex-col items-center justify-center px-4 sm:px-6 py-[2vh]">
					<HeaderSection />

					<div className="flex flex-col sm:flex-row gap-[2vh] sm:gap-[3vh] justify-center items-stretch w-full max-w-5xl mt-[3vh] flex-shrink-0">
						<RoleCard
							icon={User}
							iconColor="text-blue-600"
							title="Secrétaire"
							description="Gérez les rendez-vous, accueillez les patients et coordonnez l'activité quotidienne du cabinet."
							buttonText="Secrétariat"
							buttonColor="bg-blue-600 text-white"
							onClick={handleSecretaryAccess}
							className="flex-1"
						/>

						{appMode !== 'secretary' && (
							<RoleCard
								icon={Stethoscope}
								iconColor="text-indigo-600"
								title="Docteur"
								description="Accédez aux dossiers médicaux, gérez les consultations et suivez l'historique clinique."
								buttonText="Médecin"
								buttonColor="bg-indigo-600 text-white"
								onClick={handleDoctorAccess}
								requiresLock
								animationDelay="0.15s"
								className="flex-1"
							/>
						)}
					</div>

					<div className="fixed top-[1.5vh] right-[1.5vh] sm:top-[3vh] sm:right-[3vh] z-50">
						<Button
							variant="outline"
							size="icon"
							className="h-[5vh] w-[5vh] sm:h-[6vh] sm:w-[6vh] max-h-14 max-w-14 rounded-xl sm:rounded-2xl bg-white/80 backdrop-blur-md shadow-xl border-slate-100 hover:bg-white hover:scale-110 active:scale-95 transition-all duration-300 group"
							onClick={handleSettingsClick}
						>
							<Settings className="h-[2.5vh] w-[2.5vh] sm:h-[3vh] sm:w-[3vh] max-h-6 max-w-6 text-slate-500 group-hover:rotate-90 transition-transform duration-500" />
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
				onForceAccess={handleForceSettingsAccess}
				showForceAccess={pinDialog.purpose === 'settings' && serverMode === 'host'}
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
