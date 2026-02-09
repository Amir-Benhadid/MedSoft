import { Eye, Printer } from "lucide-react";
import { cn } from "@/ui/lib/utils";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { EyeRefractionPanel } from "@/ui/components/doctor/dashboard/EyeRefractionPanel";
import { Button } from "@/ui/components/ui/button";
import { DocumentPrinter } from "@/ui/components/doctor/documents/PrintingLogic";

interface SecretaryRefractionPanelProps {
    lastRefractionData: any; // Type should ideally be shared or imported from router outputs
    showRefraction: boolean;
    patient: any;
}

export function SecretaryRefractionPanel({ lastRefractionData, showRefraction, patient }: SecretaryRefractionPanelProps) {
    const handlePrintCertificate = () => {
        if (!lastRefractionData || !patient) return;

        // Construct print data from the refraction data
        // DocumentPrinter expects { leftEye, rightEye } in options for 'visualAcuity'
        // But actually 'visualAcuity' type uses printDataOverrides?.certificate OR just raw strings if we pass null overrides?
        // Let's look at DocumentPrinter.printDocument('visualAcuity', ...) logic.
        // It calls generateVisualAcuityCertificatePDF.
        // It passes options.printDataOverrides?.certificate.
        // If we want to print CURRENT data, we should pass it via overrides or ensure the store is used?
        // VisualAcuityCertificateDocument uses the STORE.
        // So we might need to populate the store temporarily OR update VisualAcuityCertificateDocument to accept props?
        // Wait, VisualAcuityCertificateDocument reads from useConsultationStore.

        // This is tricky. The certificate generator is coupled to the Doctor Store.
        // I should probably refactor VisualAcuityCertificateDocument to accept data, 
        // OR simply rely on the fact that if we use DocumentPrinter, we can pass overrides.

        // Let's pass the data as overrides so the PDF generator uses them.
        // The generateVisualAcuityCertificatePDF function takes `printData`.

        const printData = {
            rightEye: {
                visualAcuityVL_SC: lastRefractionData.right_eye?.visualAcuityVL_SC || '',
                visualAcuityVL_AC: lastRefractionData.right_eye?.visualAcuityVL_AC || '',
                glassType: ''
            },
            leftEye: {
                visualAcuityVL_SC: lastRefractionData.left_eye?.visualAcuityVL_SC || '',
                visualAcuityVL_AC: lastRefractionData.left_eye?.visualAcuityVL_AC || '',
                glassType: ''
            }
        };

        DocumentPrinter.printDocument('certificatAcuite', patient, {
            printDataOverrides: {
                certificatAcuite: printData
            },
            printControlFlags: {
                includeVisualAcuityWithoutCorrection: true,
                includeVisualAcuityWithCorrection: !!(printData.rightEye.visualAcuityVL_AC || printData.leftEye.visualAcuityVL_AC),
                includeGlassType: false
            }
        });
    };

    return (
        <div className={cn(
            "flex-1 bg-slate-50/50 flex flex-col min-w-0 transition-opacity duration-300 border-r border-slate-200",
            showRefraction ? "opacity-100" : "opacity-0 hidden"
        )}>
            <div className="h-16 flex items-center px-6 border-b border-slate-200 bg-white shadow-sm shrink-0 justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-purple-600" />
                        Dernière Réfraction
                    </h2>
                    {lastRefractionData ? (
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full font-medium border border-slate-200 ml-2">
                            {format(new Date(lastRefractionData.date), 'dd MMM yyyy', { locale: fr })}
                        </span>
                    ) : (
                        <span className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full font-medium flex items-center gap-2 border border-amber-100">
                            Aucune donnée
                        </span>
                    )}
                </div>

                {lastRefractionData && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 h-8 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:text-purple-800"
                        onClick={handlePrintCertificate}
                    >
                        <Printer className="w-4 h-4" />
                        <span>Certificat</span>
                    </Button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {lastRefractionData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[600px]">
                        <div className="flex flex-col gap-2 h-full">
                            <EyeRefractionPanel
                                side="right"
                                readOnly
                                data={lastRefractionData.right_eye as any}
                            />
                        </div>
                        <div className="flex flex-col gap-2 h-full">
                            <EyeRefractionPanel
                                side="left"
                                readOnly
                                data={lastRefractionData.left_eye as any}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <Eye className="w-16 h-16 mb-4 opacity-20" />
                        <p>Aucune donnée de réfraction trouvée dans l'historique de ce patient.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
