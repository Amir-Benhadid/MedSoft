import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/ui/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { orpcClient } from "@/ui/lib/orpc/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FileText, Calendar, Printer, X } from "lucide-react";
import { Button } from "@/ui/components/ui/button";
import { Separator } from "@/ui/components/ui/separator";
import { useConfig } from "@/ui/contexts/ConfigContext";

interface SecretaryDocumentsSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patientId: string;
    patientName: string;
}

export function SecretaryDocumentsContent({ patientId, patientName, onClose }: Omit<SecretaryDocumentsSheetProps, 'open' | 'onOpenChange'> & { onClose?: () => void }) {
    const { appMode } = useConfig();
    // Fetch consultations to list available documents
    const { data: consultations, isLoading } = useQuery({
        queryKey: ['consultations', 'patient', patientId],
        queryFn: async () => await orpcClient.consultations.listByPatient({ patientId }),
        enabled: !!patientId,
    });

    const handlePrint = (consultationId: string, docType: string) => {
        // Placeholder for print logic
        // Ideally this would trigger the same print mechanism as the doctor's view
        // For now we'll just log or alert, as strict backend print implementation wasn't provided
        console.log(`Printing ${docType} for consultation ${consultationId}`);
        // We might need to open a window with the PDF url if we had one
    };

    return (
        <div className="h-full flex flex-col">
            <div className="px-6 py-4 border-b flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-slate-900">Documents Historiques</h2>
                    <p className="text-sm text-slate-500">
                        Documents générés pour {patientName}
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
                    <div className="text-center text-slate-500 py-8">Chargement de l'historique...</div>
                ) : !consultations || consultations.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">Aucune consultation trouvée.</div>
                ) : (
                    consultations
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((consultation) => (
                            <div key={consultation.id} className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                    <Calendar className="w-4 h-4 text-slate-500" />
                                    {format(new Date(consultation.date), 'dd MMMM yyyy', { locale: fr })}
                                    <span className="text-xs font-normal text-slate-500 ml-auto capitalize">
                                        {consultation.type}
                                    </span>
                                </div>


                                <div className="grid grid-cols-1 gap-2 pl-6">
                                    {(consultation.documents_data?.printed?.includes('prescription') || consultation.documents_data?.printed?.includes('ordonnance') || consultation.documents_data?.printed?.includes('Prescription')) && (
                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm font-medium text-slate-700">Ordonnance</span>
                                            </div>
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handlePrint(consultation.id, 'Prescription')}>
                                                <Printer className="w-4 h-4 text-slate-500" />
                                            </Button>
                                        </div>
                                    )}

                                    {(consultation.documents_data?.printed?.includes('glasses') || consultation.documents_data?.printed?.includes('lunettes') || consultation.documents_data?.printed?.includes('Lunettes')) && (
                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-4 h-4 text-teal-600" />
                                                <span className="text-sm font-medium text-slate-700">Lunettes</span>
                                            </div>
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handlePrint(consultation.id, 'Lunettes')}>
                                                <Printer className="w-4 h-4 text-slate-500" />
                                            </Button>
                                        </div>
                                    )}

                                    {(consultation.documents_data?.printed?.includes('certificate') || consultation.documents_data?.printed?.includes('certificat') || consultation.documents_data?.printed?.includes('Certificat')) && (
                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-4 h-4 text-purple-600" />
                                                <span className="text-sm font-medium text-slate-700">Certificat</span>
                                            </div>
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handlePrint(consultation.id, 'Certificat')}>
                                                <Printer className="w-4 h-4 text-slate-500" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                <Separator className="mt-4" />
                            </div>
                        ))
                )}
            </div>
        </div>
    );
}

export function SecretaryDocumentsSheet({ open, onOpenChange, patientId, patientName }: SecretaryDocumentsSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md w-full p-0">
                <SecretaryDocumentsContent patientId={patientId} patientName={patientName} />
            </SheetContent>
        </Sheet>
    );
}
