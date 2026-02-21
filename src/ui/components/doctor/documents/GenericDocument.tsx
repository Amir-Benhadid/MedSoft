import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import { PdfGenerationContext, drawTitle, drawDocumentHeader } from './utils/PdfUtils';
import { DocumentUtils } from './utils/DocumentUtils';
import { OptimizedInput } from '@/ui/components/ui/optimized-input';
import { Label } from '@/ui/components/ui/label';
import { useConsultationStore } from '@/ui/store/consultationStore';
import { format } from 'date-fns';

import { Card } from '@/ui/components/ui/card';
import { FileText } from 'lucide-react';

export interface GenericRecordConfig {
    Title: string;
    Code: string;
    Description: string;
    Bullets: string[];
}

interface Placeholder {
    id: string; // unique key for state
    original: string; // full match {{...}}
    label: string; // extracted label
    type: 'text' | 'date' | 'number' | 'fill_age' | 'fill_antecedents';
    source?: {
        eye?: 'left' | 'right' | 'both';
        field?: string;
    };
}

const parsePlaceholders = (text: string, sectionPrefix: string): Placeholder[] => {
    const regex = /\{\{(.*?)\}\}/g;
    const matches = [...text.matchAll(regex)];
    return matches.map((match, index) => {
        const content = match[1].trim();
        const id = `${sectionPrefix}_${index}`;
        let type: Placeholder['type'] = 'text';
        let label = content;
        let source: { field?: string; eye?: 'left' | 'right' | 'both' } | undefined = undefined;

        if (content.startsWith('fill from EyeData:')) {
            const field = content.split(':')[1].trim();
            // Assume both eyes for now if generic
            source = { field, eye: 'both' }; // Logic to handle eye specific later
            label = field;
        } else if (content.startsWith('fill:')) {
            label = content.split(':')[1].trim();
        } else if (content === 'fill date') {
            type = 'date';
            label = 'Date';
        } else if (content === 'fill age') {
            type = 'fill_age';
        } else if (content === 'fill antecedents') {
            type = 'fill_antecedents';
        } else if (content.includes('fill number')) {
            type = 'number';
            label = 'Valeur';
        }

        return { id, original: match[0], label, type, source };
    });
};

export const generateGenericPDF = async (
    context: PdfGenerationContext,
    patient: { surname: string; name: string; dob: string },
    config: GenericRecordConfig,
    printData: Record<string, string>
): Promise<Uint8Array> => {
    const { page, width, helvetica, LEFT_MARGIN, RIGHT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;

    let y = drawTitle(context, config.Title.toUpperCase(), drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

    // Description
    if (config.Description) {
        let text = config.Description;
        // Replace placeholders
        Object.entries(printData).forEach(([key, value]) => {
            // We need to map key back to placeholder? 
            // Actually printData keys are 'desc_0', etc.
            // We need to reconstruct. 
            // Since we don't have the original placeholder mapping here easily without re-parsing,
            // we can rely on order OR re-parse.
            // Re-parsing is safer.
        });

        // Re-parse to substitute
        const placeholders = parsePlaceholders(config.Description, 'desc');
        placeholders.forEach(p => {
            text = text.replace(p.original, printData[p.id] || '');
        });

        DocumentUtils.splitTextIntoLinesOptimized(text, width - LEFT_MARGIN - RIGHT_MARGIN).forEach((line) => {
            page.drawText(line, { x: LEFT_MARGIN + 20, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            y -= LINE_HEIGHTS.normal;
        });
        y -= 10;
    }

    // Bullets
    if (config.Bullets && config.Bullets.length > 0) {
        config.Bullets.forEach((bullet, bIndex) => {
            let text = bullet;
            const placeholders = parsePlaceholders(bullet, `bullet_${bIndex}`);
            placeholders.forEach(p => {
                text = text.replace(p.original, printData[p.id] || '');
            });

            DocumentUtils.splitTextIntoLinesOptimized(text, width - LEFT_MARGIN - RIGHT_MARGIN - 20).forEach((line) => {
                page.drawText(`- ${line}`, { x: LEFT_MARGIN + 20, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
                y -= LINE_HEIGHTS.normal;
            });
        });
    }

    return await context.pdfDoc.save();
}

const DEFAULT_GENERIC_OVERRIDES: any = {};

const GenericDocument: React.FC<{ config: GenericRecordConfig }> = ({ config }) => {
    const leftEye = useConsultationStore(state => state.leftEye);
    const rightEye = useConsultationStore(state => state.rightEye);
    const clinicalExam = useConsultationStore(state => state.clinicalExam);
    const patient = useConsultationStore(state => state.patient);

    const allGenericOverrides = useConsultationStore(state => state.documentOverrides.generic || DEFAULT_GENERIC_OVERRIDES);
    const printData = allGenericOverrides[config.Code] || {};
    const updateOverride = useConsultationStore(state => state.updateDocumentOverride);

    const descriptionPlaceholders = useMemo(() => parsePlaceholders(config.Description, 'desc'), [config.Description]);
    const bulletsPlaceholders = useMemo(() => config.Bullets.flatMap((b, i) => parsePlaceholders(b, `bullet_${i}`)), [config.Bullets]);

    const allPlaceholders = [...descriptionPlaceholders, ...bulletsPlaceholders];

    const setField = (id: string, value: string) => {
        updateOverride('generic', config.Code, { ...printData, [id]: value });
    };

    // Helper to calculate defaults
    const getDefaultValue = useCallback((p: Placeholder): string => {
        if (p.type === 'fill_age' && patient?.dob) {
            return DocumentUtils.calculateAge(patient.dob).toString();
        } else if (p.type === 'fill_antecedents') {
            return [DocumentUtils.formatFieldDisplay(clinicalExam.generalMedicalHistory), DocumentUtils.formatFieldDisplay(clinicalExam.ophthalmologicalHistory)].filter(Boolean).join(', ');
        } else if (p.type === 'date') {
            return format(new Date(), 'dd/MM/yyyy');
        }
        return '';
    }, [patient?.dob, clinicalExam]);

    // Calculate defaults
    const defaultValues = useMemo(() => {
        const defaults: Record<string, string> = {};
        allPlaceholders.forEach(p => {
            const val = getDefaultValue(p);
            if (val) defaults[p.id] = val;
        });
        return defaults;
    }, [allPlaceholders, getDefaultValue]);

    // Derived state for effective values (for UI display)
    const effectiveValues = useMemo(() => {
        return { ...defaultValues, ...printData };
    }, [defaultValues, printData]);

    // Sync defaults to store only if they are missing
    // This ensures that the generated PDF (which reads from store) has access to these values
    useEffect(() => {
        const missingDefaults: Record<string, string> = {};
        let hasMissing = false;

        Object.entries(defaultValues).forEach(([key, value]) => {
            // Check if key is completely missing (undefined) in store
            if (printData[key] === undefined) {
                missingDefaults[key] = value;
                hasMissing = true;
            }
        });

        if (hasMissing) {
            updateOverride('generic', config.Code, { ...printData, ...missingDefaults });
        }
    }, [defaultValues, printData, config.Code, updateOverride]);

    return (
        <div className="space-y-4 font-sans text-sm pb-8">
            <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <div>
                        <h4 className="font-bold text-slate-800 text-sm">{config.Title}</h4>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{config.Code}</p>
                    </div>
                </div>

                <div className="bg-slate-50 p-3 rounded text-xs italic text-slate-600 border border-slate-200/60 leading-relaxed">
                    {config.Description}
                </div>

                <div className="space-y-4 pt-2">
                    {/* Render placeholders */}
                    {allPlaceholders.map(p => {
                        // Skip auto-filled fields from rendering inputs
                        if (p.type === 'fill_age' || p.type === 'fill_antecedents' || p.type === 'date') return null;

                        return (
                            <div key={p.id} className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                    {p.label || 'Champ'}
                                </Label>
                                <OptimizedInput
                                    value={printData[p.id] || ''}
                                    placeholder={defaultValues[p.id] || ''}
                                    onChange={(val) => setField(p.id, val)}
                                    className="h-8 font-bold text-slate-900 bg-white border-slate-200 focus:border-slate-400 focus:ring-slate-200"
                                />
                            </div>
                        );
                    })}

                    {/* Only show this if no interactive placeholders exist */}
                    {allPlaceholders.filter(p => !['fill_age', 'fill_antecedents', 'date'].includes(p.type)).length === 0 && (
                        <div className="flex flex-col items-center justify-center py-6 text-slate-400 border-2 border-dashed border-slate-100 rounded-lg bg-slate-50/50">
                            <p className="text-xs font-medium">Aucun champ manuel à remplir</p>
                            <p className="text-[10px] text-slate-400">Ce document est prêt à être imprimé</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GenericDocument;
