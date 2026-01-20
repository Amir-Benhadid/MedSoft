import React from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import { PdfGenerationContext, drawTitle, drawDocumentHeader } from './utils/PdfUtils';
import { DocumentUtils } from './utils/DocumentUtils';
import { Label } from '@/ui/components/ui/label';
import { Card } from '@/ui/components/ui/card';
import { FileText, Info } from 'lucide-react';
import DebouncedTextField from './utils/DebouncedTextField';
import { useConsultationStore } from '@/ui/store/consultationStore';

// Types
export interface AbsenceCertificatePrintData {
    reason: string;
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD
    daysCount: string;
}

interface AbsenceCertificateDocumentProps {
    printData: AbsenceCertificatePrintData;
    setPrintData: React.Dispatch<React.SetStateAction<AbsenceCertificatePrintData>>;
}

// PDF Generation
export const generateAbsenceCertificatePDF = async (
    context: PdfGenerationContext,
    patient: { surname: string; name: string; dob: string },
    printData?: AbsenceCertificatePrintData
): Promise<Uint8Array> => {
    const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;

    let y = drawTitle(context, 'CERTIFICAT MÉDICAL', drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

    y -= LINE_HEIGHTS.normal * 4;

    const reason = printData?.reason || 'nécessite un repos médical';
    const startDate = printData?.startDate ? new Date(printData.startDate).toLocaleDateString('fr-FR') : '...';
    const endDate = printData?.endDate ? new Date(printData.endDate).toLocaleDateString('fr-FR') : '...';
    const days = printData?.daysCount || '...';

    const text = `Je soussigné, Docteur en médecine, certifie que l'état de santé de M/Mme ${patient.surname} ${patient.name} ${reason}.`;

    // Simple line wrapping for the main text
    const lines = DocumentUtils.splitTextIntoLines(text, 80);
    lines.forEach(line => {
        page.drawText(line, { x: LEFT_MARGIN, y, size: TEXT_SIZES.normal, font: helvetica });
        y -= LINE_HEIGHTS.normal * 1.5;
    });

    y -= LINE_HEIGHTS.normal;
    page.drawText(`Durée de l'arrêt : ${days} jours, du ${startDate} au ${endDate} inclus.`, {
        x: LEFT_MARGIN,
        y,
        size: TEXT_SIZES.normal,
        font: helveticaBold
    });

    y -= 50;
    page.drawText('Fait pour servir et valoir ce que de droit.', { x: LEFT_MARGIN, y, size: TEXT_SIZES.normal, font: helvetica });

    // Signature placeholder
    y -= 50;
    page.drawText('Signature:', { x: width - RIGHT_MARGIN - 100, y, size: TEXT_SIZES.normal, font: helvetica });

    return await context.pdfDoc.save();
};

const DEFAULT_ABSENCE_OVERRIDES = {
    reason: 'nécessite un repos médical',
    startDate: new Date().toISOString().split('T')[0],
    daysCount: '1',
    endDate: new Date().toISOString().split('T')[0]
};

const AbsenceCertificateDocument: React.FC = () => {
    const overrides = useConsultationStore(state => state.documentOverrides.absenceCertificate || DEFAULT_ABSENCE_OVERRIDES);

    const updateOverride = useConsultationStore(state => state.updateDocumentOverride);

    const handleFieldChange = (field: string, value: string) => {
        updateOverride('absenceCertificate', field, value);
    };

    // Date Logic Handlers
    const handleStartDateChange = (dateStr: string | undefined) => {
        if (!dateStr) return;
        updateOverride('absenceCertificate', 'startDate', dateStr);

        // Recalculate End Date if Days is present
        const days = parseInt(overrides.daysCount);
        if (!isNaN(days)) {
            const start = new Date(dateStr);
            const end = new Date(start);
            end.setDate(start.getDate() + days - 1);
            updateOverride('absenceCertificate', 'endDate', end.toISOString().split('T')[0]);
        }
    };

    const handleDaysChange = (daysStr: string) => {
        handleFieldChange('daysCount', daysStr);

        // Recalculate End Date if Start Date is present
        const days = parseInt(daysStr);
        if (!isNaN(days) && overrides.startDate) {
            const start = new Date(overrides.startDate);
            const end = new Date(start);
            end.setDate(start.getDate() + days - 1);
            updateOverride('absenceCertificate', 'endDate', end.toISOString().split('T')[0]);
        }
    };

    // Calculate Days when End Date changes (Reverse logic) - Optional but good UX
    const handleEndDateChange = (dateStr: string | undefined) => {
        if (!dateStr) return;
        updateOverride('absenceCertificate', 'endDate', dateStr);

        if (overrides.startDate) {
            const start = new Date(overrides.startDate);
            const end = new Date(dateStr);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            // Determine direction? Assume end > start usually.
            // If end < start, diffDays might be weird. 
            // Let's just set it if end >= start
            if (end >= start) {
                updateOverride('absenceCertificate', 'daysCount', diffDays.toString());
            }
        }
    };

    return (
        <Card className="max-w-3xl mx-auto shadow-sm border-slate-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                        <h4 className="font-semibold text-slate-800">Certificat Médical / Arrêt de Travail</h4>
                        <p className="text-xs text-muted-foreground">Configuration du certificat d'absence</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-4">
                    <div className="space-y-2">
                        <Label className="text-slate-700 font-medium">Motif du certificat</Label>
                        <DebouncedTextField
                            value={overrides.reason}
                            onChange={(val) => handleFieldChange('reason', val)}
                            placeholder="nécessite un repos médical"
                            fullWidth
                            className="bg-white"
                        />
                        <p className="text-xs text-muted-foreground">Ce motif sera affiché sur le document généré.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                        <div className="space-y-2">
                            <Label className="text-slate-700 font-medium">Date de début</Label>
                            <DebouncedTextField
                                type="date"
                                value={overrides.startDate}
                                onChange={handleStartDateChange}
                                fullWidth
                                className="bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-700 font-medium">Durée (jours)</Label>
                            <DebouncedTextField
                                type="number"
                                value={overrides.daysCount}
                                onChange={handleDaysChange}
                                fullWidth
                                className="bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-700 font-medium">Date de fin</Label>
                            <DebouncedTextField
                                type="date"
                                value={overrides.endDate}
                                onChange={handleEndDateChange}
                                fullWidth
                                className="bg-white"
                            />
                        </div>
                    </div>
                </div>


                <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-md text-xs border border-blue-100">
                    <Info className="w-4 h-4 shrink-0" />
                    <p>La date de fin est calculée automatiquement en fonction de la date de début et de la durée.</p>
                </div>
            </div>
        </Card>
    );
};

export default AbsenceCertificateDocument;
