import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/ui/components/ui/dialog";
import { Button } from "@/ui/components/ui/button";
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
import { Trash2, AlertTriangle, Settings, Database, RefreshCw } from "lucide-react";
import { useState } from "react";

interface DoctorSettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DoctorSettingsDialog({ open, onOpenChange }: DoctorSettingsDialogProps) {
    const [isResetting, setIsResetting] = useState(false);
    const [isSeeding, setIsSeeding] = useState(false);
    const [seedMessage, setSeedMessage] = useState<string | null>(null);
    const [isSeedingConversion, setIsSeedingConversion] = useState(false);
    const [conversionMessage, setConversionMessage] = useState<string | null>(null);

    const handleFactoryReset = async () => {
        setIsResetting(true);
        try {
            await window.electronAPI.factoryReset();
        } catch (error) {
            console.error("Factory reset failed:", error);
            setIsResetting(false);
        }
    };

    const handleSeedMedicines = async () => {
        setIsSeeding(true);
        setSeedMessage(null);
        try {
            const result = await window.electronAPI.seedMedicines();
            setSeedMessage(result.success ? result.message : result.message);
        } catch (error) {
            console.error("Seed medicines failed:", error);
            setSeedMessage("Erreur lors du seed des médicaments.");
        } finally {
            setIsSeeding(false);
        }
    };

    const handleSeedLentilleConversion = async () => {
        setIsSeedingConversion(true);
        setConversionMessage(null);
        try {
            const result = await window.electronAPI.seedLentilleConversion();
            setConversionMessage(result.success ? result.message : result.message);
        } catch (error) {
            console.error("Seed lentille conversion failed:", error);
            setConversionMessage("Erreur lors du seed lentille_conv.");
        } finally {
            setIsSeedingConversion(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Paramètres Docteur
                    </DialogTitle>
                    <DialogDescription>
                        Configuration et maintenance de l'application.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {/* Seed Medicines */}
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-2">
                            <Database className="w-4 h-4" />
                            Base de données
                        </h3>
                        <p className="text-sm text-slate-600 mb-4">
                            Importez les médicaments depuis la base Supabase de l'assistant de configuration. Les doublons sont automatiquement exclus.
                        </p>
                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={handleSeedMedicines}
                            disabled={isSeeding}
                        >
                            <Database className="w-4 h-4" />
                            {isSeeding ? "Import en cours..." : "Importer les médicaments"}
                        </Button>
                        {seedMessage && (
                            <p className={`text-sm mt-3 ${seedMessage.startsWith("Erreur") ? "text-red-600" : "text-green-700"}`}>
                                {seedMessage}
                            </p>
                        )}
                        <p className="text-sm text-slate-600 mt-4 mb-2">
                            Remplit la table de conversion lentilles (lunettes ↔ lentilles de contact) avec les valeurs de référence.
                        </p>
                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={handleSeedLentilleConversion}
                            disabled={isSeedingConversion}
                        >
                            <RefreshCw className="w-4 h-4" />
                            {isSeedingConversion ? "Seed en cours..." : "Seed table lentille_conv"}
                        </Button>
                        {conversionMessage && (
                            <p className={`text-sm mt-3 ${conversionMessage.startsWith("Erreur") || conversionMessage.includes("n'existe pas") || conversionMessage.includes("introuvable") ? "text-red-600" : "text-green-700"}`}>
                                {conversionMessage}
                            </p>
                        )}
                    </div>

                    {/* Danger Zone */}
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <h3 className="text-sm font-semibold text-red-900 flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4" />
                            Zone de Danger
                        </h3>
                        <p className="text-sm text-red-700 mb-4">
                            La réinitialisation supprimera définitivement toutes les données, configurations et la base de données de cet ordinateur. L'application redémarrera comme lors de la première installation.
                        </p>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full gap-2">
                                    <Trash2 className="w-4 h-4" />
                                    Réinitialiser l'application
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Cette action est irréversible. Elle supprimera définitivement la base de données locale et la configuration de l'application.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleFactoryReset}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                        disabled={isResetting}
                                    >
                                        {isResetting ? "Réinitialisation..." : "Confirmer la réinitialisation"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
