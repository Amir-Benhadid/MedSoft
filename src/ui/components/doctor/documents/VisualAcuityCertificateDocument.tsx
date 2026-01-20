import React from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import { PdfGenerationContext, drawTitle, drawDocumentHeader } from './utils/PdfUtils';
import { DocumentUtils } from './utils/DocumentUtils';
import { Checkbox } from '@/ui/components/ui/checkbox';
import { Label } from '@/ui/components/ui/label';
import { useConsultationStore } from '@/ui/store/consultationStore';
import DebouncedTextField from './utils/DebouncedTextField';
import { Card } from '@/ui/components/ui/card';
import { Eye } from 'lucide-react';

// Types
interface VisualAcuityCertificatePrintData {
    rightEye: {
        raw: string;
        correction: string;
    };
    leftEye: {
        raw: string;
        correction: string;
    };
}

export interface VisualAcuityCertificatePrintControlFlags {
    includeRaw: boolean;
    includeCorrection: boolean;
}


// PDF Generation
export const generateVisualAcuityCertificatePDF = async (
    context: PdfGenerationContext,
    patient: { surname: string; name: string; dob: string },
    printData?: VisualAcuityCertificatePrintData,
    printControlFlags?: VisualAcuityCertificatePrintControlFlags
): Promise<Uint8Array> => {
    const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;

    let y = drawTitle(context, 'CERTIFICAT D\'ACUITÉ VISUELLE', drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

    y -= LINE_HEIGHTS.normal * 2;
    page.drawText('Je soussigné, certifie que l\'examen de la vue de ce jour a révélé:', {
        x: LEFT_MARGIN,
        y,
        size: TEXT_SIZES.normal,
        font: helvetica,
        color: rgb(0, 0, 0),
    });
    y -= LINE_HEIGHTS.normal * 2;

    const colWidth = (width - LEFT_MARGIN - RIGHT_MARGIN) / 2;
    const col2 = LEFT_MARGIN + colWidth;

    if (printControlFlags?.includeRaw) {
        page.drawText('Sans Correction:', { x: LEFT_MARGIN, y, size: TEXT_SIZES.sectionHeader, font: helveticaBold });
        y -= LINE_HEIGHTS.normal;

        const od = printData?.rightEye?.raw || '';
        const og = printData?.leftEye?.raw || '';

        page.drawText(`OD: ${od}`, { x: LEFT_MARGIN + 20, y, size: TEXT_SIZES.normal, font: helvetica });
        page.drawText(`OG: ${og}`, { x: col2, y, size: TEXT_SIZES.normal, font: helvetica });
        y -= LINE_HEIGHTS.normal * 2;
    }

    if (printControlFlags?.includeCorrection) {
        page.drawText('Avec Correction:', { x: LEFT_MARGIN, y, size: TEXT_SIZES.sectionHeader, font: helveticaBold });
        y -= LINE_HEIGHTS.normal;

        const od = printData?.rightEye?.correction || '';
        const og = printData?.leftEye?.correction || '';

        page.drawText(`OD: ${od}`, { x: LEFT_MARGIN + 20, y, size: TEXT_SIZES.normal, font: helvetica });
        page.drawText(`OG: ${og}`, { x: col2, y, size: TEXT_SIZES.normal, font: helvetica });
        y -= LINE_HEIGHTS.normal * 2;
    }

    // Signature placeholder
    y -= 50;
    page.drawText('Signature:', { x: width - RIGHT_MARGIN - 100, y, size: TEXT_SIZES.normal, font: helvetica });

    return await context.pdfDoc.save();
};

const DEFAULT_VISUAL_ACUITY_OVERRIDES = {
    rightEye: {}, leftEye: {},
    includeRaw: true,
    includeCorrection: true
};

const VisualAcuityCertificateDocument: React.FC = () => {
    const rightEyeStore = useConsultationStore(state => state.rightEye);
    const leftEyeStore = useConsultationStore(state => state.leftEye);

    const overrides = useConsultationStore(state => state.documentOverrides.visualAcuityCertificate || DEFAULT_VISUAL_ACUITY_OVERRIDES);

    const updateOverride = useConsultationStore(state => state.updateDocumentOverride);

    const getValue = (eye: 'rightEye' | 'leftEye', field: string, defaultValue: any) => {
        return overrides[eye]?.[field] ?? defaultValue ?? '';
    };

    const handleFieldChange = (eye: 'rightEye' | 'leftEye', field: string, value: string) => {
        const currentEyeOverrides = overrides[eye] || {};
        updateOverride('visualAcuityCertificate', eye, { ...currentEyeOverrides, [field]: value });
    };

    const handleFlagChange = (flag: string, value: boolean) => {
        updateOverride('visualAcuityCertificate', flag, value);
    };

    return (
        <div className="space-y-6 text-sm pb-8">
            <Card className="border-none shadow-none bg-transparent">
                <div className="flex items-center gap-6 p-0">
                    <h4 className="font-semibold text-foreground mr-4">Options</h4>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="includeRaw"
                            checked={overrides.includeRaw !== false}
                            onCheckedChange={(c) => handleFlagChange('includeRaw', c as boolean)}
                        />
                        <Label htmlFor="includeRaw">Sans Correction</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="includeCorrection"
                            checked={overrides.includeCorrection !== false}
                            onCheckedChange={(c) => handleFlagChange('includeCorrection', c as boolean)}
                        />
                        <Label htmlFor="includeCorrection">Avec Correction</Label>
                    </div>
                </div>
            </Card>

            {overrides.includeRaw !== false && (
                <Card className="bg-slate-50/50 border-slate-200 shadow-sm">
                    <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-slate-600" />
                        <h4 className="font-semibold text-slate-800">Sans Correction</h4>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="flex flex-col">
                                <Label className="font-bold text-slate-900">OD (Droit)</Label>
                            </div>
                            <DebouncedTextField
                                value={getValue('rightEye', 'raw', rightEyeStore.visualAcuityVL_SC)}
                                onChange={(v) => handleFieldChange('rightEye', 'raw', v)}
                                size="small"
                                fullWidth
                                className="bg-white"
                                placeholder="ex: 10/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex flex-col">
                                <Label className="font-bold text-slate-900">OG (Gauche)</Label>
                            </div>
                            <DebouncedTextField
                                value={getValue('leftEye', 'raw', leftEyeStore.visualAcuityVL_SC)}
                                onChange={(v) => handleFieldChange('leftEye', 'raw', v)}
                                size="small"
                                fullWidth
                                className="bg-white"
                                placeholder="ex: 10/10"
                            />
                        </div>
                    </div>
                </Card>
            )}

            {overrides.includeCorrection !== false && (
                <Card className="bg-blue-50/30 border-blue-100 shadow-sm">
                    <div className="p-4 border-b border-blue-100 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-blue-600" />
                        <h4 className="font-semibold text-blue-800">Avec Correction</h4>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="flex flex-col">
                                <Label className="font-bold text-blue-900">OD (Droit)</Label>
                            </div>
                            <DebouncedTextField
                                value={getValue('rightEye', 'correction', rightEyeStore.visualAcuityVL_AC)}
                                onChange={(v) => handleFieldChange('rightEye', 'correction', v)}
                                size="small"
                                fullWidth
                                className="bg-white"
                                placeholder="ex: 10/10 p2"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex flex-col">
                                <Label className="font-bold text-blue-900">OG (Gauche)</Label>
                            </div>
                            <DebouncedTextField
                                value={getValue('leftEye', 'correction', leftEyeStore.visualAcuityVL_AC)}
                                onChange={(v) => handleFieldChange('leftEye', 'correction', v)}
                                size="small"
                                fullWidth
                                className="bg-white"
                                placeholder="ex: 10/10 p2"
                            />
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default VisualAcuityCertificateDocument;
