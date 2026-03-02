import { Settings, Eye, EyeOff, Shield } from 'lucide-react';
import { Button } from '@/ui/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/ui/components/ui/dialog';
import { Input } from '@/ui/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/components/ui/tabs';

interface SettingsDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	newPin: string;
	setNewPin: (pin: string) => void;
	confirmPin: string;
	setConfirmPin: (pin: string) => void;
	showNewPin: boolean;
	setShowNewPin: (show: boolean) => void;
	showConfirmPin: boolean;
	setShowConfirmPin: (show: boolean) => void;
	tab: number;
	setTab: (tab: number) => void;
	onPinUpdate: () => void;
	isLoading?: boolean;
}

export function SettingsDialog({
	isOpen,
	onOpenChange,
	newPin,
	setNewPin,
	confirmPin,
	setConfirmPin,
	showNewPin,
	setShowNewPin,
	showConfirmPin,
	setShowConfirmPin,
	tab,
	setTab,
	onPinUpdate,
	isLoading = false,
}: SettingsDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md p-6 sm:p-8 rounded-3xl sm:rounded-[2rem] border-0 shadow-2xl bg-white/95 backdrop-blur-md">
				<DialogHeader className="flex flex-row items-center gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-gray-100">
					<div className="p-2 sm:p-3 bg-blue-50 rounded-xl sm:rounded-2xl">
						<Settings className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
					</div>
					<DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900">Paramètres</DialogTitle>
				</DialogHeader>

				<Tabs value={String(tab)} onValueChange={(v) => setTab(Number(v))} className="mt-4 sm:mt-6">
					<TabsList className="grid w-full grid-cols-1 bg-gray-100/50 p-1 rounded-xl">
						<TabsTrigger value="0" className="rounded-lg font-semibold">Sécurité & PIN</TabsTrigger>
					</TabsList>

					<TabsContent value="0" className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
						<div className="flex flex-col items-center text-center mb-2">
							<div className="p-3 sm:p-4 bg-gray-50 rounded-full mb-3 sm:mb-4">
								<Shield className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
							</div>
							<h3 className="text-lg sm:text-xl font-bold text-gray-900">
								Modifier le code PIN
							</h3>
							<p className="text-sm sm:text-base text-gray-500 mt-2">
								Le code PIN est requis pour l'accès aux dossiers médicaux et aux réglages.
							</p>
						</div>

						<div className="space-y-4">
							<div className="relative group">
								<Input
									type={showNewPin ? 'text' : 'password'}
									placeholder="Nouveau PIN"
									value={newPin}
									onChange={(e) => setNewPin(e.target.value)}
									disabled={isLoading}
									className="text-center text-lg sm:text-xl font-bold tracking-[0.2em] sm:tracking-[0.3em] h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 bg-gray-50/50 border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
								/>
								<Button
									variant="ghost"
									size="icon"
									className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-transparent"
									onClick={() => setShowNewPin(!showNewPin)}
									type="button"
								>
									{showNewPin ? (
										<EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
									) : (
										<Eye className="h-4 w-4 sm:h-5 sm:w-5" />
									)}
								</Button>
							</div>

							<div className="relative group">
								<Input
									type={showConfirmPin ? 'text' : 'password'}
									placeholder="Confirmer le PIN"
									value={confirmPin}
									onChange={(e) => setConfirmPin(e.target.value)}
									disabled={isLoading}
									className="text-center text-lg sm:text-xl font-bold tracking-[0.2em] sm:tracking-[0.3em] h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 bg-gray-50/50 border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
								/>
								<Button
									variant="ghost"
									size="icon"
									className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-transparent"
									onClick={() => setShowConfirmPin(!showConfirmPin)}
									type="button"
								>
									{showConfirmPin ? (
										<EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
									) : (
										<Eye className="h-4 w-4 sm:h-5 sm:w-5" />
									)}
								</Button>
							</div>

							<Button
								className="w-full h-12 sm:h-14 mt-4 text-base sm:text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl sm:rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-95"
								onClick={onPinUpdate}
								disabled={isLoading || !newPin || newPin !== confirmPin || newPin.length < 4}
							>
								{isLoading ? (
									<div className="flex items-center gap-2">
										<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
										Mise à jour...
									</div>
								) : (
									'Enregistrer le nouveau PIN'
								)}
							</Button>
						</div>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}


