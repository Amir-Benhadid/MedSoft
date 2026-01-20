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

export function HeaderSection() {
	const { appMode } = useConfig();
	return (
		<div className="mb-12 sm:mb-16 lg:mb-20 opacity-0 animate-fade-in-up flex flex-col items-center px-2">
			<div className="absolute top-4 right-4 z-50" style={{ WebkitAppRegion: "no-drag" } as any}>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="h-10 w-10 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
						>
							<X className="h-6 w-6" />
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

			<div className="flex flex-col items-center text-center mb-6 sm:mb-8">
				<div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-2xl mb-6 sm:mb-8 transform hover:scale-110 transition-transform duration-500">
					<Stethoscope className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
				</div>
				<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-tight mb-4 sm:mb-6 px-4">
					Med<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Soft</span>
				</h1>
				<p className="text-base sm:text-xl md:text-2xl text-slate-500 max-w-2xl font-medium leading-relaxed px-4">
					La plateforme intelligente pour la gestion de votre cabinet, conçue pour l'excellence et la simplicité.
				</p>
			</div>
		</div>
	);
}


