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
	const col2 = LEFT_MARGIN + columnWidth / 2; // Sphère
	const col3 = width / 2 - 'VERRES CORRECTEURS'.length * 3; // Cylindre

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
	// Always show if far vision is explicitly selected OR if neither is selected
	// (OD/OG will always be displayed, either with data or with "Plan" default)
	const shouldShowFarVision = printControlFlags?.includeFarVision === true ||
		(!printControlFlags?.includeFarVision && !printControlFlags?.includeNearVision);

	// Check which eyes are enabled for far vision
	// Explicitly check: hide only if false, show otherwise (including undefined which defaults to true)
	const shouldShowRightEyeFar = printControlFlags?.includeRightEyeFar === false ? false : true;
	const shouldShowLeftEyeFar = printControlFlags?.includeLeftEyeFar === false ? false : true;

	// Only show far vision section if at least one eye is enabled
	const hasAnyFarVisionEye = shouldShowRightEyeFar || shouldShowLeftEyeFar;

	// Determine if we should show far vision title
	// Show title if: far vision should be shown AND at least one eye is enabled
	const shouldShowFarVisionTitle = shouldShowFarVision && hasAnyFarVisionEye;

	if (shouldShowFarVision && hasAnyFarVisionEye) {
		// Show title
		if (shouldShowFarVisionTitle) {
			page.drawText('Vision de Loin:', {
				x: col2,
				y,
				size: TEXT_SIZES.sectionHeader,
				font: helveticaBold,
				color: rgb(0, 0, 0),
			});
			y -= 1.2 * LINE_HEIGHTS.normal;
		}

		// Right Eye (OD)
		if (shouldShowRightEyeFar) {
			const rightEmptyOption = printData?.rightEye?.emptyEyeOption || 'plan';

			// Check if we have valid data (non-zero or axis present)
			const rightSphNum = parseFloat(rightSph) || 0;
			const rightCylNum = parseFloat(rightCyl) || 0;
			// Axis is relevant if it exists (including 0)
			const rightAxisExists = rightAxisRaw && rightAxisRaw.trim() !== '';
			const rightHasVisualData = !DocumentUtils.isEmptyField(rightSph) || !DocumentUtils.isEmptyField(rightCyl) || rightAxisExists;
			const rightIsEffectivelyZero = rightSphNum === 0 && rightCylNum === 0 && !rightAxisExists;

			// Logic:
			// 1. If Conserver selected -> Print Conserver
			// 2. If valid data and NOT effectively zero -> Print Data
			// 3. Otherwise (No data, or Zero data, or Plan selected) -> Print Plan

			const labelX = col2;
			const contentX = col3; // Aligned with column 3 title if exists, or just spaced out

			page.drawText("OD:", { x: labelX, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });

			if (rightEmptyOption === 'conserver') {
				page.drawText('Conserver ancienne lentille', {
					x: contentX, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0)
				});
			} else if (rightHasVisualData && !rightIsEffectivelyZero) {
				const rightCylText = !DocumentUtils.isEmptyField(rightCyl) ? `(${DocumentUtils.formatNumberWithSignOrEmpty(rightCyl)})` : '';
				const rightAxisText = rightAxisExists ? rightAxis + '°' : '';
				const rightPrescription = [DocumentUtils.formatNumberWithSignOrEmpty(rightSph), rightCylText, rightAxisText]
					.filter(p => p !== '').join(' ');

				page.drawText(rightPrescription, {
					x: contentX, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0)
				});
			} else {
				page.drawText('Plan', {
					x: contentX, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0)
				});
			}
			y -= LINE_HEIGHTS.normal;
		}

		// Left Eye (OG)
		if (shouldShowLeftEyeFar) {
			const leftEmptyOption = printData?.leftEye?.emptyEyeOption || 'plan';

			const leftSphNum = parseFloat(leftSph) || 0;
			const leftCylNum = parseFloat(leftCyl) || 0;
			const leftAxisExists = leftAxisRaw && leftAxisRaw.trim() !== '';
			const leftHasVisualData = !DocumentUtils.isEmptyField(leftSph) || !DocumentUtils.isEmptyField(leftCyl) || leftAxisExists;
			const leftIsEffectivelyZero = leftSphNum === 0 && leftCylNum === 0 && !leftAxisExists;

			const labelX = col2;
			const contentX = col3;

			page.drawText("OG:", { x: labelX, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });

			if (leftEmptyOption === 'conserver') {
				page.drawText('Conserver ancienne lentille', {
					x: contentX, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0)
				});
			} else if (leftHasVisualData && !leftIsEffectivelyZero) {
				const leftCylText = !DocumentUtils.isEmptyField(leftCyl) ? `(${DocumentUtils.formatNumberWithSignOrEmpty(leftCyl)})` : '';
				const leftAxisText = leftAxisExists ? leftAxis + '°' : '';
				const leftPrescription = [DocumentUtils.formatNumberWithSignOrEmpty(leftSph), leftCylText, leftAxisText]
					.filter(p => p !== '').join(' ');

				page.drawText(leftPrescription, {
					x: contentX, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0)
				});
			} else {
				page.drawText('Plan', {
					x: contentX, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0)
				});
			}
			y -= LINE_HEIGHTS.normal;
		}

		y -= 0.5 * LINE_HEIGHTS.normal; // Spacing after section
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

	if (shouldShowNearVision && hasAnyNearVisionEye) {
		// Show title
		if (shouldShowNearVisionTitle) {
			page.drawText("Vision de Près:", {
				x: col2,
				y,
				size: TEXT_SIZES.sectionHeader,
				font: helveticaBold,
				color: rgb(0, 0, 0),
			});
			y -= 1.2 * LINE_HEIGHTS.normal;
		}

		// Right Eye (OD)
		if (shouldShowRightEyeNear) {
			const rightNearEmptyOption = printData?.rightEye?.emptyNearEyeOption || 'plan';

			const rightNearSphNum = parseFloat(rightNearSph) || 0;
			const rightNearCylNum = parseFloat(rightNearCyl) || 0;
			const rightNearAxisExists = rightNearAxisRaw && rightNearAxisRaw.trim() !== '';
			const rightNearHasVisualData = !DocumentUtils.isEmptyField(rightNearSph) || !DocumentUtils.isEmptyField(rightNearCyl) || rightNearAxisExists;
			const rightNearIsEffectivelyZero = rightNearSphNum === 0 && rightNearCylNum === 0 && !rightNearAxisExists;

			const labelX = col2;
			const contentX = col3;

			page.drawText("OD:", { x: labelX, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });

			if (rightNearEmptyOption === 'conserver') {
				page.drawText('Conserver ancienne lentille', {
					x: contentX, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0)
				});
			} else if (rightNearHasVisualData && !rightNearIsEffectivelyZero) {
				const rightNearCylText = !DocumentUtils.isEmptyField(rightNearCyl) ? `(${DocumentUtils.formatNumberWithSignOrEmpty(rightNearCyl)})` : '';
				const rightNearAxisText = rightNearAxisExists ? rightNearAxis + '°' : '';
				const rightNearPrescription = [DocumentUtils.formatNumberWithSignOrEmpty(rightNearSph), rightNearCylText, rightNearAxisText]
					.filter(p => p !== '').join(' ');

				page.drawText(rightNearPrescription, {
					x: contentX, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0)
				});
			} else {
				page.drawText('Plan', {
					x: contentX, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0)
				});
			}
			y -= LINE_HEIGHTS.normal;
			// Only add extra spacing if left eye will also be shown
			if (shouldShowLeftEyeNear) {
				y -= 0.5 * LINE_HEIGHTS.normal;
			}
		}

		// Left Eye (OG)
		if (shouldShowLeftEyeNear) {
			const leftNearEmptyOption = printData?.leftEye?.emptyNearEyeOption || 'plan';

			const leftNearSphNum = parseFloat(leftNearSph) || 0;
			const leftNearCylNum = parseFloat(leftNearCyl) || 0;
			const leftNearAxisExists = leftNearAxisRaw && leftNearAxisRaw.trim() !== '';
			const leftNearHasVisualData = !DocumentUtils.isEmptyField(leftNearSph) || !DocumentUtils.isEmptyField(leftNearCyl) || leftNearAxisExists;
			const leftNearIsEffectivelyZero = leftNearSphNum === 0 && leftNearCylNum === 0 && !leftNearAxisExists;

			const labelX = col2;
			const contentX = col3;

			page.drawText("OG:", { x: labelX, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0) });

			if (leftNearEmptyOption === 'conserver') {
				page.drawText('Conserver ancienne lentille', {
					x: contentX, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0)
				});
			} else if (leftNearHasVisualData && !leftNearIsEffectivelyZero) {
				const leftNearCylText = !DocumentUtils.isEmptyField(leftNearCyl) ? `(${DocumentUtils.formatNumberWithSignOrEmpty(leftNearCyl)})` : '';
				const leftNearAxisText = leftNearAxisExists ? leftNearAxis + '°' : '';
				const leftNearPrescription = [DocumentUtils.formatNumberWithSignOrEmpty(leftNearSph), leftNearCylText, leftNearAxisText]
					.filter(p => p !== '').join(' ');

				page.drawText(leftNearPrescription, {
					x: contentX, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0)
				});
			} else {
				page.drawText('Plan', {
					x: contentX, y, size: TEXT_SIZES.normal, font: helvetica, color: rgb(0, 0, 0)
				});
			}
			y -= LINE_HEIGHTS.normal;
		}
	}

	// Distance interpupillaire - Note: This would need to be added to printData if needed
	// For now, we'll skip this section as it's not part of the print data structure

	// Type de verre - only show if glass type is specified and not empty
	const leftGlassType = DocumentUtils.formatFieldDisplay(printData?.leftEye?.glassType);
	if (printControlFlags?.includeGlassType !== false &&
		(!DocumentUtils.isEmptyField(rightGlassType) || !DocumentUtils.isEmptyField(leftGlassType))) {
		y -= 10;
		page.drawText('Type de verre:', {
			x: col2,
			y,
			size: TEXT_SIZES.sectionHeader,
			font: helveticaBold,
			color: rgb(0, 0, 0),
		});
		const displayGlassType = rightGlassType || leftGlassType;
		page.drawText(displayGlassType, {
			x: col2 + 90,
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


	// Track manual edits to prevent auto-updates
	const manualEditRef = React.useRef({
		rightNearSph: false,
		rightNearCyl: false,
		rightNearAxis: false,
		leftNearSph: false,
		leftNearCyl: false,
		leftNearAxis: false,
	});

	// Track previous source values to update only when source actually changes
	const prevRightSourceRef = React.useRef<{ sph?: string; cyl?: string; axis?: string; add?: string; glassType?: string }>({});
	const prevLeftSourceRef = React.useRef<{ sph?: string; cyl?: string; axis?: string; add?: string; glassType?: string }>({});

	// Track if component has completed initial mount
	const hasMountedRef = React.useRef(false);

	// Track if saved data was detected on mount (to prevent overwriting it)
	const hasSavedDataRef = React.useRef(false);

	// Initialize on mount
	React.useEffect(() => {
		// Check if printData has saved values (differs from exam data)
		const hasSavedRightData =
			printData.rightEye.sph !== (rightEyeData?.sph || '') ||
			printData.rightEye.cyl !== (rightEyeData?.cyl || '') ||
			printData.rightEye.axis !== (rightEyeData?.axis || '') ||
			printData.rightEye.add !== (rightEyeData?.add || '') ||
			printData.rightEye.glassType !== (rightEyeData?.glassType || '');

		const hasSavedLeftData =
			printData.leftEye.sph !== (leftEyeData?.sph || '') ||
			printData.leftEye.cyl !== (leftEyeData?.cyl || '') ||
			printData.leftEye.axis !== (leftEyeData?.axis || '') ||
			printData.leftEye.add !== (leftEyeData?.add || '') ||
			printData.leftEye.glassType !== (leftEyeData?.glassType || '');

		hasSavedDataRef.current = hasSavedRightData || hasSavedLeftData;

		// Always initialize refs with current exam data (not printData)
		// This allows sync effects to detect when exam data changes
		prevRightSourceRef.current = {
			sph: rightEyeData?.sph || '',
			cyl: rightEyeData?.cyl || '',
			axis: rightEyeData?.axis || '',
			add: rightEyeData?.add || '',
			glassType: rightEyeData?.glassType || '',
		};
		prevLeftSourceRef.current = {
			sph: leftEyeData?.sph || '',
			cyl: leftEyeData?.cyl || '',
			axis: leftEyeData?.axis || '',
			add: leftEyeData?.add || '',
			glassType: leftEyeData?.glassType || '',
		};

		// Mark as mounted after initial setup
		hasMountedRef.current = true;
	}, []);

	// Handler for print data changes
	const handlePrintDataChange = (eye: 'rightEye' | 'leftEye', field: keyof GlassesPrintData['rightEye']) => (value: string | 'plan' | 'conserver') => {
		// Track manual edits for near vision fields
		if (field === 'nearSph' || field === 'nearCyl' || field === 'nearAxis') {
			const key = `${eye === 'rightEye' ? 'right' : 'left'}${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof typeof manualEditRef.current;
			manualEditRef.current[key] = true;
		}

		setPrintData((prev) => {
			const updated = {
				...prev,
				[eye]: {
					...prev[eye],
					[field]: value,
				},
			};

			// Don't clear emptyEyeOption automatically - user can always choose to show "Conserver ancienne lentille"
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

	// Far-vision sync effects: update only the field that changed and only if different
	React.useEffect(() => {
		if (!hasMountedRef.current && hasSavedDataRef.current) return;
		const current = rightEyeData?.sph || '';
		const previous = prevRightSourceRef.current.sph ?? '';
		if (current === previous) return;
		prevRightSourceRef.current.sph = current;
		setPrintData((prev) => (prev.rightEye.sph === current ? prev : { ...prev, rightEye: { ...prev.rightEye, sph: current } }));
	}, [rightEyeData?.sph]);

	React.useEffect(() => {
		if (!hasMountedRef.current && hasSavedDataRef.current) return;
		const current = rightEyeData?.cyl || '';
		const previous = prevRightSourceRef.current.cyl ?? '';
		if (current === previous) return;
		prevRightSourceRef.current.cyl = current;
		setPrintData((prev) => (prev.rightEye.cyl === current ? prev : { ...prev, rightEye: { ...prev.rightEye, cyl: current } }));
	}, [rightEyeData?.cyl]);

	React.useEffect(() => {
		if (!hasMountedRef.current && hasSavedDataRef.current) return;
		const current = rightEyeData?.axis || '';
		const previous = prevRightSourceRef.current.axis ?? '';
		if (current === previous) return;
		prevRightSourceRef.current.axis = current;
		setPrintData((prev) => (prev.rightEye.axis === current ? prev : { ...prev, rightEye: { ...prev.rightEye, axis: current } }));
	}, [rightEyeData?.axis]);

	React.useEffect(() => {
		if (!hasMountedRef.current && hasSavedDataRef.current) return;
		const current = rightEyeData?.add || '';
		const previous = prevRightSourceRef.current.add ?? '';
		if (current === previous) return;
		prevRightSourceRef.current.add = current;
		setPrintData((prev) => (prev.rightEye.add === current ? prev : { ...prev, rightEye: { ...prev.rightEye, add: current } }));
	}, [rightEyeData?.add]);

	React.useEffect(() => {
		if (!hasMountedRef.current && hasSavedDataRef.current) return;
		const current = rightEyeData?.glassType || '';
		const previous = prevRightSourceRef.current.glassType ?? '';
		if (current === previous) return;
		prevRightSourceRef.current.glassType = current;
		setPrintData((prev) => (prev.rightEye.glassType === current ? prev : { ...prev, rightEye: { ...prev.rightEye, glassType: current } }));
	}, [rightEyeData?.glassType]);

	React.useEffect(() => {
		if (!hasMountedRef.current && hasSavedDataRef.current) return;
		const current = leftEyeData?.sph || '';
		const previous = prevLeftSourceRef.current.sph ?? '';
		if (current === previous) return;
		prevLeftSourceRef.current.sph = current;
		setPrintData((prev) => (prev.leftEye.sph === current ? prev : { ...prev, leftEye: { ...prev.leftEye, sph: current } }));
	}, [leftEyeData?.sph]);

	React.useEffect(() => {
		if (!hasMountedRef.current && hasSavedDataRef.current) return;
		const current = leftEyeData?.cyl || '';
		const previous = prevLeftSourceRef.current.cyl ?? '';
		if (current === previous) return;
		prevLeftSourceRef.current.cyl = current;
		setPrintData((prev) => (prev.leftEye.cyl === current ? prev : { ...prev, leftEye: { ...prev.leftEye, cyl: current } }));
	}, [leftEyeData?.cyl]);

	React.useEffect(() => {
		if (!hasMountedRef.current && hasSavedDataRef.current) return;
		const current = leftEyeData?.axis || '';
		const previous = prevLeftSourceRef.current.axis ?? '';
		if (current === previous) return;
		prevLeftSourceRef.current.axis = current;
		setPrintData((prev) => (prev.leftEye.axis === current ? prev : { ...prev, leftEye: { ...prev.leftEye, axis: current } }));
	}, [leftEyeData?.axis]);

	React.useEffect(() => {
		if (!hasMountedRef.current && hasSavedDataRef.current) return;
		const current = leftEyeData?.add || '';
		const previous = prevLeftSourceRef.current.add ?? '';
		if (current === previous) return;
		prevLeftSourceRef.current.add = current;
		setPrintData((prev) => (prev.leftEye.add === current ? prev : { ...prev, leftEye: { ...prev.leftEye, add: current } }));
	}, [leftEyeData?.add]);

	React.useEffect(() => {
		if (!hasMountedRef.current && hasSavedDataRef.current) return;
		const current = leftEyeData?.glassType || '';
		const previous = prevLeftSourceRef.current.glassType ?? '';
		if (current === previous) return;
		prevLeftSourceRef.current.glassType = current;
		setPrintData((prev) => (prev.leftEye.glassType === current ? prev : { ...prev, leftEye: { ...prev.leftEye, glassType: current } }));
	}, [leftEyeData?.glassType]);



	// Helpers
	const calculateNearSph = React.useCallback((sph: string, add: string): string => {
		const sphNum = parseFloat(sph || '0');
		const addNum = parseFloat(add || '0');
		if (isNaN(sphNum) || isNaN(addNum)) return '';
		return (sphNum + addNum).toFixed(2);
	}, []);

	// Right eye: update nearSph when sph/add change
	React.useEffect(() => {
		if (manualEditRef.current.rightNearSph) return;
		const desired = calculateNearSph(printData.rightEye.sph, printData.rightEye.add);
		if (printData.rightEye.nearSph !== desired) {
			setPrintData((prev) => ({
				...prev,
				rightEye: { ...prev.rightEye, nearSph: desired },
			}));
		}
	}, [printData.rightEye.sph, printData.rightEye.add, calculateNearSph]);

	// Left eye: update nearSph when sph/add change
	React.useEffect(() => {
		if (manualEditRef.current.leftNearSph) return;
		const desired = calculateNearSph(printData.leftEye.sph, printData.leftEye.add);
		if (printData.leftEye.nearSph !== desired) {
			setPrintData((prev) => ({
				...prev,
				leftEye: { ...prev.leftEye, nearSph: desired },
			}));
		}
	}, [printData.leftEye.sph, printData.leftEye.add, calculateNearSph]);

	// Right eye: update nearCyl when cyl changes
	React.useEffect(() => {
		if (manualEditRef.current.rightNearCyl) return;
		const desired = printData.rightEye.cyl || '';
		if (printData.rightEye.nearCyl !== desired) {
			setPrintData((prev) => ({
				...prev,
				rightEye: { ...prev.rightEye, nearCyl: desired },
			}));
		}
	}, [printData.rightEye.cyl]);

	// Left eye: update nearCyl when cyl changes
	React.useEffect(() => {
		if (manualEditRef.current.leftNearCyl) return;
		const desired = printData.leftEye.cyl || '';
		if (printData.leftEye.nearCyl !== desired) {
			setPrintData((prev) => ({
				...prev,
				leftEye: { ...prev.leftEye, nearCyl: desired },
			}));
		}
	}, [printData.leftEye.cyl]);

	// Right eye: update nearAxis when axis changes
	React.useEffect(() => {
		if (manualEditRef.current.rightNearAxis) return;
		const desired = printData.rightEye.axis || '';
		if (printData.rightEye.nearAxis !== desired) {
			setPrintData((prev) => ({
				...prev,
				rightEye: { ...prev.rightEye, nearAxis: desired },
			}));
		}
	}, [printData.rightEye.axis]);

	// Left eye: update nearAxis when axis changes
	React.useEffect(() => {
		if (manualEditRef.current.leftNearAxis) return;
		const desired = printData.leftEye.axis || '';
		if (printData.leftEye.nearAxis !== desired) {
			setPrintData((prev) => ({
				...prev,
				leftEye: { ...prev.leftEye, nearAxis: desired },
			}));
		}
	}, [printData.leftEye.axis]);

	// Auto-set emptyEyeOption to 'plan' when eye becomes empty
	React.useEffect(() => {
		const rightSph = printData.rightEye.sph || '';
		const rightCyl = printData.rightEye.cyl || '';
		const rightAxis = printData.rightEye.axis || '';
		const rightSphNum = parseFloat(rightSph) || 0;
		const rightCylNum = parseFloat(rightCyl) || 0;
		const rightAxisNum = parseFloat(rightAxis) || 0;
		const rightIsEmpty = (!rightSph && !rightCyl && !rightAxis) || (rightSphNum === 0 && rightCylNum === 0 && rightAxisNum === 0);

		if (rightIsEmpty && !printData.rightEye.emptyEyeOption) {
			setPrintData((prev) => ({
				...prev,
				rightEye: { ...prev.rightEye, emptyEyeOption: 'plan' },
			}));
		}
	}, [printData.rightEye.sph, printData.rightEye.cyl, printData.rightEye.axis, printData.rightEye.emptyEyeOption]);

	React.useEffect(() => {
		const leftSph = printData.leftEye.sph || '';
		const leftCyl = printData.leftEye.cyl || '';
		const leftAxis = printData.leftEye.axis || '';
		const leftSphNum = parseFloat(leftSph) || 0;
		const leftCylNum = parseFloat(leftCyl) || 0;
		const leftAxisNum = parseFloat(leftAxis) || 0;
		const leftIsEmpty = (!leftSph && !leftCyl && !leftAxis) || (leftSphNum === 0 && leftCylNum === 0 && leftAxisNum === 0);

		if (leftIsEmpty && !printData.leftEye.emptyEyeOption) {
			setPrintData((prev) => ({
				...prev,
				leftEye: { ...prev.leftEye, emptyEyeOption: 'plan' },
			}));
		}
	}, [printData.leftEye.sph, printData.leftEye.cyl, printData.leftEye.axis, printData.leftEye.emptyEyeOption]);

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

			{/* Vision de Loin fields */}
			{printControlFlags.includeFarVision === true && (
				<div className="bg-card rounded-xl p-3 border border-border shadow-sm relative space-y-2">
					<div className="px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2 mb-1.5" style={{
						background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
						boxShadow: '0 4px 12px -2px rgba(59, 130, 246, 0.3)'
					}}>
						<h4 className="text-xs font-extrabold text-white uppercase tracking-tight">
							Vision de Loin
						</h4>
					</div>
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
												<Label htmlFor="rightEyeEmptyOptionConserver" className="text-xs font-semibold text-blue-700 cursor-pointer">Conserver</Label>
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
													<Label htmlFor="right-conserver" className="text-xs font-semibold text-blue-700 cursor-pointer">Conserver</Label>
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
												<Label htmlFor="leftEyeEmptyOptionConserver" className="text-xs font-semibold text-green-700 cursor-pointer">Conserver</Label>
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
													<Label htmlFor="left-conserver" className="text-xs font-semibold text-green-700 cursor-pointer">Conserver</Label>
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
												<Label htmlFor="rightEyeNearEmptyOptionConserver" className="text-xs font-semibold text-blue-700 cursor-pointer">Conserver</Label>
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
													<Label htmlFor="right-near-conserver" className="text-xs font-semibold text-blue-700 cursor-pointer">Conserver</Label>
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
												<Label htmlFor="leftEyeNearEmptyOptionConserver" className="text-xs font-semibold text-green-700 cursor-pointer">Conserver</Label>
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
													<Label htmlFor="left-near-conserver" className="text-xs font-semibold text-green-700 cursor-pointer">Conserver</Label>
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
