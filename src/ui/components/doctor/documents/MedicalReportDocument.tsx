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
    const generalHistory = DocumentUtils.formatFieldDisplay(reportData?.generalMedicalHistory);
    const ophthalmologicalHistory = DocumentUtils.formatFieldDisplay(reportData?.ophthalmologicalHistory);

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
        <div className="space-y-6 font-sans text-sm pb-8">
            {/* Options Card */}
            <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                <div className="flex flex-wrap gap-6 items-center">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-tight mr-2">Options d'impression</h4>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="avsc"
                            checked={overrides.includeVisualAcuityWithoutCorrection !== false}
                            onCheckedChange={(c) => handleFlagChange('includeVisualAcuityWithoutCorrection')(c as boolean)}
                            className="data-[state=checked]:bg-slate-800 data-[state=checked]:border-slate-800 border-slate-300"
                        />
                        <Label htmlFor="avsc" className="text-[11px] font-bold text-slate-600 uppercase tracking-tight cursor-pointer hover:text-slate-900 transition-colors">Sans Correction</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="avac"
                            checked={overrides.includeVisualAcuityWithCorrection !== false}
                            onCheckedChange={(c) => handleFlagChange('includeVisualAcuityWithCorrection')(c as boolean)}
                            className="data-[state=checked]:bg-slate-800 data-[state=checked]:border-slate-800 border-slate-300"
                        />
                        <Label htmlFor="avac" className="text-[11px] font-bold text-slate-600 uppercase tracking-tight cursor-pointer hover:text-slate-900 transition-colors">Avec Correction</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="tono"
                            checked={overrides.includeTonometry !== false}
                            onCheckedChange={(c) => handleFlagChange('includeTonometry')(c as boolean)}
                            className="data-[state=checked]:bg-slate-800 data-[state=checked]:border-slate-800 border-slate-300"
                        />
                        <Label htmlFor="tono" className="text-[11px] font-bold text-slate-600 uppercase tracking-tight cursor-pointer hover:text-slate-900 transition-colors">Tonométrie</Label>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Antécédents & Inspection */}
                <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm space-y-4 h-full flex flex-col">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
                        <FileText className="w-3.5 h-3.5 text-indigo-500" />
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-tight">
                            Antécédents & Inspection
                        </h4>
                    </div>

                    <div className="space-y-3 flex-grow">
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-indigo-600/80 uppercase tracking-tight">Antécédents généraux</Label>
                            <OptimizedInput
                                value={DocumentUtils.formatFieldDisplay(getValue('generalMedicalHistory', clinicalExam?.generalMedicalHistory))}
                                onChange={(val) => handleDataChange('generalMedicalHistory')(val)}
                                className="h-8 font-bold text-slate-900 bg-slate-50 border-slate-200 focus:border-indigo-400 focus:ring-indigo-200"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-indigo-600/80 uppercase tracking-tight">Antécédents ophtalmologiques</Label>
                            <OptimizedInput
                                value={DocumentUtils.formatFieldDisplay(getValue('ophthalmologicalHistory', clinicalExam?.ophthalmologicalHistory))}
                                onChange={(val) => handleDataChange('ophthalmologicalHistory')(val)}
                                className="h-8 font-bold text-slate-900 bg-slate-50 border-slate-200 focus:border-indigo-400 focus:ring-indigo-200"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-indigo-600/80 uppercase tracking-tight">Inspection</Label>
                            <OptimizedInput
                                value={getValue('inspection', clinicalExam?.inspection)}
                                onChange={(val) => handleDataChange('inspection')(val)}
                                className="h-8 font-bold text-slate-900 bg-slate-50 border-slate-200 focus:border-indigo-400 focus:ring-indigo-200"
                            />
                        </div>
                    </div>
                </div>

                {/* Mesures (Conditional) */}
                {(overrides.includeVisualAcuityWithoutCorrection !== false || overrides.includeVisualAcuityWithCorrection !== false || overrides.includeTonometry !== false) && (
                    <div className="bg-blue-50/20 rounded-lg p-4 border border-blue-100/60 shadow-sm space-y-4 h-full flex flex-col">
                        <div className="flex items-center gap-2 border-b border-blue-100 pb-2 mb-2">
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                            <h4 className="text-xs font-bold text-blue-700 uppercase tracking-tight">
                                Mesures
                            </h4>
                        </div>

                        <div className="space-y-4 flex-grow">
                            {overrides.includeVisualAcuityWithoutCorrection !== false && (
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-blue-600/80 uppercase tracking-tight">AV Sans Correction</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">OD</span>
                                            <OptimizedInput
                                                value={getValue('visualAcuityVL_SC_OD', rightEye?.visualAcuityVL_SC)}
                                                onChange={(val) => handleDataChange('visualAcuityVL_SC_OD')(val)}
                                                className="pl-8 h-8 font-bold text-slate-900 bg-white border-blue-200 focus:border-blue-400"
                                            />
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">OG</span>
                                            <OptimizedInput
                                                value={getValue('visualAcuityVL_SC_OG', leftEye?.visualAcuityVL_SC)}
                                                onChange={(val) => handleDataChange('visualAcuityVL_SC_OG')(val)}
                                                className="pl-8 h-8 font-bold text-slate-900 bg-white border-blue-200 focus:border-blue-400"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {overrides.includeVisualAcuityWithCorrection !== false && (
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-blue-600/80 uppercase tracking-tight">AV Avec Correction</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">OD</span>
                                            <OptimizedInput
                                                value={getValue('visualAcuityVL_AC_OD', rightEye?.visualAcuityVL_AC)}
                                                onChange={(val) => handleDataChange('visualAcuityVL_AC_OD')(val)}
                                                className="pl-8 h-8 font-bold text-slate-900 bg-white border-blue-200 focus:border-blue-400"
                                            />
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">OG</span>
                                            <OptimizedInput
                                                value={getValue('visualAcuityVL_AC_OG', leftEye?.visualAcuityVL_AC)}
                                                onChange={(val) => handleDataChange('visualAcuityVL_AC_OG')(val)}
                                                className="pl-8 h-8 font-bold text-slate-900 bg-white border-blue-200 focus:border-blue-400"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {overrides.includeTonometry !== false && (
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-blue-600/80 uppercase tracking-tight">Tonométrie</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">OD</span>
                                            <OptimizedInput
                                                value={getValue('tonometryOD', getCorrectedIOP(rightEye))}
                                                onChange={(val) => handleDataChange('tonometryOD')(val)}
                                                suffix="mmHg"
                                                className="pl-8 h-8 font-bold text-slate-900 bg-white border-blue-200 focus:border-blue-400"
                                            />
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">OG</span>
                                            <OptimizedInput
                                                value={getValue('tonometryOG', getCorrectedIOP(leftEye))}
                                                onChange={(val) => handleDataChange('tonometryOG')(val)}
                                                suffix="mmHg"
                                                className="pl-8 h-8 font-bold text-slate-900 bg-white border-blue-200 focus:border-blue-400"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Examen Clinique */}
            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Activity className="w-3.5 h-3.5 text-orange-500" />
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-tight">
                        Examen Clinique
                    </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-orange-600/80 uppercase tracking-tight">Segment antérieur</Label>
                        <OptimizedInput
                            value={getValue('segmentAnterieur', clinicalExam?.anteriorSegment?.slit_lamp_exam)}
                            onChange={(val) => handleDataChange('segmentAnterieur')(val)}
                            className="h-8 font-bold text-slate-900 bg-slate-50 border-slate-200 focus:border-orange-400 focus:ring-orange-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-orange-600/80 uppercase tracking-tight">Fond d'œil</Label>
                        <OptimizedInput
                            value={getValue('fondOeil', clinicalExam?.fundus?.fundus_exam)}
                            onChange={(val) => handleDataChange('fondOeil')(val)}
                            className="h-8 font-bold text-slate-900 bg-slate-50 border-slate-200 focus:border-orange-400 focus:ring-orange-200"
                        />
                    </div>
                </div>
            </div>

            {/* Conclusion & Personnalisation */}
            <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-tight">
                        Conclusion & Personnalisation
                    </h4>
                </div>
                <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Conclusion</Label>
                        <Textarea
                            value={getValue('conclusion', clinicalExam?.diagnosis)}
                            onChange={(e) => handleDataChange('conclusion')(e.target.value)}
                            rows={3}
                            className="bg-white text-sm font-medium border-slate-200 focus:border-slate-400 focus:ring-slate-200 resize-none shadow-sm"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200/60 border-dashed">
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Titre personnalisé</Label>
                            <OptimizedInput
                                value={getValue('customTitle', '')}
                                onChange={(val) => handleDataChange('customTitle')(val)}
                                className="h-8 font-bold text-slate-900 bg-white border-slate-200 focus:border-slate-400"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Description personnalisée</Label>
                            <OptimizedInput
                                value={getValue('customText', '')}
                                onChange={(val) => handleDataChange('customText')(val)}
                                className="h-8 font-bold text-slate-900 bg-white border-slate-200 focus:border-slate-400"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicalReportDocument;
