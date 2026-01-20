import React, { useState, useRef, useCallback } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import { PdfGenerationContext, drawTitle, drawDocumentHeader } from './utils/PdfUtils';
import { DocumentUtils } from './utils/DocumentUtils';
import { OptimizedInput } from '@/ui/components/ui/optimized-input';
import { Checkbox } from '@/ui/components/ui/checkbox';
import { Label } from '@/ui/components/ui/label';
import { Textarea } from '@/ui/components/ui/textarea'; // Standard shadcn textarea
import { useConsultationStore } from '@/ui/store/consultationStore';
import { ReportData, ReportPrintControlFlags } from './types';
import { Card } from '@/ui/components/ui/card';
import { Eye, FileText, Activity } from 'lucide-react';


// PDF Generation Constants
const TEXT_SIZES = {
    title: 9,
    header: 11,
    sectionHeader: 9,
    normal: 10,
    small: 8,
    tiny: 7,
};
const LINE_HEIGHTS = {
    title: 20,
    sectionHeader: 16,
    normal: 14,
    small: 12,
    header: 18,
    tiny: 10,
};

// PDF Generation Function
export const generateReportPDF = async (
    context: PdfGenerationContext,
    patient: { surname: string; name: string; dob: string },
    reportData?: ReportData,
    printControlFlags?: ReportPrintControlFlags
): Promise<Uint8Array> => {
    const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN } = context;

    // Override sizes for this document
    const originalTextSizes = { ...context.TEXT_SIZES };
    context.TEXT_SIZES = { ...originalTextSizes, ...TEXT_SIZES };

    let y = drawTitle(context, 'COMPTE-RENDU', drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

    // Antécédents
    const generalHistory = reportData?.generalMedicalHistory;
    const ophthalmologicalHistory = reportData?.ophthalmologicalHistory;

    // Main statement
    const patientAge = DocumentUtils.calculateAge(patient.dob);
    const ageText = patientAge === 1 ? '1 an' : `${patientAge} ans`;
    const mainStatementText = `Le(a) patient(e) sus-nommé(e) âgé(e) de ${ageText} présente à l'examen du jour:`;

    const availableWidth = width - LEFT_MARGIN - RIGHT_MARGIN - 20;

    DocumentUtils.splitTextIntoLinesOptimized(mainStatementText, width - LEFT_MARGIN - RIGHT_MARGIN + 20).forEach((line) => {
        page.drawText(line, { x: LEFT_MARGIN, y, size: TEXT_SIZES.sectionHeader, font: helvetica, color: rgb(0, 0, 0) });
        y -= LINE_HEIGHTS.normal;
    });

    // Antécédents section
    if (generalHistory || ophthalmologicalHistory) {
        const antecedentsText = generalHistory && ophthalmologicalHistory
            ? `${generalHistory}, ${ophthalmologicalHistory}`
            : generalHistory || ophthalmologicalHistory || '';

        if (antecedentsText) {
            const lineText = `Antécédents : ${antecedentsText}`;
            DocumentUtils.splitTextIntoLinesOptimized(lineText, availableWidth).forEach((line) => {
                page.drawText(line, { x: LEFT_MARGIN, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
                y -= LINE_HEIGHTS.normal;
            });
        }
    }

    // Inspection
    const inspectionValue = DocumentUtils.formatFieldDisplay(reportData?.inspection);
    if (!DocumentUtils.isEmptyField(inspectionValue)) {
        const inspection = `Inspection : ${inspectionValue}`;
        DocumentUtils.splitTextIntoLinesOptimized(inspection, availableWidth).forEach((line) => {
            page.drawText(line, { x: LEFT_MARGIN, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            y -= LINE_HEIGHTS.normal;
        });
    }

    // Acuité visuelle sans correction
    if (printControlFlags?.includeVisualAcuityWithoutCorrection) {
        const avscOD = DocumentUtils.formatFieldDisplay(reportData?.printVisualAcuityVL_SC_OD || reportData?.visualAcuityVL_SC_OD);
        const avscOG = DocumentUtils.formatFieldDisplay(reportData?.printVisualAcuityVL_SC_OG || reportData?.visualAcuityVL_SC_OG);

        if (!DocumentUtils.isEmptyField(avscOD) || !DocumentUtils.isEmptyField(avscOG)) {
            page.drawText('Acuité visuelle sans correction :', { x: LEFT_MARGIN, y, size: TEXT_SIZES.sectionHeader, font: helveticaBold, color: rgb(0, 0, 0) });
            y -= LINE_HEIGHTS.normal;

            const usableWidth = width - LEFT_MARGIN - RIGHT_MARGIN - 200;
            const columnSpacing = 150;
            let currentX = LEFT_MARGIN + 50;

            if (!DocumentUtils.isEmptyField(avscOD)) {
                page.drawText(`OD: ${avscOD}`, { x: currentX, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
                currentX += columnSpacing;
            }
            if (!DocumentUtils.isEmptyField(avscOG)) {
                page.drawText(`OG: ${avscOG}`, { x: currentX, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            }
            y -= LINE_HEIGHTS.normal;
        }
    }

    // Acuité visuelle avec correction
    if (printControlFlags?.includeVisualAcuityWithCorrection) {
        const avacOD = DocumentUtils.formatFieldDisplay(reportData?.printVisualAcuityVL_AC_OD || reportData?.visualAcuityVL_AC_OD);
        const avacOG = DocumentUtils.formatFieldDisplay(reportData?.printVisualAcuityVL_AC_OG || reportData?.visualAcuityVL_AC_OG);

        if (!DocumentUtils.isEmptyField(avacOD) || !DocumentUtils.isEmptyField(avacOG)) {
            page.drawText('Acuité visuelle avec correction :', { x: LEFT_MARGIN, y, size: TEXT_SIZES.sectionHeader, font: helveticaBold, color: rgb(0, 0, 0) });
            y -= LINE_HEIGHTS.normal;

            const columnSpacing = 150;
            let currentX = LEFT_MARGIN + 50;

            if (!DocumentUtils.isEmptyField(avacOD)) {
                page.drawText(`OD: ${avacOD}`, { x: currentX, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
                currentX += columnSpacing;
            }
            if (!DocumentUtils.isEmptyField(avacOG)) {
                page.drawText(`OG: ${avacOG}`, { x: currentX, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            }
            y -= LINE_HEIGHTS.normal;
        }
    }

    // Custom text
    const customTitleValue = DocumentUtils.formatFieldDisplay(reportData?.customTitle);
    const customTextValue = DocumentUtils.formatFieldDisplay(reportData?.customText);
    if (customTitleValue || customTextValue) {
        let lineText = '';
        if (customTitleValue && customTextValue) lineText = `${customTitleValue} : ${customTextValue}`;
        else if (customTitleValue) lineText = customTitleValue;
        else if (customTextValue) lineText = customTextValue;

        DocumentUtils.splitTextIntoLinesOptimized(lineText, availableWidth).forEach((line) => {
            page.drawText(line, { x: LEFT_MARGIN, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            y -= LINE_HEIGHTS.normal;
        });
    }

    // Tonometry
    if (printControlFlags?.includeTonometry) {
        const iod = DocumentUtils.formatFieldDisplay(reportData?.tonometryOD);
        const iog = DocumentUtils.formatFieldDisplay(reportData?.tonometryOG);
        if (!DocumentUtils.isEmptyField(iod) || !DocumentUtils.isEmptyField(iog)) {
            page.drawText('Tonométrie :', { x: LEFT_MARGIN, y, size: TEXT_SIZES.sectionHeader, font: helvetica, color: rgb(0, 0, 0) });
            y -= LINE_HEIGHTS.normal;

            const columnSpacing = 150;
            let currentX = LEFT_MARGIN;

            if (!DocumentUtils.isEmptyField(iod)) {
                page.drawText(`OD: ${iod} mmHg`, { x: currentX, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
                currentX += columnSpacing;
            }
            if (!DocumentUtils.isEmptyField(iog)) {
                page.drawText(`OG: ${iog} mmHg`, { x: currentX, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            }
            y -= LINE_HEIGHTS.normal;
        }
    }

    // Segment antérieur
    const segmentAnterieurValue = DocumentUtils.formatFieldDisplay(reportData?.segmentAnterieur);
    if (!DocumentUtils.isEmptyField(segmentAnterieurValue)) {
        const segmentAnterieur = `Ségment antérieur : ${segmentAnterieurValue}`;
        DocumentUtils.splitTextIntoLinesOptimized(segmentAnterieur, availableWidth).forEach((line) => {
            page.drawText(line, { x: LEFT_MARGIN, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            y -= LINE_HEIGHTS.normal;
        });
    }

    // FO
    const fondOeilValue = DocumentUtils.formatFieldDisplay(reportData?.fondOeil);
    if (!DocumentUtils.isEmptyField(fondOeilValue)) {
        const fondOeil = `F.O : ${fondOeilValue}`;
        DocumentUtils.splitTextIntoLinesOptimized(fondOeil, availableWidth).forEach((line) => {
            page.drawText(line, { x: LEFT_MARGIN, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            y -= LINE_HEIGHTS.normal;
        });
    }

    // Conclusion
    const conclusionValue = DocumentUtils.formatFieldDisplay(reportData?.conclusion);
    if (!DocumentUtils.isEmptyField(conclusionValue)) {
        const conclusion = `Conclusion : ${conclusionValue}`;
        DocumentUtils.splitTextIntoLinesOptimized(conclusion, availableWidth).forEach((line) => {
            page.drawText(line, { x: LEFT_MARGIN, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            y -= LINE_HEIGHTS.normal;
        });
    }

    // Restore context
    context.TEXT_SIZES = originalTextSizes;
    return await context.pdfDoc.save();
}

const DEFAULT_REPORT_OVERRIDES = {
    includeVisualAcuityWithoutCorrection: true,
    includeVisualAcuityWithCorrection: true,
    includeTonometry: true,
};

const MedicalReportDocument: React.FC = () => {
    const leftEye = useConsultationStore(state => state.leftEye);
    const rightEye = useConsultationStore(state => state.rightEye);
    const clinicalExam = useConsultationStore(state => state.clinicalExam);

    const overrides = useConsultationStore(state => state.documentOverrides.report || DEFAULT_REPORT_OVERRIDES);

    const updateOverride = useConsultationStore(state => state.updateDocumentOverride);

    const getCorrectedIOP = (eye: any) => {
        if (eye?.corrected_iop) return eye.corrected_iop;
        if (eye?.tension && eye?.pachymetry) {
            const pioNum = parseFloat(eye.tension);
            const pachyNum = parseFloat(eye.pachymetry);
            if (!isNaN(pioNum) && !isNaN(pachyNum)) {
                return (pioNum - (pachyNum - 545) / 50 * 2.5).toFixed(1);
            }
        }
        return eye?.tension || '';
    };

    const getValue = (field: keyof ReportData, defaultValue: any) => {
        return overrides[field] ?? defaultValue ?? '';
    };

    const handleDataChange = (field: keyof ReportData) => (value: string) => {
        updateOverride('report', field, value);
    };

    const handleFlagChange = (flag: keyof ReportPrintControlFlags) => (checked: boolean) => {
        updateOverride('report', flag, checked);
    }

    return (
        <div className="space-y-6 text-sm pb-8">
            <Card className="border-none shadow-none bg-transparent">
                <div className="flex flex-wrap gap-6 items-center p-0">
                    <h4 className="font-semibold text-foreground mr-4">Options</h4>
                    <div className="flex items-center gap-2">
                        <Checkbox id="avsc" checked={overrides.includeVisualAcuityWithoutCorrection !== false}
                            onCheckedChange={(c) => handleFlagChange('includeVisualAcuityWithoutCorrection')(c as boolean)} />
                        <Label htmlFor="avsc">Sans Correction</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id="avac" checked={overrides.includeVisualAcuityWithCorrection !== false}
                            onCheckedChange={(c) => handleFlagChange('includeVisualAcuityWithCorrection')(c as boolean)} />
                        <Label htmlFor="avac">Avec Correction</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id="tono" checked={overrides.includeTonometry !== false}
                            onCheckedChange={(c) => handleFlagChange('includeTonometry')(c as boolean)} />
                        <Label htmlFor="tono">Tonométrie</Label>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-4 space-y-4 bg-slate-50/50 border-slate-200">
                    <h4 className="font-semibold text-slate-800 flex items-center gap-2 text-sm border-b pb-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Antécédents & Inspection
                    </h4>
                    <div className="space-y-4 pt-2">
                        <OptimizedInput label="Antécédents généraux" value={getValue('generalMedicalHistory', clinicalExam?.generalMedicalHistory)} onChange={handleDataChange('generalMedicalHistory')} className="bg-white" />
                        <OptimizedInput label="Antécédents ophtalmologiques" value={getValue('ophthalmologicalHistory', clinicalExam?.ophthalmologicalHistory)} onChange={handleDataChange('ophthalmologicalHistory')} className="bg-white" />
                        <OptimizedInput label="Inspection" value={getValue('inspection', clinicalExam?.inspection)} onChange={handleDataChange('inspection')} className="bg-white" />
                    </div>
                </Card>

                {(overrides.includeVisualAcuityWithoutCorrection !== false || overrides.includeVisualAcuityWithCorrection !== false || overrides.includeTonometry !== false) && (
                    <Card className="p-4 space-y-4 bg-blue-50/30 border-blue-100">
                        <h4 className="font-semibold text-blue-800 flex items-center gap-2 text-sm border-b pb-2 border-blue-100">
                            <Eye className="w-4 h-4 text-blue-600" />
                            Mesures
                        </h4>
                        <div className="space-y-4 pt-2">
                            {overrides.includeVisualAcuityWithoutCorrection !== false && (
                                <div className="space-y-2">
                                    <span className="text-xs font-medium text-blue-700">AV Sans Correction</span>
                                    <div className="grid grid-cols-2 gap-3">
                                        <OptimizedInput placeholder="OD" value={getValue('visualAcuityVL_SC_OD', rightEye?.visualAcuityVL_SC)} onChange={handleDataChange('visualAcuityVL_SC_OD')} className="bg-white" />
                                        <OptimizedInput placeholder="OG" value={getValue('visualAcuityVL_SC_OG', leftEye?.visualAcuityVL_SC)} onChange={handleDataChange('visualAcuityVL_SC_OG')} className="bg-white" />
                                    </div>
                                </div>
                            )}
                            {overrides.includeVisualAcuityWithCorrection !== false && (
                                <div className="space-y-2">
                                    <span className="text-xs font-medium text-blue-700">AV Avec Correction</span>
                                    <div className="grid grid-cols-2 gap-3">
                                        <OptimizedInput placeholder="OD" value={getValue('visualAcuityVL_AC_OD', rightEye?.visualAcuityVL_AC)} onChange={handleDataChange('visualAcuityVL_AC_OD')} className="bg-white" />
                                        <OptimizedInput placeholder="OG" value={getValue('visualAcuityVL_AC_OG', leftEye?.visualAcuityVL_AC)} onChange={handleDataChange('visualAcuityVL_AC_OG')} className="bg-white" />
                                    </div>
                                </div>
                            )}
                            {overrides.includeTonometry !== false && (
                                <div className="space-y-2">
                                    <span className="text-xs font-medium text-blue-700">Tonométrie</span>
                                    <div className="grid grid-cols-2 gap-3">
                                        <OptimizedInput label="OD" value={getValue('tonometryOD', getCorrectedIOP(rightEye))} onChange={handleDataChange('tonometryOD')} suffix="mmHg" className="bg-white" />
                                        <OptimizedInput label="OG" value={getValue('tonometryOG', getCorrectedIOP(leftEye))} onChange={handleDataChange('tonometryOG')} suffix="mmHg" className="bg-white" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                )}
            </div>

            <Card className="p-4 space-y-4 bg-white border-slate-200 shadow-sm">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2 text-sm border-b pb-2">
                    <Activity className="w-4 h-4 text-orange-500" />
                    Examen Clinique
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <OptimizedInput label="Segment antérieur" value={getValue('segmentAnterieur', clinicalExam?.anteriorSegment?.slit_lamp_exam)} onChange={handleDataChange('segmentAnterieur')} className="bg-slate-50" />
                    <OptimizedInput label="Fond d'œil" value={getValue('fondOeil', clinicalExam?.fundus?.fundus_exam)} onChange={handleDataChange('fondOeil')} className="bg-slate-50" />
                </div>
            </Card>

            <Card className="p-4 space-y-4 bg-slate-50/80 border-slate-200">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2 text-sm border-b pb-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    Conclusion & Personnalisation
                </h4>
                <div className="space-y-4 pt-2">
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Conclusion</Label>
                        <Textarea value={getValue('conclusion', clinicalExam?.diagnosis)} onChange={(e) => handleDataChange('conclusion')(e.target.value)} rows={3} className="bg-white text-sm" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-dashed">
                        <OptimizedInput label="Titre personnalisé" value={getValue('customTitle', '')} onChange={handleDataChange('customTitle')} className="bg-white" />
                        <OptimizedInput label="Description personnalisée" value={getValue('customText', '')} onChange={handleDataChange('customText')} className="bg-white" />
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default MedicalReportDocument;
