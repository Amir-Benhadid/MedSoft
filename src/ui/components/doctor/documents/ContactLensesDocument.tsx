import React, { memo } from 'react';
import { cn } from "@/ui/lib/utils";
import { Input } from '@/ui/components/ui/input';
import { Label } from '@/ui/components/ui/label';
import { Checkbox } from '@/ui/components/ui/checkbox';
import { Card } from '@/ui/components/ui/card';
import { PDFDocument, PDFPage, rgb } from 'pdf-lib';
import { PdfGenerationContext, drawTitle, drawDocumentHeader } from './PdfUtils';
import { DocumentUtils } from './DocumentUtils';
import { lentilleService } from '../../../services/LentilleService';
import { useDocumentForm } from './hooks/useDocumentForm';

// Types
interface EyeData {
	sph?: string;
	cyl?: string;
	axis?: string;
	contactLensType?: string;
	lensType?: string;
	lensBrand?: string;
	k1?: string;
	k2?: string;
	diam?: string;
	axis_k?: string;
}

interface ContactLensesPrintData {
	// Support both legacy flat and current nested structures
	sph?: string;
	cyl?: string;
	axis?: string;
	diam?: string;
	axis_k?: string;
	contactLensType?: string;
	lensType?: string;
	lensBrand?: string;
	objSph?: string;
	objCyl?: string;
	objAxis?: string;
	rightEye: {
		sph: string;
		cyl: string;
		axis: string;
		diam: string;
		axis_k: string;
		contactLensType: string;
		lensType: string;
		lensBrand: string;
	};
	leftEye: {
		sph: string;
		cyl: string;
		axis: string;
		diam: string;
		axis_k: string;
		contactLensType: string;
		lensType: string;
		lensBrand: string;
	};
}


interface ContactLensesPrintControlFlags {
	includeRightEye: boolean;
	includeLeftEye: boolean;
}

interface ContactLensesDocumentProps { }

// PDF Generation Constants
const LEFT_MARGIN = 50;
const RIGHT_MARGIN = 50;
const TEXT_SIZES = {
	title: 11,
	sectionHeader: 10,
	normal: 10,
	small: 10,
};
const LINE_HEIGHTS = {
	title: 20,
	sectionHeader: 16,
	normal: 14,
	small: 12,
};
const SECTION_GAP = 18; // Same as Glasses PDF - OD-to-section, section-to-values, between sections


// PDF Generation Function
export const generateContactLensesPDF = async (
	context: PdfGenerationContext,
	patient: { surname: string; name: string; dob: string },
	printData?: ContactLensesPrintData,
	printControlFlags?: {
		includeRightEye?: boolean;
		includeLeftEye?: boolean;
	}
): Promise<Uint8Array> => {
	const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;

	let y = drawTitle(context, 'LENTILLES DE CONTACT', drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

	// Normalize to nested structure (support legacy flat data)
	const rightSph = DocumentUtils.formatFieldDisplay((printData?.rightEye?.sph) || printData?.sph || printData?.objSph);
	const rightCyl = DocumentUtils.formatFieldDisplay((printData?.rightEye?.cyl) || printData?.cyl || printData?.objCyl);
	const rightAxisRaw = (printData?.rightEye?.axis) || printData?.axis || printData?.objAxis || '';
	const rightAxis = rightAxisRaw.trim() !== '' ? rightAxisRaw : '';
	const rightDiam = (printData?.rightEye?.diam) || printData?.diam || '';
	// Use rayon from eyeData if available, otherwise use axis_k from printData
	const rightAxisK = (printData?.rightEye?.axis_k) || printData?.axis_k || '';
	const rightContactLensType = (printData?.rightEye?.contactLensType) || printData?.contactLensType || '';
	const rightLensType = (printData?.rightEye?.lensType) || '';
	const rightLensBrand = (printData?.rightEye?.lensBrand) || printData?.lensBrand || '';

	const leftSph = DocumentUtils.formatFieldDisplay((printData?.leftEye?.sph) || '');
	const leftCyl = DocumentUtils.formatFieldDisplay((printData?.leftEye?.cyl) || '');
	const leftAxisRaw = (printData?.leftEye?.axis) || '';
	const leftAxis = leftAxisRaw.trim() !== '' ? leftAxisRaw : '';
	const leftDiam = (printData?.leftEye?.diam) || '';
	// Use rayon from eyeData if available, otherwise use axis_k from printData
	const leftAxisK = (printData?.leftEye?.axis_k) || '';
	const leftContactLensType = (printData?.leftEye?.contactLensType) || '';
	const leftLensType = (printData?.leftEye?.lensType) || '';
	const leftLensBrand = (printData?.leftEye?.lensBrand) || '';

	// Determine lens types
	const rightIsSpherical = rightContactLensType === 'Sphérique';
	const leftIsSpherical = leftContactLensType === 'Sphérique';

	// Check if we have prescription data (raw values for existence)
	const hasRightEyeData = rightSph || rightCyl || rightAxisRaw;
	const hasLeftEyeData = leftSph || leftCyl || leftAxisRaw;

	// Calculate equal column distribution across page width
	const usableWidth = width - LEFT_MARGIN - RIGHT_MARGIN;
	const maxColumnCount = Math.max(
		rightIsSpherical ? 3 : 5, // Sph, Diamètre, Rayon OR Sph, Cyl, Axe, Diamètre, Rayon
		leftIsSpherical ? 3 : 5
	);
	const columnWidth = usableWidth / (maxColumnCount + 1); // +1 for eye label column

	// Column positions
	const col1 = LEFT_MARGIN; // Eye label
	const col2 = LEFT_MARGIN + columnWidth - 20; // Sphère
	const col3 = LEFT_MARGIN + columnWidth * 2; // Cylindre or Diamètre (spherical)
	const col4 = LEFT_MARGIN + columnWidth * 3; // Axe or Rayon (spherical)
	const col5 = LEFT_MARGIN + columnWidth * 4; // Diamètre (toric)
	const col6 = LEFT_MARGIN + columnWidth * 5; // Rayon (toric)

	// Same layout as Glasses PDF: OD/OG once at top, row labels on left, values on separate lines
	const shouldShowRightEye = printControlFlags?.includeRightEye !== false;
	const shouldShowLeftEye = printControlFlags?.includeLeftEye !== false;
	const colLabel = LEFT_MARGIN;
	const colOD = LEFT_MARGIN + 35; // Aligned with Glasses colODValue
	const colOG = width / 2 + 45;   // Aligned with Glasses colOGValue
	const colRowLabel = colOD - 25; // Closer to values as requested

	const hasPrescriptionData = (shouldShowRightEye && hasRightEyeData) || (shouldShowLeftEye && hasLeftEyeData);
	const hasTypeData = (shouldShowRightEye && (rightContactLensType || rightLensType || rightLensBrand)) ||
		(shouldShowLeftEye && (leftContactLensType || leftLensType || leftLensBrand));
	if (hasPrescriptionData || hasTypeData) {
		// OD and OG written once at top - aligned with value columns
		const headerY = y;
		if (shouldShowRightEye) {
			page.drawText("Oeil droit", { x: colOD, y: headerY, size: TEXT_SIZES.sectionHeader, font: helveticaBold, color: rgb(0, 0, 0) });
		}
		if (shouldShowLeftEye) {
			page.drawText("Oeil gauche", { x: colOG, y: headerY, size: TEXT_SIZES.sectionHeader, font: helveticaBold, color: rgb(0, 0, 0) });
		}
		y -= 2 * SECTION_GAP;
	}

	// Format prescription like Glasses: sphere d or sphere (cylinder à axe°)
	const formatPrescriptionLikeGlasses = (sph: string, cyl: string, axisRaw: string, isSpherical: boolean): string => {
		const sphNum = parseFloat(sph) || 0;
		const cylNum = parseFloat(cyl) || 0;
		const axisExists = axisRaw && axisRaw.trim() !== '';
		if ((!sph && !cyl && !axisRaw) || (Math.abs(sphNum) < 0.01 && Math.abs(cylNum) < 0.01 && !axisExists)) {
			return 'Plan';
		}
		const sphText = DocumentUtils.formatNumberWithSignOrEmpty(sph);
		if (isSpherical) {
			return `${sphText} d`;
		}
		if (Math.abs(cylNum) < 0.01 && !axisExists) {
			return `${sphText} d`;
		}
		const cylText = DocumentUtils.formatNumberWithSignOrEmpty(cyl);
		const axisText = axisExists ? axisRaw : '0';
		return `${sphText} (${cylText} à ${axisText}°)`;
	};

	if (hasPrescriptionData) {
		// P: row - label on left, values next to it (same line) in OD/OG columns, formatted like Glasses
		const rightPrescription = formatPrescriptionLikeGlasses(rightSph, rightCyl, rightAxis, rightIsSpherical);
		const leftPrescription = formatPrescriptionLikeGlasses(leftSph, leftCyl, leftAxis, leftIsSpherical);

		page.drawText("P:", { x: colRowLabel, y, size: TEXT_SIZES.normal, font: helveticaBold, color: rgb(0, 0, 0) });
		if (shouldShowRightEye && hasRightEyeData) {
			page.drawText(rightPrescription, { x: colOD, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
		}
		if (shouldShowLeftEye && hasLeftEyeData) {
			page.drawText(leftPrescription, { x: colOG, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
		}
		y -= LINE_HEIGHTS.normal;

		// R: rayon row - label on left, values next to it (same line)
		if ((shouldShowRightEye && rightAxisK) || (shouldShowLeftEye && leftAxisK)) {
			page.drawText("R:", { x: colRowLabel, y, size: TEXT_SIZES.normal, font: helveticaBold, color: rgb(0, 0, 0) });
			if (shouldShowRightEye && rightAxisK) {
				page.drawText(`${rightAxisK} mm`, { x: colOD, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
			}
			if (shouldShowLeftEye && leftAxisK) {
				page.drawText(`${leftAxisK} mm`, { x: colOG, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
			}
			y -= LINE_HEIGHTS.normal;
		}

		// D: diamètre row - label on left, values next to it (same line)
		if ((shouldShowRightEye && rightDiam) || (shouldShowLeftEye && leftDiam)) {
			page.drawText("D:", { x: colRowLabel, y, size: TEXT_SIZES.normal, font: helveticaBold, color: rgb(0, 0, 0) });
			if (shouldShowRightEye && rightDiam) {
				page.drawText(`${rightDiam} mm`, { x: colOD, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
			}
			if (shouldShowLeftEye && leftDiam) {
				page.drawText(`${leftDiam} mm`, { x: colOG, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });
			}
			y -= LINE_HEIGHTS.normal;
		}
		y -= SECTION_GAP;
	}

	// Type de lentilles - same layout: row labels on left, values under OD/OG
	if (
		(shouldShowRightEye && (rightContactLensType || rightLensType || rightLensBrand)) ||
		(shouldShowLeftEye && (leftContactLensType || leftLensType || leftLensBrand))
	) {
		y -= SECTION_GAP;
		page.drawText('Type de lentilles:', {
			x: colLabel,
			y,
			size: TEXT_SIZES.sectionHeader,
			font: helveticaBold,
			color: rgb(0, 0, 0),
		});
		y -= SECTION_GAP;

		// Type row
		page.drawText('Type:', { x: colLabel, y, size: TEXT_SIZES.small, font: helveticaBold, color: rgb(0, 0, 0) });
		if (shouldShowRightEye && rightContactLensType) {
			page.drawText(rightContactLensType, { x: colOD, y, size: TEXT_SIZES.small, font: helvetica, color: rgb(0, 0, 0) });
		}
		if (shouldShowLeftEye && leftContactLensType) {
			page.drawText(leftContactLensType, { x: colOG, y, size: TEXT_SIZES.small, font: helvetica, color: rgb(0, 0, 0) });
		}
		y -= SECTION_GAP;

		if ((shouldShowRightEye && rightLensType) || (shouldShowLeftEye && leftLensType)) {
			page.drawText('Matière:', { x: colLabel, y, size: TEXT_SIZES.small, font: helveticaBold, color: rgb(0, 0, 0) });
			if (shouldShowRightEye && rightLensType) {
				page.drawText(rightLensType, { x: colOD, y, size: TEXT_SIZES.small, font: helvetica, color: rgb(0, 0, 0) });
			}
			if (shouldShowLeftEye && leftLensType) {
				page.drawText(leftLensType, { x: colOG, y, size: TEXT_SIZES.small, font: helvetica, color: rgb(0, 0, 0) });
			}
			y -= SECTION_GAP;
		}

		if ((shouldShowRightEye && rightLensBrand) || (shouldShowLeftEye && leftLensBrand)) {
			page.drawText('Marque:', { x: colLabel, y, size: TEXT_SIZES.small, font: helveticaBold, color: rgb(0, 0, 0) });
			if (shouldShowRightEye && rightLensBrand) {
				page.drawText(rightLensBrand, { x: colOD, y, size: TEXT_SIZES.small, font: helvetica, color: rgb(0, 0, 0) });
			}
			if (shouldShowLeftEye && leftLensBrand) {
				page.drawText(leftLensBrand, { x: colOG, y, size: TEXT_SIZES.small, font: helvetica, color: rgb(0, 0, 0) });
			}
			y -= LINE_HEIGHTS.small;
		}
	}

	const pdfBytes = await context.pdfDoc.save();
	return pdfBytes;
};

// UI Component
const ContactLensesDocument: React.FC<ContactLensesDocumentProps> = () => {
	// Get form data from hook
	const {
		rightEyeData,
		leftEyeData,
		patient,
		printContactLensesData: printData,
		setPrintContactLensesData: setPrintData,
	} = useDocumentForm();

	// Internal state for print control flags
	const [internalPrintControlFlags, setInternalPrintControlFlags] = React.useState<ContactLensesPrintControlFlags>({
		includeRightEye: true,
		includeLeftEye: true,
	});

	// Use external flags if provided, otherwise use internal state
	const printControlFlags = internalPrintControlFlags;
	const setPrintControlFlags = setInternalPrintControlFlags;

	// Handler for print data changes
	const handlePrintDataChange = (eye: 'rightEye' | 'leftEye', field: keyof ContactLensesPrintData['rightEye']) => (value: string) => {
		setPrintData((prev) => ({
			...prev,
			[eye]: {
				...prev[eye],
				[field]: value,
			},
		}));
	};

	// Determine if eyes are spherical
	const rightIsSpherical = (printData.rightEye?.contactLensType || '') === 'Sphérique';
	const leftIsSpherical = (printData.leftEye?.contactLensType || '') === 'Sphérique';

	return (
		<div className="space-y-3 font-sans text-sm pb-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				{/* Right Eye */}
				<div className="bg-blue-500/10 rounded-xl p-2.5 border-2 border-blue-300/50 shadow-sm hover:shadow-md transition-all space-y-2">
					{/* OD Checkbox - Title Box (Full Width) */}
					<button
						type="button"
						onClick={() =>
							setPrintControlFlags((prev) => ({
								...prev,
								includeRightEye: !(prev.includeRightEye !== false),
							}))
						}
						className={cn(
							"w-full px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-all",
							printControlFlags.includeRightEye === false ? "opacity-50" : "opacity-100"
						)}
						style={{
							background: printControlFlags.includeRightEye === false
								? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
								: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
							boxShadow: printControlFlags.includeRightEye === false
								? '0 2px 6px -2px rgba(107, 114, 128, 0.2)'
								: '0 4px 12px -2px rgba(59, 130, 246, 0.3)'
						}}
					>
						<Checkbox
							id="includeRightEye"
							checked={printControlFlags.includeRightEye !== false}
							onCheckedChange={(checked) =>
								setPrintControlFlags((prev) => ({
									...prev,
									includeRightEye: checked === true,
								}))
							}
							className="h-3.5 w-3.5 border-white/50 data-[state=checked]:bg-white data-[state=checked]:border-white"
							onClick={(e) => e.stopPropagation()}
						/>
						<h4 className="text-xs font-extrabold text-white uppercase tracking-tight">
							OD
						</h4>
					</button>

					<div className="grid grid-cols-2 gap-2.5">
						<div className="col-span-1 space-y-1">
							<Label className="text-xs font-semibold text-blue-700 uppercase tracking-tight block">Sphère</Label>
							<Input
								value={printData.rightEye.sph}
								onChange={(e) => handlePrintDataChange('rightEye', 'sph')(e.target.value)}
								className="h-7 text-sm font-semibold text-foreground bg-background border-blue-300/50 focus:border-blue-500 focus:ring-blue-200/50"
							/>
						</div>

						{!rightIsSpherical && (
							<>
								<div className="col-span-1 space-y-1">
									<Label className="text-xs font-semibold text-blue-700 uppercase tracking-tight block">Cylindre</Label>
									<Input
										value={printData.rightEye.cyl}
										onChange={(e) => handlePrintDataChange('rightEye', 'cyl')(e.target.value)}
										className="h-7 text-sm font-semibold text-foreground bg-background border-blue-300/50 focus:border-blue-500 focus:ring-blue-200/50"
									/>
								</div>
								<div className="col-span-1 space-y-1">
									<Label className="text-xs font-semibold text-blue-700 uppercase tracking-tight block">Axe</Label>
									<Input
										value={printData.rightEye.axis}
										onChange={(e) => handlePrintDataChange('rightEye', 'axis')(e.target.value)}
										className="h-7 text-sm font-semibold text-foreground bg-background border-blue-300/50 focus:border-blue-500 focus:ring-blue-200/50"
									/>
								</div>
							</>
						)}

						<div className="col-span-1 space-y-1">
							<Label className="text-xs font-semibold text-blue-700 uppercase tracking-tight block">Diamètre</Label>
							<Input
								value={printData.rightEye.diam}
								onChange={(e) => handlePrintDataChange('rightEye', 'diam')(e.target.value)}
								className="h-7 text-sm font-semibold text-foreground bg-background border-blue-300/50 focus:border-blue-500 focus:ring-blue-200/50"
							/>
						</div>
						<div className="col-span-1 space-y-1">
							<Label className="text-xs font-semibold text-blue-700 uppercase tracking-tight block">Rayon</Label>
							<Input
								value={printData.rightEye.axis_k}
								onChange={(e) => handlePrintDataChange('rightEye', 'axis_k')(e.target.value)}
								className="h-7 text-sm font-semibold text-foreground bg-background border-blue-300/50 focus:border-blue-500 focus:ring-blue-200/50"
							/>
						</div>
					</div>

					<div className="pt-2 mt-1.5 border-t border-blue-200/50 space-y-2">
						<div className="space-y-1">
							<Label className="text-xs font-semibold text-blue-700 uppercase tracking-tight block">Type</Label>
							<Input
								value={printData.rightEye.contactLensType}
								onChange={(e) => handlePrintDataChange('rightEye', 'contactLensType')(e.target.value)}
								className="h-7 text-sm font-semibold text-foreground bg-background border-blue-300/50 focus:border-blue-500 focus:ring-blue-200/50"
							/>
						</div>
						<div className="space-y-1">
							<Label className="text-xs font-semibold text-blue-700 uppercase tracking-tight block">Matière</Label>
							<Input
								value={printData.rightEye.lensType}
								onChange={(e) => handlePrintDataChange('rightEye', 'lensType')(e.target.value)}
								className="h-7 text-sm font-semibold text-foreground bg-background border-blue-300/50 focus:border-blue-500 focus:ring-blue-200/50"
							/>
						</div>
						<div className="space-y-1">
							<Label className="text-xs font-semibold text-blue-700 uppercase tracking-tight block">Marque</Label>
							<Input
								value={printData.rightEye.lensBrand}
								onChange={(e) => handlePrintDataChange('rightEye', 'lensBrand')(e.target.value)}
								className="h-7 text-sm font-semibold text-foreground bg-background border-blue-300/50 focus:border-blue-500 focus:ring-blue-200/50"
							/>
						</div>
					</div>
				</div>

				{/* Left Eye */}
				<div className="bg-green-500/10 rounded-xl p-2.5 border-2 border-green-300/50 shadow-sm hover:shadow-md transition-all space-y-2">
					{/* OG Checkbox - Title Box (Full Width) */}
					<button
						type="button"
						onClick={() =>
							setPrintControlFlags((prev) => ({
								...prev,
								includeLeftEye: !(prev.includeLeftEye !== false),
							}))
						}
						className={cn(
							"w-full px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-all",
							printControlFlags.includeLeftEye === false ? "opacity-50" : "opacity-100"
						)}
						style={{
							background: printControlFlags.includeLeftEye === false
								? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
								: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
							boxShadow: printControlFlags.includeLeftEye === false
								? '0 2px 6px -2px rgba(107, 114, 128, 0.2)'
								: '0 4px 12px -2px rgba(16, 185, 129, 0.3)'
						}}
					>
						<Checkbox
							id="includeLeftEye"
							checked={printControlFlags.includeLeftEye !== false}
							onCheckedChange={(checked) =>
								setPrintControlFlags((prev) => ({
									...prev,
									includeLeftEye: checked === true,
								}))
							}
							className="h-3.5 w-3.5 border-white/50 data-[state=checked]:bg-white data-[state=checked]:border-white"
							onClick={(e) => e.stopPropagation()}
						/>
						<h4 className="text-xs font-extrabold text-white uppercase tracking-tight">
							OG
						</h4>
					</button>

					<div className="grid grid-cols-2 gap-2.5">
						<div className="col-span-1 space-y-1">
							<Label className="text-xs font-semibold text-green-700 uppercase tracking-tight block">Sphère</Label>
							<Input
								value={printData.leftEye.sph}
								onChange={(e) => handlePrintDataChange('leftEye', 'sph')(e.target.value)}
								className="h-7 text-sm font-semibold text-foreground bg-background border-green-300/50 focus:border-green-500 focus:ring-green-200/50"
							/>
						</div>

						{!leftIsSpherical && (
							<>
								<div className="col-span-1 space-y-1">
									<Label className="text-xs font-semibold text-green-700 uppercase tracking-tight block">Cylindre</Label>
									<Input
										value={printData.leftEye.cyl}
										onChange={(e) => handlePrintDataChange('leftEye', 'cyl')(e.target.value)}
										className="h-7 text-sm font-semibold text-foreground bg-background border-green-300/50 focus:border-green-500 focus:ring-green-200/50"
									/>
								</div>
								<div className="col-span-1 space-y-1">
									<Label className="text-xs font-semibold text-green-700 uppercase tracking-tight block">Axe</Label>
									<Input
										value={printData.leftEye.axis}
										onChange={(e) => handlePrintDataChange('leftEye', 'axis')(e.target.value)}
										className="h-7 text-sm font-semibold text-foreground bg-background border-green-300/50 focus:border-green-500 focus:ring-green-200/50"
									/>
								</div>
							</>
						)}

						<div className="col-span-1 space-y-1">
							<Label className="text-xs font-semibold text-green-700 uppercase tracking-tight block">Diamètre</Label>
							<Input
								value={printData.leftEye.diam}
								onChange={(e) => handlePrintDataChange('leftEye', 'diam')(e.target.value)}
								className="h-7 text-sm font-semibold text-foreground bg-background border-green-300/50 focus:border-green-500 focus:ring-green-200/50"
							/>
						</div>
						<div className="col-span-1 space-y-1">
							<Label className="text-xs font-semibold text-green-700 uppercase tracking-tight block">Rayon</Label>
							<Input
								value={printData.leftEye.axis_k}
								onChange={(e) => handlePrintDataChange('leftEye', 'axis_k')(e.target.value)}
								className="h-7 text-sm font-semibold text-foreground bg-background border-green-300/50 focus:border-green-500 focus:ring-green-200/50"
							/>
						</div>
					</div>

					<div className="pt-2 mt-1.5 border-t border-green-200/50 space-y-2">
						<div className="space-y-1">
							<Label className="text-xs font-semibold text-green-700 uppercase tracking-tight block">Type</Label>
							<Input
								value={printData.leftEye.contactLensType}
								onChange={(e) => handlePrintDataChange('leftEye', 'contactLensType')(e.target.value)}
								className="h-7 text-sm font-semibold text-foreground bg-background border-green-300/50 focus:border-green-500 focus:ring-green-200/50"
							/>
						</div>
						<div className="space-y-1">
							<Label className="text-xs font-semibold text-green-700 uppercase tracking-tight block">Matière</Label>
							<Input
								value={printData.leftEye.lensType}
								onChange={(e) => handlePrintDataChange('leftEye', 'lensType')(e.target.value)}
								className="h-7 text-sm font-semibold text-foreground bg-background border-green-300/50 focus:border-green-500 focus:ring-green-200/50"
							/>
						</div>
						<div className="space-y-1">
							<Label className="text-xs font-semibold text-green-700 uppercase tracking-tight block">Marque</Label>
							<Input
								value={printData.leftEye.lensBrand}
								onChange={(e) => handlePrintDataChange('leftEye', 'lensBrand')(e.target.value)}
								className="h-7 text-sm font-semibold text-foreground bg-background border-green-300/50 focus:border-green-500 focus:ring-green-200/50"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default memo(ContactLensesDocument);
