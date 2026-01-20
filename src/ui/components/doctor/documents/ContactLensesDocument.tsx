import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PDFDocument, rgb } from 'pdf-lib';
import { PdfGenerationContext, drawTitle, drawDocumentHeader } from './utils/PdfUtils';
import { DocumentUtils } from './utils/DocumentUtils';
import DebouncedTextField from './utils/DebouncedTextField';
import { Checkbox } from '@/ui/components/ui/checkbox';
import { Label } from '@/ui/components/ui/label';
import { useConsultationStore } from '@/ui/store/consultationStore';
import { lentilleService } from '@/ui/services/LentilleService';
import { toast } from '@/ui/hooks/use-toast';
import { Card } from '@/ui/components/ui/card';
import { Eye } from 'lucide-react';



// Types
export interface ContactLensesPrintData {
    rightEye: {
        sph: string;
        cyl: string;
        axis: string;
        diam: string;
        axis_k: string;
        contactLensType: string;
        lensBrand: string;
    };
    leftEye: {
        sph: string;
        cyl: string;
        axis: string;
        diam: string;
        axis_k: string;
        contactLensType: string;
        lensBrand: string;
    };
}

export interface ContactLensesPrintControlFlags {
    includeRightEye: boolean;
    includeLeftEye: boolean;
}


// PDF Generation Constants
const LEFT_MARGIN = 50;
const RIGHT_MARGIN = 50;
const TEXT_SIZES = {
    title: 16,
    sectionHeader: 12,
    normal: 10,
    small: 8,
};
const LINE_HEIGHTS = {
    title: 20,
    sectionHeader: 16,
    normal: 14,
    small: 12,
};

// PDF Generation Function
export const generateContactLensesPDF = async (
    context: PdfGenerationContext,
    patient: { surname: string; name: string; dob: string },
    printData?: ContactLensesPrintData,
    printControlFlags?: ContactLensesPrintControlFlags
): Promise<Uint8Array> => {
    const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;

    let y = drawTitle(context, 'LENTILLES DE CONTACT', drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

    const rightSph = printData?.rightEye?.sph || '';
    const rightCyl = printData?.rightEye?.cyl || '';
    const rightAxis = printData?.rightEye?.axis || '';
    const rightDiam = printData?.rightEye?.diam || '';
    const rightAxisK = printData?.rightEye?.axis_k || '';
    const rightContactLensType = printData?.rightEye?.contactLensType || '';
    const rightLensBrand = printData?.rightEye?.lensBrand || '';

    const leftSph = printData?.leftEye?.sph || '';
    const leftCyl = printData?.leftEye?.cyl || '';
    const leftAxis = printData?.leftEye?.axis || '';
    const leftDiam = printData?.leftEye?.diam || '';
    const leftAxisK = printData?.leftEye?.axis_k || '';
    const leftContactLensType = printData?.leftEye?.contactLensType || '';
    const leftLensBrand = printData?.leftEye?.lensBrand || '';

    // Determine lens types
    const rightIsSpherical = rightContactLensType === 'Sphérique';
    const leftIsSpherical = leftContactLensType === 'Sphérique';

    // Use values directly from printData
    const hasRightEyeData = rightSph || rightCyl || rightAxis;
    const hasLeftEyeData = leftSph || leftCyl || leftAxis;

    // Calculate equal column distribution across page width
    const usableWidth = width - LEFT_MARGIN - RIGHT_MARGIN;
    const maxColumnCount = Math.max(
        rightIsSpherical ? 3 : 5,
        leftIsSpherical ? 3 : 5
    );
    const columnWidth = usableWidth / (maxColumnCount + 1);

    // Column positions
    const col2 = LEFT_MARGIN + columnWidth / 2;
    const col3 = width / 2 - "LENTILLES DE CONTACT".length * 3;

    const shouldShowRightEye = printControlFlags?.includeRightEye !== false;
    const shouldShowLeftEye = printControlFlags?.includeLeftEye !== false;

    if ((shouldShowRightEye && hasRightEyeData) || (shouldShowLeftEye && hasLeftEyeData)) {

        // Right Eye
        if (shouldShowRightEye && hasRightEyeData) {
            let rightPrescription: string;
            if (rightIsSpherical) {
                rightPrescription = `P: ${rightSph}`;
            } else {
                const rightCylText = rightCyl ? `(${rightCyl})` : '';
                const rightAxisText = rightAxis ? `${rightAxis}°` : '';
                rightPrescription = `P: ${rightSph} ${rightCylText} ${rightAxisText}`.trim();
            }

            page.drawText("OD:", { x: col2, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            page.drawText(rightPrescription, { x: col3, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            y -= LINE_HEIGHTS.normal;

            if (rightAxisK) {
                page.drawText(`R: ${rightAxisK} mm`, { x: col3, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
                y -= LINE_HEIGHTS.normal;
            }

            if (rightDiam) {
                page.drawText(`D: ${rightDiam} mm`, { x: col3, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
                y -= LINE_HEIGHTS.normal;
            }
            y -= LINE_HEIGHTS.normal;
        }

        // Left Eye
        if (shouldShowLeftEye && hasLeftEyeData) {
            y -= 10;
            let leftPrescription: string;
            if (leftIsSpherical) {
                leftPrescription = `P: ${leftSph}`;
            } else {
                const leftCylText = leftCyl ? `(${leftCyl})` : '';
                const leftAxisText = leftAxis ? `${leftAxis}°` : '';
                leftPrescription = `P: ${leftSph} ${leftCylText} ${leftAxisText}`.trim();
            }

            page.drawText("OG:", { x: col2, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            page.drawText(leftPrescription, { x: col3, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            y -= LINE_HEIGHTS.normal;

            if (leftAxisK) {
                page.drawText(`R: ${leftAxisK} mm`, { x: col3, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
                y -= LINE_HEIGHTS.normal;
            }

            if (leftDiam) {
                page.drawText(`D: ${leftDiam} mm`, { x: col3, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
                y -= LINE_HEIGHTS.normal;
            }
            y -= LINE_HEIGHTS.normal;
        }
    }

    // Additional information section
    if ((shouldShowRightEye && (rightContactLensType || rightLensBrand)) || (shouldShowLeftEye && (leftContactLensType || leftLensBrand))) {
        y -= 15;
        page.drawText('Type de lentilles:', { x: LEFT_MARGIN, y, size: TEXT_SIZES.sectionHeader, font: helveticaBold, color: rgb(0, 0, 0) });
        y -= LINE_HEIGHTS.normal;

        if (shouldShowRightEye && rightContactLensType) {
            page.drawText(`OD: ${rightContactLensType}`, { x: LEFT_MARGIN + 20, y, size: TEXT_SIZES.small, font: helvetica, color: rgb(0, 0, 0) });
            y -= LINE_HEIGHTS.small;
        }

        if (shouldShowLeftEye && leftContactLensType) {
            page.drawText(`OG: ${leftContactLensType}`, { x: LEFT_MARGIN + 20, y, size: TEXT_SIZES.small, font: helvetica, color: rgb(0, 0, 0) });
            y -= LINE_HEIGHTS.small;
        }

        if ((shouldShowRightEye && rightLensBrand) || (shouldShowLeftEye && leftLensBrand)) {
            y -= 5;
            page.drawText('Marque:', { x: LEFT_MARGIN, y, size: TEXT_SIZES.sectionHeader, font: helveticaBold, color: rgb(0, 0, 0) });
            y -= LINE_HEIGHTS.normal;

            if (shouldShowRightEye && rightLensBrand) {
                page.drawText(`OD: ${rightLensBrand}`, { x: LEFT_MARGIN + 20, y, size: TEXT_SIZES.small, font: helvetica, color: rgb(0, 0, 0) });
                y -= LINE_HEIGHTS.small;
            }

            if (shouldShowLeftEye && leftLensBrand) {
                page.drawText(`OG: ${leftLensBrand}`, { x: LEFT_MARGIN + 20, y, size: TEXT_SIZES.small, font: helvetica, color: rgb(0, 0, 0) });
                y -= LINE_HEIGHTS.small;
            }
        }
    }

    const pdfBytes = await context.pdfDoc.save();
    return pdfBytes;
};

const DEFAULT_CONTACTS_OVERRIDES = {
    rightEye: {}, leftEye: {},
    includeRightEye: true,
    includeLeftEye: true
};

// UI Component
const ContactLensesDocument: React.FC = () => {
    const rightEyeStore = useConsultationStore(state => state.rightEye);
    const leftEyeStore = useConsultationStore(state => state.leftEye);

    const overrides = useConsultationStore(state => state.documentOverrides.contactLenses || DEFAULT_CONTACTS_OVERRIDES);

    const updateOverride = useConsultationStore(state => state.updateDocumentOverride);

    const formatNumberWithSign = (value: number): string => {
        const formatted = value.toFixed(2);
        return value > 0 ? `+${formatted}` : formatted;
    };

    // Conversion Query
    const { data: converted = { rightEye: { sph: '', cyl: '', axis: '' }, leftEye: { sph: '', cyl: '', axis: '' } } } = useQuery({
        queryKey: ['contactLensConversion',
            rightEyeStore.sph, rightEyeStore.cyl, rightEyeStore.axis, rightEyeStore.contactLensType,
            leftEyeStore.sph, leftEyeStore.cyl, leftEyeStore.axis, leftEyeStore.contactLensType
        ],
        queryFn: async () => {
            const newConverted = {
                rightEye: { sph: '', cyl: '', axis: '' },
                leftEye: { sph: '', cyl: '', axis: '' }
            };

            // Right Eye
            if (rightEyeStore.sph || rightEyeStore.cyl || rightEyeStore.axis) {
                try {
                    const res = await lentilleService.convertToContactLens(
                        parseFloat(rightEyeStore.sph || '0'),
                        parseFloat(rightEyeStore.cyl || '0'),
                        parseFloat(rightEyeStore.axis || '0'),
                        rightEyeStore.contactLensType
                    );
                    const isSph = rightEyeStore.contactLensType === 'Sphérique';
                    newConverted.rightEye = {
                        sph: formatNumberWithSign(res.sphere),
                        cyl: isSph ? '' : formatNumberWithSign(res.cylinder),
                        axis: isSph ? '' : res.axis.toString()
                    };
                } catch (e) { console.error(e); }
            }

            // Left Eye
            if (leftEyeStore.sph || leftEyeStore.cyl || leftEyeStore.axis) {
                try {
                    const res = await lentilleService.convertToContactLens(
                        parseFloat(leftEyeStore.sph || '0'),
                        parseFloat(leftEyeStore.cyl || '0'),
                        parseFloat(leftEyeStore.axis || '0'),
                        leftEyeStore.contactLensType
                    );
                    const isSph = leftEyeStore.contactLensType === 'Sphérique';
                    newConverted.leftEye = {
                        sph: formatNumberWithSign(res.sphere),
                        cyl: isSph ? '' : formatNumberWithSign(res.cylinder),
                        axis: isSph ? '' : res.axis.toString()
                    };
                } catch (e) { console.error(e); }
            }

            return newConverted;
        },
        staleTime: 1000 * 60 * 5, // 5 min cache
    });

    const getValue = (eye: 'rightEye' | 'leftEye', field: string, defaultValue: any) => {
        return overrides[eye]?.[field] ?? defaultValue ?? '';
    };

    const handleFieldChange = (eye: 'rightEye' | 'leftEye', field: string, value: any) => {
        const currentEyeOverrides = overrides[eye] || {};
        updateOverride('contactLenses', eye, { ...currentEyeOverrides, [field]: value });
    };

    const handleFlagChange = (flag: string, value: boolean) => {
        updateOverride('contactLenses', flag, value);
    };

    const rightIsSpherical = (getValue('rightEye', 'contactLensType', rightEyeStore.contactLensType) || '') === 'Sphérique';
    const leftIsSpherical = (getValue('leftEye', 'contactLensType', leftEyeStore.contactLensType) || '') === 'Sphérique';

    return (
        <div className="space-y-6 text-sm pb-8">
            <Card className="border-none shadow-none bg-transparent">
                <div className="flex items-center gap-2 px-2">
                    <Eye className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold text-lg text-foreground">Lentilles de Contact</h4>
                </div>
            </Card>

            {/* Right Eye */}
            <Card className="bg-slate-50/50 border-slate-200 shadow-sm">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="includeRightEye"
                            checked={overrides.includeRightEye !== false}
                            onCheckedChange={(c) => handleFlagChange('includeRightEye', c as boolean)}
                        />
                        <div className="flex flex-col">
                            <Label htmlFor="includeRightEye" className="font-bold text-slate-900">OD (Droit)</Label>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Oeil Droit</span>
                        </div>
                    </div>
                </div>
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-4 gap-4 p-3 bg-white rounded-md border border-slate-100 shadow-sm">
                        <DebouncedTextField
                            label="Sphère"
                            value={getValue('rightEye', 'sph', converted.rightEye.sph)}
                            onChange={(v) => handleFieldChange('rightEye', 'sph', v)}
                            size="small"
                        />
                        {!rightIsSpherical && (
                            <>
                                <DebouncedTextField
                                    label="Cylindre"
                                    value={getValue('rightEye', 'cyl', converted.rightEye.cyl)}
                                    onChange={(v) => handleFieldChange('rightEye', 'cyl', v)}
                                    size="small"
                                />
                                <DebouncedTextField
                                    label="Axe"
                                    value={getValue('rightEye', 'axis', converted.rightEye.axis)}
                                    onChange={(v) => handleFieldChange('rightEye', 'axis', v)}
                                    size="small"
                                />
                            </>
                        )}
                        <div className={rightIsSpherical ? "col-span-3 grid grid-cols-2 gap-4" : "col-span-1"}>
                            <DebouncedTextField
                                label="Diamètre"
                                value={getValue('rightEye', 'diam', rightEyeStore.diam)}
                                onChange={(v) => handleFieldChange('rightEye', 'diam', v)}
                                size="small"
                            />
                            {rightIsSpherical && (
                                <DebouncedTextField
                                    label="Rayon (K)"
                                    value={getValue('rightEye', 'axis_k', rightEyeStore.axis_k)}
                                    onChange={(v) => handleFieldChange('rightEye', 'axis_k', v)}
                                    size="small"
                                />
                            )}
                        </div>
                    </div>
                    {!rightIsSpherical && (
                        <div className="grid grid-cols-4 gap-4 px-3">
                            <DebouncedTextField
                                label="Rayon (K)"
                                value={getValue('rightEye', 'axis_k', rightEyeStore.axis_k)}
                                onChange={(v) => handleFieldChange('rightEye', 'axis_k', v)}
                                size="small"
                            />
                        </div>
                    )}
                </div>
            </Card>

            {/* Left Eye */}
            <Card className="bg-slate-50/50 border-slate-200 shadow-sm">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="includeLeftEye"
                            checked={overrides.includeLeftEye !== false}
                            onCheckedChange={(c) => handleFlagChange('includeLeftEye', c as boolean)}
                        />
                        <div className="flex flex-col">
                            <Label htmlFor="includeLeftEye" className="font-bold text-slate-900">OG (Gauche)</Label>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Oeil Gauche</span>
                        </div>
                    </div>
                </div>
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-4 gap-4 p-3 bg-white rounded-md border border-slate-100 shadow-sm">
                        <DebouncedTextField
                            label="Sphère"
                            value={getValue('leftEye', 'sph', converted.leftEye.sph)}
                            onChange={(v) => handleFieldChange('leftEye', 'sph', v)}
                            size="small"
                        />
                        {!leftIsSpherical && (
                            <>
                                <DebouncedTextField
                                    label="Cylindre"
                                    value={getValue('leftEye', 'cyl', converted.leftEye.cyl)}
                                    onChange={(v) => handleFieldChange('leftEye', 'cyl', v)}
                                    size="small"
                                />
                                <DebouncedTextField
                                    label="Axe"
                                    value={getValue('leftEye', 'axis', converted.leftEye.axis)}
                                    onChange={(v) => handleFieldChange('leftEye', 'axis', v)}
                                    size="small"
                                />
                            </>
                        )}
                        <div className={leftIsSpherical ? "col-span-3 grid grid-cols-2 gap-4" : "col-span-1"}>
                            <DebouncedTextField
                                label="Diamètre"
                                value={getValue('leftEye', 'diam', leftEyeStore.diam)}
                                onChange={(v) => handleFieldChange('leftEye', 'diam', v)}
                                size="small"
                            />
                            {leftIsSpherical && (
                                <DebouncedTextField
                                    label="Rayon (K)"
                                    value={getValue('leftEye', 'axis_k', leftEyeStore.axis_k)}
                                    onChange={(v) => handleFieldChange('leftEye', 'axis_k', v)}
                                    size="small"
                                />
                            )}
                        </div>
                    </div>
                    {!leftIsSpherical && (
                        <div className="grid grid-cols-4 gap-4 px-3">
                            <DebouncedTextField
                                label="Rayon (K)"
                                value={getValue('leftEye', 'axis_k', leftEyeStore.axis_k)}
                                onChange={(v) => handleFieldChange('leftEye', 'axis_k', v)}
                                size="small"
                            />
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ContactLensesDocument;
