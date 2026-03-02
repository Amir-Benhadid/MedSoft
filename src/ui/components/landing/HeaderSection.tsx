import { Stethoscope, CheckCircle2, Sparkles, X } from 'lucide-react';
import { Badge } from '@/ui/components/ui/badge';
import { Button } from '@/ui/components/ui/button';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/ui/components/ui/alert-dialog";
import { useConfig } from '@/ui/contexts/ConfigContext';
import { UpdateIndicator } from '@/ui/components/UpdateIndicator';

export function HeaderSection() {
	const { appMode } = useConfig();
	return (
		<div className="mb-[4vh] sm:mb-[6vh] opacity-0 animate-fade-in-up flex flex-col items-center px-4 flex-shrink-0">
			<div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-50" style={{ WebkitAppRegion: "no-drag" } as any}>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="h-9 w-9 sm:h-10 sm:w-10 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
						>
							<X className="h-5 w-5 sm:h-6 sm:w-6" />
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Quitter l'application ?</AlertDialogTitle>
							<AlertDialogDescription>
								Êtes-vous sûr de vouloir fermer l'application ?
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Annuler</AlertDialogCancel>
							<AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={() => window.electronAPI.closeWindow()}>
								Quitter
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>

			{/* Update Indicator - Top Right */}
			<div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50" style={{ WebkitAppRegion: "no-drag" } as any}>
				<UpdateIndicator />
			</div>

			<div className="flex flex-col items-center text-center mb-[2vh]">
				<div className="p-[1.5vh] sm:p-[2vh] rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-2xl mb-[2vh] sm:mb-[2.5vh] transform hover:scale-110 transition-transform duration-500">
					<Stethoscope className="h-[5vh] w-[5vh] sm:h-[6vh] sm:w-[6vh] max-h-20 max-w-20 text-white" />
				</div>
				<h1 className="text-[4vh] sm:text-[5vh] md:text-[6vh] lg:text-[7vh] font-black text-slate-900 tracking-tight leading-tight mb-[1.5vh] sm:mb-[2vh] px-4">
					Med<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Soft</span>
				</h1>
				<p className="text-[1.6vh] sm:text-[1.8vh] md:text-[2vh] lg:text-[2.2vh] text-slate-500 max-w-2xl font-medium leading-relaxed px-4">
					La plateforme intelligente pour la gestion de votre cabinet, conçue pour l'excellence et la simplicité.
				</p>
			</div>
		</div>
	);
}


