import { Sheet, SheetContent } from "@/ui/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { orpcClient } from "@/ui/lib/orpc/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FileText, Calendar, Printer, X, Loader2 } from "lucide-react";
import { Button } from "@/ui/components/ui/button";
import { Separator } from "@/ui/components/ui/separator";
import { DocumentPrinter } from "../../doctor/documents/PrintingLogic";
import { useState } from "react";
import { toast } from "@/ui/hooks/use-toast";
import { useConfig } from "@/ui/contexts/ConfigContext";

interface SecretaryDocumentsSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patientId: string;
    patientName: string;
    patient?: any;
}

export function SecretaryDocumentsContent({ patientId, patientName, patient, onClose }: Omit<SecretaryDocumentsSheetProps, 'open' | 'onOpenChange'> & { onClose?: () => void }) {
    const { appMode } = useConfig();
    // Fetch consultations to list available documents
    const { data: consultations, isLoading } = useQuery({
        queryKey: ['consultations', 'patient', patientId],
        queryFn: async () => await orpcClient.consultations.listByPatient({ patientId }),
        enabled: !!patientId,
    });

    const [printingId, setPrintingId] = useState<string | null>(null);

    const handleReprint = async (consultation: any, docType: string) => {
        try {
            setPrintingId(`${consultation.id}-${docType}`);

            // Map legacy/display types to printer types
            let printerDocType = docType;
            if (docType === 'prescription') printerDocType = 'medications';
            else if (docType === 'lunettes') printerDocType = 'glasses';
            else if (docType === 'certificate') printerDocType = 'certificatAcuite';

            if (!patient) {
                toast({
                    title: "Erreur",
                    description: "Informations patient manquantes",
                    variant: "destructive"
                });
                return;
            }

            const overrides = consultation.documents_data || {};

            // Reconstruct print options from consultation data
            const printOptions = {
                leftEye: consultation.left_eye || {},
                rightEye: consultation.right_eye || {},
                prescriptions: consultation.prescription?.treatments || [],
                clinicalExam: consultation.clinical_exam || {},
                printControlFlags: overrides.printControlFlags || {},
                printDataOverrides: {
                    glasses: overrides.glasses,
                    contacts: overrides.contacts,
                    report: overrides.report,
                    workStop: overrides.workStop,
                    generic: overrides.generic,
                    visualAcuity: overrides.visualAcuity,
                    bilan: overrides.bilan,
                    absence: overrides.absence,
                    radiography: overrides['radiography_dynamic'],
                }
            };

            await DocumentPrinter.printDocument(printerDocType, patient, printOptions);

            toast({
                title: "Impression lancée",
                description: "Le document a été envoyé à l'imprimante (ou ouvert en PDF)",
            });

        } catch (error) {
            console.error("Erreur d'impression:", error);
            toast({
                title: "Erreur",
                description: "Impossible d'imprimer le document",
                variant: "destructive"
            });
        } finally {
            setPrintingId(null);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="px-6 py-4 border-b flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-slate-900">Documents Historiques</h2>
                    <p className="text-sm text-slate-500">
                        Historique des documents imprimés
                    </p>
                </div>
                {onClose && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {isLoading ? (
                    <div className="text-center text-slate-500 py-8 flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Chargement de l'historique...
                    </div>
                ) : !consultations || consultations.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">Aucune consultation trouvée.</div>
                ) : (
                    consultations
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((consultation) => {
                            const printedDocs = consultation.documents_data?.printed || [];
                            const hasDocs = printedDocs.length > 0;

                            if (!hasDocs) return null;

                            return (
                                <div key={consultation.id} className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <Calendar className="w-4 h-4 text-slate-500" />
                                        {format(new Date(consultation.date), 'dd MMMM yyyy', { locale: fr })}
                                        <span className="text-xs font-normal text-slate-500 ml-auto capitalize bg-slate-100 px-2 py-0.5 rounded-full">
                                            {consultation.type}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 pl-6">
                                        {printedDocs.map((doc: string) => {
                                            // Normalize doc name for display
                                            let display = doc;
                                            let iconColor = "text-slate-600";
                                            let normalizedType = doc;

                                            if (doc === 'medications' || doc === 'prescription') {
                                                display = 'Ordonnance';
                                                iconColor = "text-blue-600";
                                                normalizedType = 'medications';
                                            } else if (doc === 'glasses' || doc === 'lunettes') {
                                                display = 'Lunettes';
                                                iconColor = "text-teal-600";
                                                normalizedType = 'glasses';
                                            } else if (doc === 'certificatAcuite' || doc === 'certificate') {
                                                display = 'Certificat';
                                                iconColor = "text-purple-600";
                                                normalizedType = 'certificatAcuite';
                                            } else if (doc === 'workStop') {
                                                display = 'Arrêt de Travail';
                                                iconColor = "text-orange-600";
                                                normalizedType = 'workStop';
                                            }

                                            return (
                                                <div key={doc} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className={`w-4 h-4 ${iconColor}`} />
                                                        <span className="text-sm font-medium text-slate-700 capitalize">{display}</span>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => handleReprint(consultation, normalizedType)}
                                                        disabled={!!printingId}
                                                    >
                                                        {printingId === `${consultation.id}-${normalizedType}` ? (
                                                            <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                                                        ) : (
                                                            <Printer className="w-4 h-4 text-slate-500 hover:text-slate-800" />
                                                        )}
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <Separator className="mt-4 opacity-50" />
                                </div>
                            );
                        })
                )}

                {consultations && consultations.every(c => !c.documents_data?.printed?.length) && (
                    <div className="text-center text-slate-400 py-8 text-sm">
                        Aucun document imprimé dans l'historique de ce patient.
                    </div>
                )}
            </div>
        </div>
    );
}

export function SecretaryDocumentsSheet({ open, onOpenChange, patientId, patientName, patient }: SecretaryDocumentsSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md w-full p-0">
                <SecretaryDocumentsContent
                    patientId={patientId}
                    patientName={patientName}
                    patient={patient}
                    onClose={() => onOpenChange(false)}
                />
            </SheetContent>
        </Sheet>
    );
}
