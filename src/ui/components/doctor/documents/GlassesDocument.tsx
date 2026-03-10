import React, { memo } from 'react';
import { cn } from "@/ui/lib/utils";
import { Input } from '@/ui/components/ui/input';
import { Label } from '@/ui/components/ui/label';
import { Checkbox } from '@/ui/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/ui/components/ui/radio-group';
import { PDFDocument, PDFPage, rgb } from 'pdf-lib';
import { PdfGenerationContext, drawTitle, drawDocumentHeader } from './PdfUtils';
import { DocumentUtils } from './DocumentUtils';
import { useDocumentForm } from './hooks/useDocumentForm';

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

interface Patient {
	dob: string;
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

interface GlassesDocumentProps { }

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
const SECTION_GAP = 18; // Same spacing: OD-to-Vision de Loin, Vision de Loin-to-values, between sections


// PDF Generation Function
export const generateGlassesPDF = async (
	context: PdfGenerationContext,
	patient: { surname: string; name: string; dob: string },
	printData?: {
		rightEye: {
			sph: string;
			cyl: string;
			axis: string;
			add: string;
			glassType: string;
			nearSph: string;
			nearCyl: string;
			nearAxis: string;
			emptyEyeOption?: 'plan' | 'conserver';
			emptyNearEyeOption?: 'plan' | 'conserver';
		};
		leftEye: {
			sph: string;
			cyl: string;
			axis: string;
			add: string;
			glassType: string;
			nearSph: string;
			nearCyl: string;
			nearAxis: string;
			emptyEyeOption?: 'plan' | 'conserver';
			emptyNearEyeOption?: 'plan' | 'conserver';
		};
	},
	printControlFlags?: {
		includeGlassType: boolean;
		includeFarVision: boolean;
		includeNearVision: boolean;
		includeRightEyeFar?: boolean;
		includeLeftEyeFar?: boolean;
		includeRightEyeNear?: boolean;
		includeLeftEyeNear?: boolean;
	}
): Promise<Uint8Array> => {
	const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;

	let y = drawTitle(context, 'VERRES CORRECTEURS', drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

	// Calculate equal column distribution across page width
	const usableWidth = width - LEFT_MARGIN - RIGHT_MARGIN;
	const columnCount = DocumentUtils.calculateAge(patient.dob) >= 40 ? 5 : 4; // 4 columns if under 40, 5 if 40+
	const columnWidth = usableWidth / columnCount;

	// Column positions
	const colODLabel = LEFT_MARGIN + 10;
	const colODValue = LEFT_MARGIN + 50;
	const colOGLabel = width / 2 + 10;
	const colOGValue = width / 2 + 45;

	const col2 = LEFT_MARGIN + columnWidth / 2; // Keep for Glass Type if needed
	const col3 = width / 2 - 'VERRES CORRECTEURS'.length * 3; // Keep for consistency if used elsewhere, though we override for vision sections

	// Helper for prescription formatting
	const formatPrescriptionLine = (sph: string, cyl: string, axisRaw: string): string => {
		const sphText = DocumentUtils.formatNumberWithSignOrEmpty(sph);
		const cylNum = parseFloat(cyl) || 0;
		const axisExists = axisRaw && axisRaw.trim() !== '';

		// Case: Sphere only (Cyl is 0 and Axis is empty/0)
		if (Math.abs(cylNum) < 0.01 && !axisExists) {
			return `${sphText} d`;
		}

		// Case: Cylinder present
		const cylText = DocumentUtils.formatNumberWithSignOrEmpty(cyl);
		const axisText = axisExists ? axisRaw : '0';
		return `${sphText} (${cylText} à ${axisText}°)`;
	};

	// Use print data directly - apply empty field formatting
	const rightSph = DocumentUtils.formatFieldDisplay(printData?.rightEye?.sph);
	const rightCyl = DocumentUtils.formatFieldDisplay(printData?.rightEye?.cyl);
	const rightAxisRaw = printData?.rightEye?.axis || ''; // Keep raw value for axis (0 is valid)
	const rightAxis = rightAxisRaw.trim() !== '' ? rightAxisRaw : ''; // Only empty if truly empty
	const rightAdd = DocumentUtils.formatFieldDisplay(printData?.rightEye?.add);
	const rightGlassType = DocumentUtils.formatFieldDisplay(printData?.rightEye?.glassType);


	// Far vision section - only show if we have non-empty far vision data
	const leftSph = DocumentUtils.formatFieldDisplay(printData?.leftEye?.sph);
	const leftCyl = DocumentUtils.formatFieldDisplay(printData?.leftEye?.cyl);
	const leftAxisRaw = printData?.leftEye?.axis || ''; // Keep raw value for axis (0 is valid)
	const leftAxis = leftAxisRaw.trim() !== '' ? leftAxisRaw : ''; // Only empty if truly empty

	// Determine if we should show far vision section
	const includeFarVision = printControlFlags?.includeFarVision === true;
	const includeNearVision = printControlFlags?.includeNearVision === true;

	// Check which eyes are enabled for far vision
	// Explicitly check: hide only if false, show otherwise (including undefined which defaults to true)
	const shouldShowRightEyeFar = printControlFlags?.includeRightEyeFar === false ? false : true;
	const shouldShowLeftEyeFar = printControlFlags?.includeLeftEyeFar === false ? false : true;

	// Only show far vision data if at least one eye is enabled
	const hasAnyFarVisionEye = shouldShowRightEyeFar || shouldShowLeftEyeFar;

	// Logic: Far vision data is shown if (!) either (Loin is checked) OR (Près is UNchecked)
	const shouldShowFarVisionData = includeFarVision || !includeNearVision;

	// Show "Loin:" title only when the Vision de Loin checkbox is selected
	const shouldShowFarVisionTitle = includeFarVision && hasAnyFarVisionEye;

	// Determine if we should show near vision section
	// Show if near vision is explicitly selected (always show OD/OG, either with data or "Plan")
	const shouldShowNearVision = printControlFlags?.includeNearVision === true;

	// Check which eyes are enabled for near vision
	// Explicitly check: hide only if false, show otherwise (including undefined which defaults to true)
	const shouldShowRightEyeNear = printControlFlags?.includeRightEyeNear === false ? false : true;
	const shouldShowLeftEyeNear = printControlFlags?.includeLeftEyeNear === false ? false : true;

	// Only show near vision section if at least one eye is enabled
	const hasAnyNearVisionEye = shouldShowRightEyeNear || shouldShowLeftEyeNear;

	// Determine if we should show near vision title
	// Show title if: near vision is selected AND at least one eye is enabled
	const shouldShowNearVisionTitle = shouldShowNearVision && hasAnyNearVisionEye;

	// Oeil droit / Oeil gauche written once at top, centered in their columns
	// Include far vision whenever we have far vision eyes (values always appear; "Loin" label only when checkbox is on)
	const showAnyVision = hasAnyFarVisionEye || (shouldShowNearVision && hasAnyNearVisionEye);
	if (showAnyVision && (shouldShowRightEyeFar || shouldShowRightEyeNear || shouldShowLeftEyeFar || shouldShowLeftEyeNear)) {
		const headerY = y;
		const odText = "Oeil droit";
		const ogText = "Oeil gauche";
		const headerSize = TEXT_SIZES.sectionHeader;
		const colODCenter = (colODValue + width / 2) / 2;
		const colOGCenter = (colOGValue + width - RIGHT_MARGIN) / 2;
		if (shouldShowRightEyeFar || shouldShowRightEyeNear) {
			const w = helveticaBold.widthOfTextAtSize(odText, headerSize);
			page.drawText(odText, { x: colODValue, y: headerY, size: headerSize, font: helveticaBold, color: rgb(0, 0, 0) });
		}
		if (shouldShowLeftEyeFar || shouldShowLeftEyeNear) {
			const w = helveticaBold.widthOfTextAtSize(ogText, headerSize);
			page.drawText(ogText, { x: colOGValue, y: headerY, size: headerSize, font: helveticaBold, color: rgb(0, 0, 0) });
		}
		y -= 2 * SECTION_GAP;
	}

	// Far vision values: always show when eyes are enabled; "Loin:" label only when checkbox is selected
	if (hasAnyFarVisionEye && shouldShowFarVisionData) {
		if (shouldShowFarVisionTitle) {
			page.drawText('Loin:', {
				x: LEFT_MARGIN + 10,
				y,
				size: TEXT_SIZES.sectionHeader,
				font: helveticaBold,
				color: rgb(0, 0, 0),
			});
		}

		const valueY = y;

		// Right Eye (OD) - values on separate line
		if (shouldShowRightEyeFar) {
			const rightEmptyOption = printData?.rightEye?.emptyEyeOption || 'plan';

			const rightAxisExists = rightAxisRaw && rightAxisRaw.trim() !== '';

			if (rightEmptyOption === 'conserver') {
				page.drawText('Verre en place', {
					x: colODValue, y: valueY, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0)
				});
			} else if (rightSph !== '' || rightCyl !== '' || rightAxisExists) {
				const rightText = formatPrescriptionLine(rightSph, rightCyl, rightAxis);
				page.drawText(rightText, {
					x: colODValue, y: valueY, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0)
				});
			} else {
				page.drawText('Plan', {
					x: colODValue, y: valueY, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0)
				});
			}
		}

		// Left Eye (OG) - values on separate line
		if (shouldShowLeftEyeFar) {
			const leftEmptyOption = printData?.leftEye?.emptyEyeOption || 'plan';
			const leftAxisExists = leftAxisRaw && leftAxisRaw.trim() !== '';

			if (leftEmptyOption === 'conserver') {
				page.drawText('Verre en place', {
					x: colOGValue, y: valueY, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0)
				});
			} else if (leftSph !== '' || leftCyl !== '' || leftAxisExists) {
				const leftText = formatPrescriptionLine(leftSph, leftCyl, leftAxis);
				page.drawText(leftText, {
					x: colOGValue, y: valueY, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0)
				});
			} else {
				page.drawText('Plan', {
					x: colOGValue, y: valueY, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0)
				});
			}
		}

		y = valueY - LINE_HEIGHTS.normal;
		y -= 2 * SECTION_GAP; // Same distance between Vision de Loin block and Vision de Près
	}

	// Near vision section - use stored near vision values
	const rightNearSph = DocumentUtils.formatFieldDisplay(printData?.rightEye?.nearSph);
	const rightNearCyl = DocumentUtils.formatFieldDisplay(printData?.rightEye?.nearCyl);
	const rightNearAxisRaw = printData?.rightEye?.nearAxis || ''; // Keep raw value for axis (0 is valid)
	const rightNearAxis = rightNearAxisRaw.trim() !== '' ? rightNearAxisRaw : ''; // Only empty if truly empty
	const leftNearSph = DocumentUtils.formatFieldDisplay(printData?.leftEye?.nearSph);
	const leftNearCyl = DocumentUtils.formatFieldDisplay(printData?.leftEye?.nearCyl);
	const leftNearAxisRaw = printData?.leftEye?.nearAxis || ''; // Keep raw value for axis (0 is valid)
	const leftNearAxis = leftNearAxisRaw.trim() !== '' ? leftNearAxisRaw : ''; // Only empty if truly empty


	if (shouldShowNearVision && hasAnyNearVisionEye) {
		// Vision de Près: label on its own line, values on separate line below
		if (shouldShowNearVisionTitle) {
			page.drawText("Près:", {
				x: LEFT_MARGIN + 10,
				y,
				size: TEXT_SIZES.sectionHeader,
				font: helveticaBold,
				color: rgb(0, 0, 0),
			});
		}

		const nearValueY = y;

		// Right Eye (OD) - values on separate line
		if (shouldShowRightEyeNear) {
			const rightNearEmptyOption = printData?.rightEye?.emptyNearEyeOption || 'plan';

			const rightNearSphNum = parseFloat(rightNearSph) || 0;
			const rightNearCylNum = parseFloat(rightNearCyl) || 0;
			const rightNearAxisExists = rightNearAxisRaw && rightNearAxisRaw.trim() !== '';
			const rightNearHasVisualData = !DocumentUtils.isEmptyField(rightNearSph) || !DocumentUtils.isEmptyField(rightNearCyl) || rightNearAxisExists;
			const rightNearIsEffectivelyZero = rightNearSphNum === 0 && rightNearCylNum === 0 && !rightNearAxisExists;

			if (rightNearEmptyOption === 'conserver') {
				page.drawText('Verre en place', {
					x: colODValue, y: nearValueY, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0)
				});
			} else if (rightNearHasVisualData && !rightNearIsEffectivelyZero) {
				const rightText = formatPrescriptionLine(rightNearSph, rightNearCyl, rightNearAxis);
				page.drawText(rightText, {
					x: colODValue, y: nearValueY, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0)
				});
			} else {
				page.drawText('Plan', {
					x: colODValue, y: nearValueY, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0)
				});
			}
		}

		// Left Eye (OG) - values on separate line
		if (shouldShowLeftEyeNear) {
			const leftNearEmptyOption = printData?.leftEye?.emptyNearEyeOption || 'plan';

			const leftNearSphNum = parseFloat(leftNearSph) || 0;
			const leftNearCylNum = parseFloat(leftNearCyl) || 0;
			const leftNearAxisExists = leftNearAxisRaw && leftNearAxisRaw.trim() !== '';
			const leftNearHasVisualData = !DocumentUtils.isEmptyField(leftNearSph) || !DocumentUtils.isEmptyField(leftNearCyl) || leftNearAxisExists;
			const leftNearIsEffectivelyZero = leftNearSphNum === 0 && leftNearCylNum === 0 && !leftNearAxisExists;

			if (leftNearEmptyOption === 'conserver') {
				page.drawText('Verre en place', {
					x: colOGValue, y: nearValueY, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0)
				});
			} else if (leftNearHasVisualData && !leftNearIsEffectivelyZero) {
				const leftText = formatPrescriptionLine(leftNearSph, leftNearCyl, leftNearAxis);
				page.drawText(leftText, {
					x: colOGValue, y: nearValueY, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0)
				});
			} else {
				page.drawText('Plan', {
					x: colOGValue, y: nearValueY, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0)
				});
			}
		}

		y = nearValueY - 2 * LINE_HEIGHTS.normal;
	}

	// Distance interpupillaire - Note: This would need to be added to printData if needed
	// For now, we'll skip this section as it's not part of the print data structure

	// Type de verre - only show if glass type is specified and not empty
	const leftGlassType = DocumentUtils.formatFieldDisplay(printData?.leftEye?.glassType);
	if (printControlFlags?.includeGlassType !== false &&
		(!DocumentUtils.isEmptyField(rightGlassType) || !DocumentUtils.isEmptyField(leftGlassType))) {
		y -= 10;
		page.drawText('Type de verre:', {
			x: colODLabel,
			y,
			size: TEXT_SIZES.sectionHeader,
			font: helveticaBold,
			color: rgb(0, 0, 0),
		});
		const displayGlassType = rightGlassType || leftGlassType;
		page.drawText(displayGlassType, {
			x: colODLabel + 90,
			y,
			size: TEXT_SIZES.sectionHeader,
			font: helvetica,
			color: rgb(0, 0, 0),
		});
		y -= 2 * LINE_HEIGHTS.normal;
	}

	const pdfBytes = await context.pdfDoc.save();
	return pdfBytes;
};

// UI Component
const GlassesDocument: React.FC<GlassesDocumentProps> = () => {
	// Get form data from hook
	const {
		rightEyeData,
		leftEyeData,
		patient,
		printControlFlags,
		setPrintControlFlags,
		printGlassesData: printData,
		setPrintGlassesData: setPrintData,
	} = useDocumentForm();


	// Handler for print data changes
	const handlePrintDataChange = (eye: 'rightEye' | 'leftEye', field: keyof GlassesPrintData['rightEye']) => (value: string | 'plan' | 'conserver') => {
		setPrintData((prev) => {
			const updated = {
				...prev,
				[eye]: {
					...prev[eye],
					[field]: value,
				},
			};

			// Don't clear emptyEyeOption automatically - user can always choose to show "Verre en place"
			// Only clear if user explicitly sets it to 'plan' and there's data
			if (field === 'emptyEyeOption' || field === 'emptyNearEyeOption') {
				// Keep the option as selected
			} else if (field === 'sph' || field === 'cyl' || field === 'axis') {
				// Only auto-set to 'plan' if empty, but don't clear if user selected 'conserver'
				const sph = field === 'sph' ? value : updated[eye].sph;
				const cyl = field === 'cyl' ? value : updated[eye].cyl;
				const axis = field === 'axis' ? value : updated[eye].axis;
				const sphNum = parseFloat(sph as string) || 0;
				const cylNum = parseFloat(cyl as string) || 0;
				const axisNum = parseFloat(axis as string) || 0;

				// If all values are empty/zero and no option is set, default to 'plan'
				if (!sph && !cyl && !axis && sphNum === 0 && cylNum === 0 && axisNum === 0 && !updated[eye].emptyEyeOption) {
					updated[eye].emptyEyeOption = 'plan';
				}
			} else if (field === 'nearSph' || field === 'nearCyl' || field === 'nearAxis') {
				// Similar logic for near vision
				const nearSph = field === 'nearSph' ? value : updated[eye].nearSph;
				const nearCyl = field === 'nearCyl' ? value : updated[eye].nearCyl;
				const nearAxis = field === 'nearAxis' ? value : updated[eye].nearAxis;
				const nearSphNum = parseFloat(nearSph as string) || 0;
				const nearCylNum = parseFloat(nearCyl as string) || 0;
				const nearAxisNum = parseFloat(nearAxis as string) || 0;

				// If all values are empty/zero and no option is set, default to 'plan'
				if (!nearSph && !nearCyl && !nearAxis && nearSphNum === 0 && nearCylNum === 0 && nearAxisNum === 0 && !updated[eye].emptyNearEyeOption) {
					updated[eye].emptyNearEyeOption = 'plan';
				}
			}

			return updated;
		});
	};

	return (
		<div className="space-y-3 font-sans text-sm pb-4">
			{/* Print Control Options */}
			<div className="bg-card rounded-xl p-2.5 border border-border shadow-sm">
				<div className="flex flex-wrap gap-3 items-center">
					<div className="flex items-center space-x-2">
						<Checkbox
							id="includeFarVision"
							checked={printControlFlags.includeFarVision}
							onCheckedChange={(checked) =>
								setPrintControlFlags((prev) => ({
									...prev,
									includeFarVision: checked === true,
								}))
							}
							className="data-[state=checked]:bg-slate-800 data-[state=checked]:border-slate-800 border-slate-300"
						/>
						<Label htmlFor="includeFarVision" className="text-[10px] font-semibold text-slate-600 uppercase tracking-tight cursor-pointer hover:text-slate-900 transition-colors">Vision de Loin</Label>
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox
							id="includeNearVision"
							checked={printControlFlags.includeNearVision}
							onCheckedChange={(checked) =>
								setPrintControlFlags((prev) => ({
									...prev,
									includeNearVision: checked === true,
								}))
							}
							className="data-[state=checked]:bg-slate-800 data-[state=checked]:border-slate-800 border-slate-300"
						/>
						<Label htmlFor="includeNearVision" className="text-[10px] font-semibold text-slate-600 uppercase tracking-tight cursor-pointer hover:text-slate-900 transition-colors">Vision de Près</Label>
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox
							id="includeGlassType"
							checked={printControlFlags.includeGlassType}
							onCheckedChange={(checked) =>
								setPrintControlFlags((prev) => ({
									...prev,
									includeGlassType: checked === true,
								}))
							}
							className="data-[state=checked]:bg-slate-800 data-[state=checked]:border-slate-800 border-slate-300"
						/>
						<Label htmlFor="includeGlassType" className="text-[10px] font-semibold text-slate-600 uppercase tracking-tight cursor-pointer hover:text-slate-900 transition-colors">Type de verres</Label>
					</div>
				</div>
			</div>

			{/* Vision de Loin / OD-OG fields - OD/OG always shown; title only when Vision de Loin is checked */}
			<div className="bg-card rounded-xl p-3 border border-border shadow-sm relative space-y-2">
				{printControlFlags.includeFarVision === true && (
					<div className="px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2 mb-1.5" style={{
						background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
						boxShadow: '0 4px 12px -2px rgba(59, 130, 246, 0.3)'
					}}>
						<h4 className="text-xs font-extrabold text-white uppercase tracking-tight">
							Vision de Loin
						</h4>
					</div>
				)}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					{/* Right Eye Far */}
					<div className="flex flex-col gap-2 bg-blue-500/10 rounded-xl p-2.5 border-2 border-blue-300/50 shadow-sm hover:shadow-md transition-all">
						{/* OD Checkbox - Title Box */}
						<div
							onClick={() =>
								setPrintControlFlags((prev) => ({ ...prev, includeRightEyeFar: !(prev.includeRightEyeFar !== false) }))
							}
							className={cn(
								"px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-all",
								printControlFlags.includeRightEyeFar === false ? "opacity-50" : "opacity-100"
							)}
							style={{
								background: printControlFlags.includeRightEyeFar === false
									? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
									: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
								boxShadow: printControlFlags.includeRightEyeFar === false
									? '0 2px 6px -2px rgba(107, 114, 128, 0.2)'
									: '0 4px 12px -2px rgba(59, 130, 246, 0.3)'
							}}
						>
							<Checkbox
								id="includeRightEyeFar"
								checked={printControlFlags.includeRightEyeFar !== false}
								onCheckedChange={(checked) =>
									setPrintControlFlags((prev) => ({ ...prev, includeRightEyeFar: checked === true }))
								}
								className="h-3.5 w-3.5 border-white/50 data-[state=checked]:bg-white data-[state=checked]:border-white"
								onClick={(e) => e.stopPropagation()}
							/>
							<h4 className="text-xs font-extrabold text-white uppercase tracking-tight">
								OD
							</h4>
						</div>

						{/* Input Fields */}
						<div className="grid grid-cols-3 gap-2">
							<div>
								<Label className="text-[10px] font-semibold text-blue-700 uppercase tracking-tight block mb-1">Sphère</Label>
								<Input
									value={printData.rightEye.sph || ''}
									onChange={(e) => handlePrintDataChange('rightEye', 'sph')(e.target.value)}
									className="h-7 text-sm font-semibold text-foreground bg-background border-blue-300/50 focus:border-blue-500 focus:ring-blue-200/50"
								/>
							</div>
							<div>
								<Label className="text-[10px] font-semibold text-blue-700 uppercase tracking-tight block mb-1">Cylindre</Label>
								<Input
									value={printData.rightEye.cyl || ''}
									onChange={(e) => handlePrintDataChange('rightEye', 'cyl')(e.target.value)}
									className="h-7 text-sm font-semibold text-foreground bg-background border-blue-300/50 focus:border-blue-500 focus:ring-blue-200/50"
								/>
							</div>
							<div>
								<Label className="text-[10px] font-semibold text-blue-700 uppercase tracking-tight block mb-1">Axe</Label>
								<Input
									value={printData.rightEye.axis || ''}
									onChange={(e) => handlePrintDataChange('rightEye', 'axis')(e.target.value)}
									className="h-7 text-sm font-semibold text-foreground bg-background border-blue-300/50 focus:border-blue-500 focus:ring-blue-200/50"
								/>
							</div>
						</div>

						{/* Options Right Eye - Inline Compact */}
						<div className="pt-0.5">
							{(() => {
								const rightHasData = (printData.rightEye.sph && parseFloat(printData.rightEye.sph) !== 0) ||
									(printData.rightEye.cyl && parseFloat(printData.rightEye.cyl) !== 0) ||
									(printData.rightEye.axis && parseFloat(printData.rightEye.axis) !== 0);

								if (rightHasData) {
									return (
										<div className="flex items-center space-x-2">
											<Checkbox
												id="rightEyeEmptyOptionConserver"
												checked={printData.rightEye.emptyEyeOption === 'conserver'}
												onCheckedChange={(checked) => handlePrintDataChange('rightEye', 'emptyEyeOption')(checked ? 'conserver' : 'plan')}
												className="h-4 w-4 border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
											/>
											<Label htmlFor="rightEyeEmptyOptionConserver" className="text-xs font-semibold text-blue-700 cursor-pointer">Verre en place</Label>
										</div>
									);
								} else {
									return (
										<RadioGroup
											value={printData.rightEye.emptyEyeOption || 'plan'}
											onValueChange={(value) => handlePrintDataChange('rightEye', 'emptyEyeOption')(value as 'plan' | 'conserver')}
											className="flex flex-row space-x-4"
										>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="plan" id="right-plan" className="h-4 w-4 border-blue-400 text-blue-600" />
												<Label htmlFor="right-plan" className="text-xs font-semibold text-blue-700 cursor-pointer">Plan</Label>
											</div>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="conserver" id="right-conserver" className="h-4 w-4 border-blue-400 text-blue-600" />
												<Label htmlFor="right-conserver" className="text-xs font-semibold text-blue-700 cursor-pointer">En place</Label>
											</div>
										</RadioGroup>
									);
								}
							})()}
						</div>
					</div>

					{/* Left Eye Far */}
					<div className="flex flex-col gap-2 bg-green-500/10 rounded-xl p-2.5 border-2 border-green-300/50 shadow-sm hover:shadow-md transition-all">
						{/* OG Checkbox - Title Box */}
						<div
							onClick={() =>
								setPrintControlFlags((prev) => ({ ...prev, includeLeftEyeFar: !(prev.includeLeftEyeFar !== false) }))
							}
							className={cn(
								"px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-all",
								printControlFlags.includeLeftEyeFar === false ? "opacity-50" : "opacity-100"
							)}
							style={{
								background: printControlFlags.includeLeftEyeFar === false
									? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
									: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
								boxShadow: printControlFlags.includeLeftEyeFar === false
									? '0 2px 6px -2px rgba(107, 114, 128, 0.2)'
									: '0 4px 12px -2px rgba(16, 185, 129, 0.3)'
							}}
						>
							<Checkbox
								id="includeLeftEyeFar"
								checked={printControlFlags.includeLeftEyeFar !== false}
								onCheckedChange={(checked) =>
									setPrintControlFlags((prev) => ({ ...prev, includeLeftEyeFar: checked === true }))
								}
								className="h-3.5 w-3.5 border-white/50 data-[state=checked]:bg-white data-[state=checked]:border-white"
								onClick={(e) => e.stopPropagation()}
							/>
							<h4 className="text-xs font-extrabold text-white uppercase tracking-tight">
								OG
							</h4>
						</div>

						{/* Input Fields */}
						<div className="grid grid-cols-3 gap-2">
							<div>
								<Label className="text-[10px] font-semibold text-green-700 uppercase tracking-tight block mb-1">Sphère</Label>
								<Input
									value={printData.leftEye.sph || ''}
									onChange={(e) => handlePrintDataChange('leftEye', 'sph')(e.target.value)}
									className="h-7 text-sm font-semibold text-foreground bg-background border-green-300/50 focus:border-green-500 focus:ring-green-200/50"
								/>
							</div>
							<div>
								<Label className="text-[10px] font-semibold text-green-700 uppercase tracking-tight block mb-1">Cylindre</Label>
								<Input
									value={printData.leftEye.cyl || ''}
									onChange={(e) => handlePrintDataChange('leftEye', 'cyl')(e.target.value)}
									className="h-7 text-sm font-semibold text-foreground bg-background border-green-300/50 focus:border-green-500 focus:ring-green-200/50"
								/>
							</div>
							<div>
								<Label className="text-[10px] font-semibold text-green-700 uppercase tracking-tight block mb-1">Axe</Label>
								<Input
									value={printData.leftEye.axis || ''}
									onChange={(e) => handlePrintDataChange('leftEye', 'axis')(e.target.value)}
									className="h-7 text-sm font-semibold text-foreground bg-background border-green-300/50 focus:border-green-500 focus:ring-green-200/50"
								/>
							</div>
						</div>

						{/* Options Left Eye */}
						<div className="pt-1">
							{(() => {
								const leftHasData = (printData.leftEye.sph && parseFloat(printData.leftEye.sph) !== 0) ||
									(printData.leftEye.cyl && parseFloat(printData.leftEye.cyl) !== 0) ||
									(printData.leftEye.axis && parseFloat(printData.leftEye.axis) !== 0);

								if (leftHasData) {
									return (
										<div className="flex items-center space-x-2">
											<Checkbox
												id="leftEyeEmptyOptionConserver"
												checked={printData.leftEye.emptyEyeOption === 'conserver'}
												onCheckedChange={(checked) => handlePrintDataChange('leftEye', 'emptyEyeOption')(checked ? 'conserver' : 'plan')}
												className="h-4 w-4 border-green-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
											/>
											<Label htmlFor="leftEyeEmptyOptionConserver" className="text-xs font-semibold text-green-700 cursor-pointer">Verre en place</Label>
										</div>
									);
								} else {
									return (
										<RadioGroup
											value={printData.leftEye.emptyEyeOption || 'plan'}
											onValueChange={(value) => handlePrintDataChange('leftEye', 'emptyEyeOption')(value as 'plan' | 'conserver')}
											className="flex flex-row space-x-4"
										>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="plan" id="left-plan" className="h-4 w-4 border-green-400 text-green-600" />
												<Label htmlFor="left-plan" className="text-xs font-semibold text-green-700 cursor-pointer">Plan</Label>
											</div>
											<div className="flex items-center space-x-2">
												<RadioGroupItem value="conserver" id="left-conserver" className="h-4 w-4 border-green-400 text-green-600" />
												<Label htmlFor="left-conserver" className="text-xs font-semibold text-green-700 cursor-pointer">En place</Label>
											</div>
										</RadioGroup>
									);
								}
							})()}
						</div>
					</div>
				</div>
			</div>

			{/* Vision de Près fields */}
			{printControlFlags.includeNearVision === true && (
				<div className="bg-card rounded-xl p-3 border border-border shadow-sm relative space-y-2 mt-2">
					<div className="px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2 mb-1.5" style={{
						background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
						boxShadow: '0 4px 12px -2px rgba(245, 158, 11, 0.3)'
					}}>
						<h4 className="text-xs font-extrabold text-white uppercase tracking-tight">
							Vision de Près
						</h4>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						{/* Right Eye Near */}
						<div className="flex flex-col gap-2 bg-blue-500/10 rounded-xl p-2.5 border-2 border-blue-300/50 shadow-sm hover:shadow-md transition-all">
							{/* OD Checkbox - Title Box */}
							<div
								onClick={() =>
									setPrintControlFlags((prev) => ({ ...prev, includeRightEyeNear: !(prev.includeRightEyeNear !== false) }))
								}
								className={cn(
									"px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-all",
									printControlFlags.includeRightEyeNear === false ? "opacity-50" : "opacity-100"
								)}
								style={{
									background: printControlFlags.includeRightEyeNear === false
										? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
										: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
									boxShadow: printControlFlags.includeRightEyeNear === false
										? '0 2px 6px -2px rgba(107, 114, 128, 0.2)'
										: '0 4px 12px -2px rgba(59, 130, 246, 0.3)'
								}}
							>
								<Checkbox
									id="includeRightEyeNear"
									checked={printControlFlags.includeRightEyeNear !== false}
									onCheckedChange={(checked) =>
										setPrintControlFlags((prev) => ({ ...prev, includeRightEyeNear: checked === true }))
									}
									className="h-3.5 w-3.5 border-white/50 data-[state=checked]:bg-white data-[state=checked]:border-white"
									onClick={(e) => e.stopPropagation()}
								/>
								<h4 className="text-xs font-extrabold text-white uppercase tracking-tight">
									OD
								</h4>
							</div>

							{/* Input Fields */}
							<div className="grid grid-cols-3 gap-2">
								<div>
									<Label className="text-[10px] font-semibold text-blue-700 uppercase tracking-tight block mb-1">Sphère</Label>
									<Input
										value={printData.rightEye.nearSph || ''}
										onChange={(e) => handlePrintDataChange('rightEye', 'nearSph')(e.target.value)}
										className="h-7 text-sm font-semibold text-foreground bg-background border-blue-300/50 focus:border-blue-500 focus:ring-blue-200/50"
									/>
								</div>
								<div>
									<Label className="text-[10px] font-semibold text-blue-700 uppercase tracking-tight block mb-1">Cylindre</Label>
									<Input
										value={printData.rightEye.nearCyl || ''}
										onChange={(e) => handlePrintDataChange('rightEye', 'nearCyl')(e.target.value)}
										className="h-7 text-sm font-semibold text-foreground bg-background border-blue-300/50 focus:border-blue-500 focus:ring-blue-200/50"
									/>
								</div>
								<div>
									<Label className="text-[10px] font-semibold text-blue-700 uppercase tracking-tight block mb-1">Axe</Label>
									<Input
										value={printData.rightEye.nearAxis || ''}
										onChange={(e) => handlePrintDataChange('rightEye', 'nearAxis')(e.target.value)}
										className="h-7 text-sm font-semibold text-foreground bg-background border-blue-300/50 focus:border-blue-500 focus:ring-blue-200/50"
									/>
								</div>
							</div>

							{/* Options Right Eye Near */}
							<div className="pt-1">
								{(() => {
									const rightNearHasData = (printData.rightEye.nearSph && parseFloat(printData.rightEye.nearSph) !== 0) ||
										(printData.rightEye.nearCyl && parseFloat(printData.rightEye.nearCyl) !== 0) ||
										(printData.rightEye.nearAxis && parseFloat(printData.rightEye.nearAxis) !== 0);

									if (rightNearHasData) {
										return (
											<div className="flex items-center space-x-2">
												<Checkbox
													id="rightEyeNearEmptyOptionConserver"
													checked={printData.rightEye.emptyNearEyeOption === 'conserver'}
													onCheckedChange={(checked) => handlePrintDataChange('rightEye', 'emptyNearEyeOption')(checked ? 'conserver' : 'plan')}
													className="h-4 w-4 border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
												/>
												<Label htmlFor="rightEyeNearEmptyOptionConserver" className="text-xs font-semibold text-blue-700 cursor-pointer">Verre en place</Label>
											</div>
										);
									} else {
										return (
											<RadioGroup
												value={printData.rightEye.emptyNearEyeOption || 'plan'}
												onValueChange={(value) => handlePrintDataChange('rightEye', 'emptyNearEyeOption')(value as 'plan' | 'conserver')}
												className="flex flex-row space-x-4"
											>
												<div className="flex items-center space-x-2">
													<RadioGroupItem value="plan" id="right-near-plan" className="h-4 w-4 border-blue-400 text-blue-600" />
													<Label htmlFor="right-near-plan" className="text-xs font-semibold text-blue-700 cursor-pointer">Plan</Label>
												</div>
												<div className="flex items-center space-x-2">
													<RadioGroupItem value="conserver" id="right-near-conserver" className="h-4 w-4 border-blue-400 text-blue-600" />
													<Label htmlFor="right-near-conserver" className="text-xs font-semibold text-blue-700 cursor-pointer">En place</Label>
												</div>
											</RadioGroup>
										);
									}
								})()}
							</div>
						</div>

						{/* Left Eye Near */}
						<div className="flex flex-col gap-2 bg-green-500/10 rounded-xl p-2.5 border-2 border-green-300/50 shadow-sm hover:shadow-md transition-all">
							{/* OG Checkbox - Title Box */}
							<div
								onClick={() =>
									setPrintControlFlags((prev) => ({ ...prev, includeLeftEyeNear: !(prev.includeLeftEyeNear !== false) }))
								}
								className={cn(
									"px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-all",
									printControlFlags.includeLeftEyeNear === false ? "opacity-50" : "opacity-100"
								)}
								style={{
									background: printControlFlags.includeLeftEyeNear === false
										? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
										: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
									boxShadow: printControlFlags.includeLeftEyeNear === false
										? '0 2px 6px -2px rgba(107, 114, 128, 0.2)'
										: '0 4px 12px -2px rgba(16, 185, 129, 0.3)'
								}}
							>
								<Checkbox
									id="includeLeftEyeNear"
									checked={printControlFlags.includeLeftEyeNear !== false}
									onCheckedChange={(checked) =>
										setPrintControlFlags((prev) => ({ ...prev, includeLeftEyeNear: checked === true }))
									}
									className="h-3.5 w-3.5 border-white/50 data-[state=checked]:bg-white data-[state=checked]:border-white"
									onClick={(e) => e.stopPropagation()}
								/>
								<h4 className="text-xs font-extrabold text-white uppercase tracking-tight">
									OG
								</h4>
							</div>

							{/* Input Fields */}
							<div className="grid grid-cols-3 gap-2">
								<div>
									<Label className="text-[10px] font-semibold text-green-700 uppercase tracking-tight block mb-1">Sphère</Label>
									<Input
										value={printData.leftEye.nearSph || ''}
										onChange={(e) => handlePrintDataChange('leftEye', 'nearSph')(e.target.value)}
										className="h-7 text-sm font-semibold text-foreground bg-background border-green-300/50 focus:border-green-500 focus:ring-green-200/50"
									/>
								</div>
								<div>
									<Label className="text-[10px] font-semibold text-green-700 uppercase tracking-tight block mb-1">Cylindre</Label>
									<Input
										value={printData.leftEye.nearCyl || ''}
										onChange={(e) => handlePrintDataChange('leftEye', 'nearCyl')(e.target.value)}
										className="h-7 text-sm font-semibold text-foreground bg-background border-green-300/50 focus:border-green-500 focus:ring-green-200/50"
									/>
								</div>
								<div>
									<Label className="text-[10px] font-semibold text-green-700 uppercase tracking-tight block mb-1">Axe</Label>
									<Input
										value={printData.leftEye.nearAxis || ''}
										onChange={(e) => handlePrintDataChange('leftEye', 'nearAxis')(e.target.value)}
										className="h-7 text-sm font-semibold text-foreground bg-background border-green-300/50 focus:border-green-500 focus:ring-green-200/50"
									/>
								</div>
							</div>

							{/* Options Left Eye Near */}
							<div className="pt-1">
								{(() => {
									const leftNearHasData = (printData.leftEye.nearSph && parseFloat(printData.leftEye.nearSph) !== 0) ||
										(printData.leftEye.nearCyl && parseFloat(printData.leftEye.nearCyl) !== 0) ||
										(printData.leftEye.nearAxis && parseFloat(printData.leftEye.nearAxis) !== 0);

									if (leftNearHasData) {
										return (
											<div className="flex items-center space-x-2">
												<Checkbox
													id="leftEyeNearEmptyOptionConserver"
													checked={printData.leftEye.emptyNearEyeOption === 'conserver'}
													onCheckedChange={(checked) => handlePrintDataChange('leftEye', 'emptyNearEyeOption')(checked ? 'conserver' : 'plan')}
													className="h-4 w-4 border-green-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
												/>
												<Label htmlFor="leftEyeNearEmptyOptionConserver" className="text-xs font-semibold text-green-700 cursor-pointer">Verre en place</Label>
											</div>
										);
									} else {
										return (
											<RadioGroup
												value={printData.leftEye.emptyNearEyeOption || 'plan'}
												onValueChange={(value) => handlePrintDataChange('leftEye', 'emptyNearEyeOption')(value as 'plan' | 'conserver')}
												className="flex flex-row space-x-4"
											>
												<div className="flex items-center space-x-2">
													<RadioGroupItem value="plan" id="left-near-plan" className="h-4 w-4 border-green-400 text-green-600" />
													<Label htmlFor="left-near-plan" className="text-xs font-semibold text-green-700 cursor-pointer">Plan</Label>
												</div>
												<div className="flex items-center space-x-2">
													<RadioGroupItem value="conserver" id="left-near-conserver" className="h-4 w-4 border-green-400 text-green-600" />
													<Label htmlFor="left-near-conserver" className="text-xs font-semibold text-green-700 cursor-pointer">En place</Label>
												</div>
											</RadioGroup>
										);
									}
								})()}
							</div>
						</div>
					</div>
				</div>
			)}

			{printControlFlags.includeGlassType && (
				<div className="bg-card rounded-xl p-2.5 border border-border shadow-sm">
					<Label className="text-xs font-semibold text-foreground uppercase tracking-tight mb-1.5 block">Type de verres</Label>
					<Input
						value={printData.rightEye.glassType || ''}
						onChange={(e) => handlePrintDataChange('rightEye', 'glassType')(e.target.value)}
						className="h-7 text-sm font-medium bg-background border-border w-full focus:border-primary focus:ring-primary/20"
						placeholder="Ex: Progressifs..."
					/>
				</div>
			)}
		</div>
	);
};

export default memo(GlassesDocument);
