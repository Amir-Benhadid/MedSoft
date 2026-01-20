import React from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import { PdfGenerationContext, drawTitle, drawDocumentHeader } from './utils/PdfUtils';
import { DocumentUtils } from './utils/DocumentUtils';
import DebouncedTextField from './utils/DebouncedTextField'; // Updated import
import { Checkbox } from '@/ui/components/ui/checkbox';
import { Label } from '@/ui/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/ui/components/ui/radio-group';
import { useConsultationStore } from '@/ui/store/consultationStore';
import { Card } from '@/ui/components/ui/card';
import { Eye } from 'lucide-react';

// Types
interface EyeData {
    sph?: string;
    cyl?: string;
    axis?: string;
    add?: string;
    pd?: string;
    visualAcuityVL_AC?: string;
    glassType?: string;
}

interface PrintControlFlags {
    includeVisualAcuityWithCorrection: boolean;
    includeGlassType: boolean;
    includeFarVision: boolean;
    includeNearVision: boolean;
    includeRightEyeFar: boolean;
    includeLeftEyeFar: boolean;
    includeRightEyeNear: boolean;
    includeLeftEyeNear: boolean;
}

interface GlassesPrintData {
    rightEye: {
        sph: string;
        cyl: string;
        axis: string;
        add: string;
        glassType: string;
        // Near vision fields
        nearSph: string;
        nearCyl: string;
        nearAxis: string;
        // Empty eye option (for far vision)
        emptyEyeOption?: 'plan' | 'conserver';
        // Empty near vision option
        emptyNearEyeOption?: 'plan' | 'conserver';
    };
    leftEye: {
        sph: string;
        cyl: string;
        axis: string;
        add: string;
        glassType: string;
        // Near vision fields
        nearSph: string;
        nearCyl: string;
        nearAxis: string;
        // Empty eye option (for far vision)
        emptyEyeOption?: 'plan' | 'conserver';
        // Empty near vision option
        emptyNearEyeOption?: 'plan' | 'conserver';
    };
}

interface GlassesDocumentProps {
    printControlFlags: PrintControlFlags;
    setPrintControlFlags: React.Dispatch<React.SetStateAction<PrintControlFlags>>;
    printData: GlassesPrintData;
    setPrintData: React.Dispatch<React.SetStateAction<GlassesPrintData>>;
}

// PDF Generation Function (Keep as is, just importing it)
export const generateGlassesPDF = async (
    context: PdfGenerationContext,
    patient: { surname: string; name: string; dob: string },
    printData?: GlassesPrintData,
    printControlFlags?: Partial<PrintControlFlags>
): Promise<Uint8Array> => {
    const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;

    let y = drawTitle(context, 'VERRES CORRECTEURS', drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

    // Calculate equal column distribution across page width
    const usableWidth = width - LEFT_MARGIN - RIGHT_MARGIN;
    const columnWidth = usableWidth / 4;

    // Column positions
    const col2 = LEFT_MARGIN + columnWidth / 2; // Sphère
    const col3 = width / 2 - 'VERRES CORRECTEURS'.length * 3; // Cylindre (Approx centered)

    // Use print data directly - apply empty field formatting
    const rightSph = DocumentUtils.formatFieldDisplay(printData?.rightEye?.sph);
    const rightCyl = DocumentUtils.formatFieldDisplay(printData?.rightEye?.cyl);
    const rightAxisRaw = printData?.rightEye?.axis || '';
    const rightAxis = rightAxisRaw.trim() !== '' ? rightAxisRaw : '';

    const rightAdd = DocumentUtils.formatFieldDisplay(printData?.rightEye?.add);
    const rightGlassType = DocumentUtils.formatFieldDisplay(printData?.rightEye?.glassType);


    // Far vision section
    const leftSph = DocumentUtils.formatFieldDisplay(printData?.leftEye?.sph);
    const leftCyl = DocumentUtils.formatFieldDisplay(printData?.leftEye?.cyl);
    const leftAxisRaw = printData?.leftEye?.axis || '';
    const leftAxis = leftAxisRaw.trim() !== '' ? leftAxisRaw : '';
    const leftAdd = DocumentUtils.formatFieldDisplay(printData?.leftEye?.add);

    const shouldShowFarVision = printControlFlags?.includeFarVision !== false;

    const shouldShowRightEyeFar = printControlFlags?.includeRightEyeFar !== false;
    const shouldShowLeftEyeFar = printControlFlags?.includeLeftEyeFar !== false;
    const hasAnyFarVisionEye = shouldShowRightEyeFar || shouldShowLeftEyeFar;

    const shouldShowFarVisionTitle = shouldShowFarVision && hasAnyFarVisionEye;

    if (shouldShowFarVision && hasAnyFarVisionEye) {
        if (shouldShowFarVisionTitle) {
            page.drawText('Vision de Loin:', {
                x: col2,
                y,
                size: TEXT_SIZES.sectionHeader,
                font: helveticaBold,
                color: rgb(0, 0, 0),
            });
            y -= 1.5 * LINE_HEIGHTS.normal;
        }

        // Right Eye
        if (shouldShowRightEyeFar) {
            const rightHasData = !DocumentUtils.isEmptyField(rightSph) || !DocumentUtils.isEmptyField(rightCyl) || (rightAxisRaw && rightAxisRaw.trim() !== '');
            const rightEmptyOption = printData?.rightEye?.emptyEyeOption || 'plan';

            if (rightEmptyOption === 'conserver') {
                page.drawText("OD:", { x: col2, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
                page.drawText('Conserver ancienne lentille', { x: col3, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            } else if (rightHasData) {
                const rightCylText = !DocumentUtils.isEmptyField(rightCyl) ? `(${DocumentUtils.formatNumberWithSignOrEmpty(rightCyl)})` : '';
                const rightAxisText = rightAxis && rightAxis.trim() !== '' ? rightAxis + '°' : '';
                const rightAddText = !DocumentUtils.isEmptyField(rightAdd) ? `Add ${DocumentUtils.formatNumberWithSignOrEmpty(rightAdd)}` : '';
                const rightPrescription = [DocumentUtils.formatNumberWithSignOrEmpty(rightSph), rightCylText, rightAxisText, rightAddText]
                    .filter(part => part !== '').join(' ');

                page.drawText("OD:", { x: col2, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
                page.drawText(rightPrescription, { x: col3, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            } else {
                page.drawText("OD:", { x: col2, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
                page.drawText('Plan', { x: col3, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            }
            y -= LINE_HEIGHTS.normal;
        }

        // Left Eye
        if (shouldShowLeftEyeFar) {
            const leftHasData = !DocumentUtils.isEmptyField(leftSph) || !DocumentUtils.isEmptyField(leftCyl) || (leftAxisRaw && leftAxisRaw.trim() !== '');
            const leftEmptyOption = printData?.leftEye?.emptyEyeOption || 'plan';

            if (leftEmptyOption === 'conserver') {
                page.drawText("OG:", { x: col2, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
                page.drawText('Conserver ancienne lentille', { x: col3, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            } else if (leftHasData) {
                const leftCylText = !DocumentUtils.isEmptyField(leftCyl) ? `(${DocumentUtils.formatNumberWithSignOrEmpty(leftCyl)})` : '';
                const leftAxisText = leftAxis && leftAxis.trim() !== '' ? leftAxis + '°' : '';
                const leftAddText = !DocumentUtils.isEmptyField(leftAdd) ? `Add ${DocumentUtils.formatNumberWithSignOrEmpty(leftAdd)}` : '';
                const leftPrescription = [DocumentUtils.formatNumberWithSignOrEmpty(leftSph), leftCylText, leftAxisText, leftAddText]
                    .filter(part => part !== '').join(' ');

                page.drawText("OG:", { x: col2, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
                page.drawText(leftPrescription, { x: col3, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            } else {
                page.drawText("OG:", { x: col2, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
                page.drawText('Plan', { x: col3, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            }
            y -= LINE_HEIGHTS.normal;
            y -= 0.8 * LINE_HEIGHTS.normal;
        }
    }

    // Near vision section
    const shouldShowNearVision = printControlFlags?.includeNearVision === true;
    if (shouldShowNearVision) {
        page.drawText("Vision de Près:", { x: col2, y, size: TEXT_SIZES.sectionHeader, font: helveticaBold, color: rgb(0, 0, 0) });
        y -= 1.5 * LINE_HEIGHTS.normal;

        const rightNearSph = DocumentUtils.formatFieldDisplay(printData?.rightEye?.nearSph);
        const rightNearCyl = DocumentUtils.formatFieldDisplay(printData?.rightEye?.nearCyl);
        const rightNearAxis = DocumentUtils.formatFieldDisplay(printData?.rightEye?.nearAxis);
        const rightHasNear = !DocumentUtils.isEmptyField(rightNearSph) || !DocumentUtils.isEmptyField(rightNearCyl) || !DocumentUtils.isEmptyField(rightNearAxis);

        const rightNearEmptyOption = printData?.rightEye?.emptyNearEyeOption || 'plan';

        if (rightNearEmptyOption === 'conserver') {
            page.drawText("OD:", { x: col2, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            page.drawText('Conserver ancienne lentille', { x: col3, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
        } else if (rightHasNear) {
            const rightCylText = !DocumentUtils.isEmptyField(rightNearCyl) ? `(${DocumentUtils.formatNumberWithSignOrEmpty(rightNearCyl)})` : '';
            const rightAxisText = rightNearAxis && rightNearAxis.trim() !== '' ? rightNearAxis + '°' : '';
            const rightPrescription = [DocumentUtils.formatNumberWithSignOrEmpty(rightNearSph), rightCylText, rightAxisText]
                .filter(part => part !== '').join(' ');

            page.drawText("OD:", { x: col2, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            page.drawText(rightPrescription, { x: col3, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
        } else {
            page.drawText("OD:", { x: col2, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            page.drawText('Plan', { x: col3, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
        }
        y -= LINE_HEIGHTS.normal;

        const leftNearSph = DocumentUtils.formatFieldDisplay(printData?.leftEye?.nearSph);
        const leftNearCyl = DocumentUtils.formatFieldDisplay(printData?.leftEye?.nearCyl);
        const leftNearAxis = DocumentUtils.formatFieldDisplay(printData?.leftEye?.nearAxis);
        const leftHasNear = !DocumentUtils.isEmptyField(leftNearSph) || !DocumentUtils.isEmptyField(leftNearCyl) || !DocumentUtils.isEmptyField(leftNearAxis);
        const leftNearEmptyOption = printData?.leftEye?.emptyNearEyeOption || 'plan';

        if (leftNearEmptyOption === 'conserver') {
            page.drawText("OG:", { x: col2, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            page.drawText('Conserver ancienne lentille', { x: col3, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
        } else if (leftHasNear) {
            const leftCylText = !DocumentUtils.isEmptyField(leftNearCyl) ? `(${DocumentUtils.formatNumberWithSignOrEmpty(leftNearCyl)})` : '';
            const leftAxisText = leftNearAxis && leftNearAxis.trim() !== '' ? leftNearAxis + '°' : '';
            const leftPrescription = [DocumentUtils.formatNumberWithSignOrEmpty(leftNearSph), leftCylText, leftAxisText]
                .filter(part => part !== '').join(' ');

            page.drawText("OG:", { x: col2, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            page.drawText(leftPrescription, { x: col3, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
        } else {
            page.drawText("OG:", { x: col2, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
            page.drawText('Plan', { x: col3, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
        }
    }

    // Glass Type
    const leftGlassType = DocumentUtils.formatFieldDisplay(printData?.leftEye?.glassType);


    if (printControlFlags?.includeGlassType !== false &&
        (!DocumentUtils.isEmptyField(rightGlassType) || !DocumentUtils.isEmptyField(leftGlassType))) {
        y -= 10;
        page.drawText('Type de verre:', { x: col2, y, size: TEXT_SIZES.sectionHeader, font: helveticaBold, color: rgb(0, 0, 0) });
        const displayGlassType = rightGlassType || leftGlassType;
        page.drawText(displayGlassType, { x: col2 + 90, y, size: TEXT_SIZES.sectionHeader, font: helvetica, color: rgb(0, 0, 0) });
    }

    const pdfBytes = await context.pdfDoc.save();
    return pdfBytes;
};

const DEFAULT_GLASSES_OVERRIDES = {
    rightEye: {}, leftEye: {}, printControlFlags: {
        includeFarVision: true,
        includeNearVision: false,
        includeGlassType: true,
        includeRightEyeFar: true,
        includeLeftEyeFar: true,
        includeRightEyeNear: true,
        includeLeftEyeNear: true,
    }
};

// UI Component
const GlassesDocument: React.FC = () => {
    const rightEyeStore = useConsultationStore(state => state.rightEye);
    const leftEyeStore = useConsultationStore(state => state.leftEye);
    const overrides = useConsultationStore(state => state.documentOverrides.glasses || DEFAULT_GLASSES_OVERRIDES);

    const updateOverride = useConsultationStore(state => state.updateDocumentOverride);
    const setOverride = useConsultationStore(state => state.setDocumentOverride);

    // Helper to get value (override if present, else store value)
    const getValue = (eye: 'rightEye' | 'leftEye', field: string, defaultValue: any) => {
        return overrides[eye]?.[field] ?? defaultValue ?? '';
    };

    const handleFieldChange = (eye: 'rightEye' | 'leftEye', field: string, value: any) => {
        const currentEyeOverrides = overrides[eye] || {};
        updateOverride('glasses', eye, { ...currentEyeOverrides, [field]: value });

        // Sync glassType across both eyes as requested
        if (field === 'glassType') {
            const otherEye = eye === 'rightEye' ? 'leftEye' : 'rightEye';
            const otherEyeOverrides = overrides[otherEye] || {};
            // Only sync if the value is different to avoid infinite loops (though zustand handles this usually)
            // We need to use the store's setDocumentOverride to trigger another update
            // Since we are inside the component render cycle conceptually, we need to be careful. 
            // However, calling the action twice is fine.
            updateOverride('glasses', otherEye, { ...otherEyeOverrides, [field]: value });
        }
    };

    const handleFlagChange = (flag: string, value: boolean) => {
        const currentFlags = overrides.printControlFlags || {};
        updateOverride('glasses', 'printControlFlags', { ...currentFlags, [flag]: value });
    };

    // Derived Near Vision defaults
    const rightSph = getValue('rightEye', 'sph', rightEyeStore.sph);
    const rightAdd = getValue('rightEye', 'add', rightEyeStore.add);
    const calculatedRightNearSph = DocumentUtils.calculateNearSph(rightSph, rightAdd);

    const leftSph = getValue('leftEye', 'sph', leftEyeStore.sph);
    const leftAdd = getValue('leftEye', 'add', leftEyeStore.add);
    const calculatedLeftNearSph = DocumentUtils.calculateNearSph(leftSph, leftAdd);

    return (
        <div className="space-y-6 text-sm pb-8">
            {/* Options Header */}
            <Card className="border-none shadow-none bg-transparent">
                <div className="flex flex-wrap items-center gap-6 p-0">
                    <h4 className="font-semibold text-foreground mr-4">Options d'impression</h4>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="includeFarVision"
                            checked={overrides.printControlFlags?.includeFarVision !== false}
                            onCheckedChange={(c) => handleFlagChange('includeFarVision', c as boolean)}
                        />
                        <Label htmlFor="includeFarVision">Vision de Loin</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="includeNearVision"
                            checked={overrides.printControlFlags?.includeNearVision === true}
                            onCheckedChange={(c) => handleFlagChange('includeNearVision', c as boolean)}
                        />
                        <Label htmlFor="includeNearVision">Vision de Près</Label>
                    </div>
                </div>
            </Card>

            {/* Vision de Loin */}
            {overrides.printControlFlags?.includeFarVision !== false && (
                <Card className="bg-slate-50/50 border-slate-200 shadow-sm">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                            <Eye className="w-4 h-4 text-primary" />
                            Vision de Loin (VL)
                        </h4>
                        <div className="flex items-center gap-4 text-xs font-normal">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="includeGlassType"
                                    checked={overrides.printControlFlags?.includeGlassType !== false}
                                    onCheckedChange={(c) => handleFlagChange('includeGlassType', c as boolean)}
                                />
                                <Label htmlFor="includeGlassType">Afficher le type de verre</Label>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 space-y-6">
                        {/* Right Eye */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="includeRightEyeFar"
                                        checked={overrides.printControlFlags?.includeRightEyeFar !== false}
                                        onCheckedChange={(c) => handleFlagChange('includeRightEyeFar', c as boolean)}
                                    />
                                    <div className="flex flex-col">
                                        <Label htmlFor="includeRightEyeFar" className="font-bold text-slate-900">OD (Droit)</Label>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Oeil Droit</span>
                                    </div>
                                </div>
                                <RadioGroup
                                    className="flex gap-4"
                                    value={overrides.rightEye?.emptyEyeOption || 'plan'}
                                    onValueChange={(v) => handleFieldChange('rightEye', 'emptyEyeOption', v)}
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="plan" id="od-plan" />
                                        <Label htmlFor="od-plan">Plan</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="conserver" id="od-conserver" />
                                        <Label htmlFor="od-conserver">Conserver</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className="grid grid-cols-4 gap-4 p-3 bg-white rounded-md border border-slate-100 shadow-sm">
                                <DebouncedTextField
                                    label="Sphère"
                                    value={getValue('rightEye', 'sph', rightEyeStore.sph)}
                                    onChange={(v) => handleFieldChange('rightEye', 'sph', v)}
                                    size="small"
                                    className="font-mono"
                                />
                                <DebouncedTextField
                                    label="Cylindre"
                                    value={getValue('rightEye', 'cyl', rightEyeStore.cyl)}
                                    onChange={(v) => handleFieldChange('rightEye', 'cyl', v)}
                                    size="small"
                                    className="font-mono"
                                />
                                <DebouncedTextField
                                    label="Axe"
                                    value={getValue('rightEye', 'axis', rightEyeStore.axis)}
                                    onChange={(v) => handleFieldChange('rightEye', 'axis', v)}
                                    size="small"
                                    className="font-mono"
                                />
                                {overrides.printControlFlags?.includeGlassType !== false && (
                                    <DebouncedTextField
                                        label="Addition"
                                        value={getValue('rightEye', 'add', rightEyeStore.add)}
                                        onChange={(v) => handleFieldChange('rightEye', 'add', v)}
                                        size="small"
                                        className="font-mono"
                                    />
                                )}
                            </div>
                            {overrides.printControlFlags?.includeGlassType !== false && (
                                <DebouncedTextField
                                    label="Type de verre"
                                    value={getValue('rightEye', 'glassType', rightEyeStore.glassType)}
                                    onChange={(v) => handleFieldChange('rightEye', 'glassType', v)}
                                    fullWidth
                                    size="small"
                                    className="bg-white"
                                />
                            )}
                        </div>

                        {/* Left Eye */}
                        <div className="space-y-3 pt-4 border-t border-dashed border-slate-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="includeLeftEyeFar"
                                        checked={overrides.printControlFlags?.includeLeftEyeFar !== false}
                                        onCheckedChange={(c) => handleFlagChange('includeLeftEyeFar', c as boolean)}
                                    />
                                    <div className="flex flex-col">
                                        <Label htmlFor="includeLeftEyeFar" className="font-bold text-slate-900">OG (Gauche)</Label>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Oeil Gauche</span>
                                    </div>
                                </div>
                                <RadioGroup
                                    className="flex gap-4"
                                    value={overrides.leftEye?.emptyEyeOption || 'plan'}
                                    onValueChange={(v) => handleFieldChange('leftEye', 'emptyEyeOption', v)}
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="plan" id="og-plan" />
                                        <Label htmlFor="og-plan">Plan</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="conserver" id="og-conserver" />
                                        <Label htmlFor="og-conserver">Conserver</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className="grid grid-cols-4 gap-4 p-3 bg-white rounded-md border border-slate-100 shadow-sm">
                                <DebouncedTextField
                                    label="Sphère"
                                    value={getValue('leftEye', 'sph', leftEyeStore.sph)}
                                    onChange={(v) => handleFieldChange('leftEye', 'sph', v)}
                                    size="small"
                                    className="font-mono"
                                />
                                <DebouncedTextField
                                    label="Cylindre"
                                    value={getValue('leftEye', 'cyl', leftEyeStore.cyl)}
                                    onChange={(v) => handleFieldChange('leftEye', 'cyl', v)}
                                    size="small"
                                    className="font-mono"
                                />
                                <DebouncedTextField
                                    label="Axe"
                                    value={getValue('leftEye', 'axis', leftEyeStore.axis)}
                                    onChange={(v) => handleFieldChange('leftEye', 'axis', v)}
                                    size="small"
                                    className="font-mono"
                                />
                                {overrides.printControlFlags?.includeGlassType !== false && (
                                    <DebouncedTextField
                                        label="Addition"
                                        value={getValue('leftEye', 'add', leftEyeStore.add)}
                                        onChange={(v) => handleFieldChange('leftEye', 'add', v)}
                                        size="small"
                                        className="font-mono"
                                    />
                                )}
                            </div>
                            {overrides.printControlFlags?.includeGlassType !== false && (
                                <DebouncedTextField
                                    label="Type de verre"
                                    value={getValue('leftEye', 'glassType', leftEyeStore.glassType)}
                                    onChange={(v) => handleFieldChange('leftEye', 'glassType', v)}
                                    fullWidth
                                    size="small"
                                    className="bg-white"
                                />
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {/* Vision de Près */}
            {overrides.printControlFlags?.includeNearVision === true && (
                <Card className="bg-slate-50/50 border-slate-200 shadow-sm">
                    <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-primary" />
                        <h4 className="font-semibold text-slate-800">Vision de Près (VP)</h4>
                    </div>
                    <div className="p-4 space-y-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="includeRightEyeNear"
                                        checked={overrides.printControlFlags?.includeRightEyeNear !== false}
                                        onCheckedChange={(c) => handleFlagChange('includeRightEyeNear', c as boolean)}
                                    />
                                    <Label htmlFor="includeRightEyeNear" className="font-bold text-slate-900">OD (Droit)</Label>
                                </div>
                                <RadioGroup
                                    className="flex gap-4"
                                    value={overrides.rightEye?.emptyNearEyeOption || 'plan'}
                                    onValueChange={(v) => handleFieldChange('rightEye', 'emptyNearEyeOption', v)}
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="plan" id="od-plan-vp" />
                                        <Label htmlFor="od-plan-vp">Plan</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="conserver" id="od-conserver-vp" />
                                        <Label htmlFor="od-conserver-vp">Conserver</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className="grid grid-cols-3 gap-4 p-3 bg-white rounded-md border border-slate-100 shadow-sm">
                                <DebouncedTextField
                                    label="Sphère (VP)"
                                    value={getValue('rightEye', 'nearSph', calculatedRightNearSph)}
                                    onChange={(v) => handleFieldChange('rightEye', 'nearSph', v)}
                                    size="small"
                                />
                                <DebouncedTextField
                                    label="Cylindre (VP)"
                                    value={getValue('rightEye', 'nearCyl', getValue('rightEye', 'cyl', rightEyeStore.cyl))}
                                    onChange={(v) => handleFieldChange('rightEye', 'nearCyl', v)}
                                    size="small"
                                />
                                <DebouncedTextField
                                    label="Axe (VP)"
                                    value={getValue('rightEye', 'nearAxis', getValue('rightEye', 'axis', rightEyeStore.axis))}
                                    onChange={(v) => handleFieldChange('rightEye', 'nearAxis', v)}
                                    size="small"
                                />
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-dashed border-slate-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="includeLeftEyeNear"
                                        checked={overrides.printControlFlags?.includeLeftEyeNear !== false}
                                        onCheckedChange={(c) => handleFlagChange('includeLeftEyeNear', c as boolean)}
                                    />
                                    <Label htmlFor="includeLeftEyeNear" className="font-bold text-slate-900">OG (Gauche)</Label>
                                </div>
                                <RadioGroup
                                    className="flex gap-4"
                                    value={overrides.leftEye?.emptyNearEyeOption || 'plan'}
                                    onValueChange={(v) => handleFieldChange('leftEye', 'emptyNearEyeOption', v)}
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="plan" id="og-plan-vp" />
                                        <Label htmlFor="og-plan-vp">Plan</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="conserver" id="og-conserver-vp" />
                                        <Label htmlFor="og-conserver-vp">Conserver</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className="grid grid-cols-3 gap-4 p-3 bg-white rounded-md border border-slate-100 shadow-sm">
                                <DebouncedTextField
                                    label="Sphère (VP)"
                                    value={getValue('leftEye', 'nearSph', calculatedLeftNearSph)}
                                    onChange={(v) => handleFieldChange('leftEye', 'nearSph', v)}
                                    size="small"
                                />
                                <DebouncedTextField
                                    label="Cylindre (VP)"
                                    value={getValue('leftEye', 'nearCyl', getValue('leftEye', 'cyl', leftEyeStore.cyl))}
                                    onChange={(v) => handleFieldChange('leftEye', 'nearCyl', v)}
                                    size="small"
                                />
                                <DebouncedTextField
                                    label="Axe (VP)"
                                    value={getValue('leftEye', 'nearAxis', getValue('leftEye', 'axis', leftEyeStore.axis))}
                                    onChange={(v) => handleFieldChange('leftEye', 'nearAxis', v)}
                                    size="small"
                                />
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default GlassesDocument;
