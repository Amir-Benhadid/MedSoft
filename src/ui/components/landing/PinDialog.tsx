import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button } from '@/ui/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/ui/components/ui/dialog';
import { Input } from '@/ui/components/ui/input';

interface PinDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	pin: string;
	setPin: (pin: string) => void;
	showPin: boolean;
	setShowPin: (show: boolean) => void;
	error: string | null;
	purpose: 'doctor' | 'settings' | string;
	onSubmit: () => void;
	onKeyPress: (e: React.KeyboardEvent) => void;
	isLoading?: boolean;
}

export function PinDialog({
	isOpen,
	onOpenChange,
	pin,
	setPin,
	showPin,
	setShowPin,
	error,
	purpose,
	onSubmit,
	onKeyPress,
	isLoading = false,
}: PinDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md p-6 sm:p-8 rounded-3xl sm:rounded-[2rem] border-0 shadow-2xl bg-white/95 backdrop-blur-md">
				<DialogHeader className="pt-2 sm:pt-4">
					<div className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-blue-50 mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500">
						<ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 animate-pulse" />
					</div>
					<DialogTitle className="text-2xl sm:text-3xl font-extrabold text-center text-gray-900 mb-1 sm:mb-2">
						{purpose === 'doctor'
							? 'Accès Docteur'
							: 'Authentification'}
					</DialogTitle>
					<DialogDescription className="text-center text-gray-500 text-base sm:text-lg">
						Veuillez saisir votre code PIN pour continuer.
					</DialogDescription>
				</DialogHeader>

				<div className="py-6 sm:py-8 space-y-4">
					<div className="relative group">
						<Input
							type={showPin ? 'text' : 'password'}
							placeholder=""
							value={pin}
							onChange={(e) => setPin(e.target.value)}
							onKeyPress={onKeyPress}
							autoFocus
							disabled={isLoading}
							className={`text-center text-2xl sm:text-3xl font-bold tracking-[0.3em] sm:tracking-[0.5em] h-16 sm:h-20 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 focus:ring-4 focus:ring-blue-100 ${error
								? 'border-red-300 bg-red-50 focus:border-red-400'
								: 'border-gray-100 bg-gray-50/50 focus:border-blue-500'
								}`}
						/>
						<Button
							variant="ghost"
							size="icon"
							className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 hover:bg-transparent text-gray-400 hover:text-gray-600 transition-colors"
							onClick={() => setShowPin(!showPin)}
							type="button"
						>
							{showPin ? (
								<EyeOff className="h-5 w-5 sm:h-6 sm:w-6" />
							) : (
								<Eye className="h-5 w-5 sm:h-6 sm:w-6" />
							)}
						</Button>
					</div>

					{error && (
						<div className="flex items-center justify-center gap-2 text-red-600 animate-in fade-in slide-in-from-top-2">
							<span className="text-sm font-medium">{error}</span>
						</div>
					)}
				</div>

				<DialogFooter className="sm:justify-center flex-col sm:flex-row gap-3 pt-2 sm:pt-4">
					<Button
						variant="ghost"
						onClick={() => onOpenChange(false)}
						disabled={isLoading}
						className="px-6 sm:px-8 h-12 sm:h-14 text-base sm:text-lg font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl sm:rounded-2xl"
					>
						Annuler
					</Button>
					<Button
						onClick={onSubmit}
						disabled={isLoading || pin.length < 4}
						className="px-8 sm:px-10 h-12 sm:h-14 text-base sm:text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 rounded-xl sm:rounded-2xl transition-all active:scale-95"
					>
						{isLoading ? (
							<div className="flex items-center gap-2">
								<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
								Vérification
							</div>
						) : (
							'Confirmer'
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}


