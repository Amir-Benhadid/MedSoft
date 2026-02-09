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
	printControlFlags?: {
		includeRightEye?: boolean;
		includeLeftEye?: boolean;
	}
): Promise<Uint8Array> => {
	const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;

	let y = drawTitle(context, 'LENTILLES DE CONTACT', drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

	// Normalize to nested structure (support legacy flat data)
	const rightSph = (printData?.rightEye?.sph) || printData?.sph || printData?.objSph || '';
	const rightCyl = (printData?.rightEye?.cyl) || printData?.cyl || printData?.objCyl || '';
	const rightAxis = (printData?.rightEye?.axis) || printData?.axis || printData?.objAxis || '';
	const rightDiam = (printData?.rightEye?.diam) || printData?.diam || '';
	// Use rayon from eyeData if available, otherwise use axis_k from printData
	const rightAxisK = (printData?.rightEye?.axis_k) || printData?.axis_k || '';
	const rightContactLensType = (printData?.rightEye?.contactLensType) || printData?.contactLensType || '';
	const rightLensType = (printData?.rightEye?.lensType) || '';
	const rightLensBrand = (printData?.rightEye?.lensBrand) || printData?.lensBrand || '';

	const leftSph = (printData?.leftEye?.sph) || '';
	const leftCyl = (printData?.leftEye?.cyl) || '';
	const leftAxis = (printData?.leftEye?.axis) || '';
	const leftDiam = (printData?.leftEye?.diam) || '';
	// Use rayon from eyeData if available, otherwise use axis_k from printData
	const leftAxisK = (printData?.leftEye?.axis_k) || '';
	const leftContactLensType = (printData?.leftEye?.contactLensType) || '';
	const leftLensType = (printData?.leftEye?.lensType) || '';
	const leftLensBrand = (printData?.leftEye?.lensBrand) || '';

	// Determine lens types
	const rightIsSpherical = rightContactLensType === 'Sphérique';
	const leftIsSpherical = leftContactLensType === 'Sphérique';

	// Use values directly from printData (already converted and displayed in UI)
	const hasRightEyeData = rightSph || rightCyl || rightAxis;
	const hasLeftEyeData = leftSph || leftCyl || leftAxis;

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

	// Vision de Loin section - P:, R:, D: format like Contacts.tsx
	const shouldShowRightEye = printControlFlags?.includeRightEye !== false; // Default to true
	const shouldShowLeftEye = printControlFlags?.includeLeftEye !== false; // Default to true

	if ((shouldShowRightEye && hasRightEyeData) || (shouldShowLeftEye && hasLeftEyeData)) {
		// Column positions for P:, R:, D: format
		const col2 = LEFT_MARGIN + columnWidth / 2;
		const col3 = width / 2 - "LENTILLES DE CONTACT".length * 3;

		// Right Eye - format: OD: P: sph (cyl) axe, R: rayon, D: diametre 
		if (shouldShowRightEye && hasRightEyeData) {
			// Format: P: sph (cyl) axe
			// For Sphériques lenses: only show sphere (no cylinder, no axis)
			// For Toriques lenses: show sphere, cylinder, and axis
			// Use values directly from printData (already formatted)
			let rightPrescription: string;
			if (rightIsSpherical) {
				// Sphériques: only sphere (already formatted in printData)
				rightPrescription = `P: ${rightSph}`;
			} else {
				// Toriques: sphere, cylinder, and axis (already formatted in printData)
				const rightCylText = rightCyl ? `(${rightCyl})` : '';
				const rightAxisText = rightAxis ? `${rightAxis}°` : '';
				rightPrescription = `P: ${rightSph} ${rightCylText} ${rightAxisText}`.trim();
			}

			page.drawText("OD:", {
				x: col2,
				y,
				size: TEXT_SIZES.normal,
				font: helvetica,
				color: rgb(0, 0, 0),
			});
			page.drawText(rightPrescription, {
				x: col3,
				y,
				size: TEXT_SIZES.normal,
				font: helvetica,
				color: rgb(0, 0, 0),
			});
			y -= LINE_HEIGHTS.normal;

			// R: rayon - only if axis_k exists
			if (rightAxisK) {
				page.drawText(`R: ${rightAxisK} mm`, {
					x: col3,
					y,
					size: TEXT_SIZES.normal,
					font: helvetica,
					color: rgb(0, 0, 0),
				});
				y -= LINE_HEIGHTS.normal;
			}

			// D: diametre - only if diam exists
			if (rightDiam) {
				page.drawText(`D: ${rightDiam} mm`, {
					x: col3,
					y,
					size: TEXT_SIZES.normal,
					font: helvetica,
					color: rgb(0, 0, 0),
				});
				y -= LINE_HEIGHTS.normal;
			}

			y -= LINE_HEIGHTS.normal; // Extra spacing
		}

		// Left Eye - format: OG: P: sph (cyl) axe, R: rayon, D: diametre
		if (shouldShowLeftEye && hasLeftEyeData) {
			// Add spacing between eyes
			y -= 10;

			// Format: P: sph (cyl) axe
			// For Sphériques lenses: only show sphere (no cylinder, no axis)
			// For Toriques lenses: show sphere, cylinder, and axis
			// Use values directly from printData (already formatted)
			let leftPrescription: string;
			if (leftIsSpherical) {
				// Sphériques: only sphere (already formatted in printData)
				leftPrescription = `P: ${leftSph}`;
			} else {
				// Toriques: sphere, cylinder, and axis (already formatted in printData)
				const leftCylText = leftCyl ? `(${leftCyl})` : '';
				const leftAxisText = leftAxis ? `${leftAxis}°` : '';
				leftPrescription = `P: ${leftSph} ${leftCylText} ${leftAxisText}`.trim();
			}

			page.drawText("OG:", {
				x: col2,
				y,
				size: TEXT_SIZES.normal,
				font: helvetica,
				color: rgb(0, 0, 0),
			});
			page.drawText(leftPrescription, {
				x: col3,
				y,
				size: TEXT_SIZES.normal,
				font: helvetica,
				color: rgb(0, 0, 0),
			});
			y -= LINE_HEIGHTS.normal;

			// R: rayon - only if axis_k exists
			if (leftAxisK) {
				page.drawText(`R: ${leftAxisK} mm`, {
					x: col3,
					y,
					size: TEXT_SIZES.normal,
					font: helvetica,
					color: rgb(0, 0, 0),
				});
				y -= LINE_HEIGHTS.normal;
			}

			// D: diametre - only if diam exists
			if (leftDiam) {
				page.drawText(`D: ${leftDiam} mm`, {
					x: col3,
					y,
					size: TEXT_SIZES.normal,
					font: helvetica,
					color: rgb(0, 0, 0),
				});
				y -= LINE_HEIGHTS.normal;
			}

			y -= LINE_HEIGHTS.normal; // Extra spacing
		}
	}

	// Additional information section
	if (
		(shouldShowRightEye && (rightContactLensType || rightLensBrand)) ||
		(shouldShowLeftEye && (leftContactLensType || leftLensBrand))
	) {
		y -= 15;
		page.drawText('Type de lentilles:', {
			x: LEFT_MARGIN,
			y,
			size: TEXT_SIZES.sectionHeader,
			font: helveticaBold,
			color: rgb(0, 0, 0),
		});
		y -= LINE_HEIGHTS.normal;

		if (shouldShowRightEye && rightContactLensType) {
			page.drawText(`OD: ${rightContactLensType}`, {
				x: LEFT_MARGIN + 20,
				y,
				size: TEXT_SIZES.small,
				font: helvetica,
				color: rgb(0, 0, 0),
			});
			y -= LINE_HEIGHTS.small;
		}

		if (shouldShowLeftEye && leftContactLensType) {
			page.drawText(`OG: ${leftContactLensType}`, {
				x: LEFT_MARGIN + 20,
				y,
				size: TEXT_SIZES.small,
				font: helvetica,
				color: rgb(0, 0, 0),
			});
			y -= LINE_HEIGHTS.small;
		}

		if ((shouldShowRightEye && rightLensType) || (shouldShowLeftEye && leftLensType)) {
			y -= 5;
			page.drawText('Matière:', {
				x: LEFT_MARGIN,
				y,
				size: TEXT_SIZES.sectionHeader,
				font: helveticaBold,
				color: rgb(0, 0, 0),
			});
			y -= LINE_HEIGHTS.normal;

			if (shouldShowRightEye && rightLensType) {
				page.drawText(`OD: ${rightLensType}`, {
					x: LEFT_MARGIN + 20,
					y,
					size: TEXT_SIZES.small,
					font: helvetica,
					color: rgb(0, 0, 0),
				});
				y -= LINE_HEIGHTS.small;
			}

			if (shouldShowLeftEye && leftLensType) {
				page.drawText(`OG: ${leftLensType}`, {
					x: LEFT_MARGIN + 20,
					y,
					size: TEXT_SIZES.small,
					font: helvetica,
					color: rgb(0, 0, 0),
				});
				y -= LINE_HEIGHTS.small;
			}
		}

		if ((shouldShowRightEye && rightLensBrand) || (shouldShowLeftEye && leftLensBrand)) {
			y -= 5;
			page.drawText('Marque:', {
				x: LEFT_MARGIN,
				y,
				size: TEXT_SIZES.sectionHeader,
				font: helveticaBold,
				color: rgb(0, 0, 0),
			});
			y -= LINE_HEIGHTS.normal;

			if (shouldShowRightEye && rightLensBrand) {
				page.drawText(`OD: ${rightLensBrand}`, {
					x: LEFT_MARGIN + 20,
					y,
					size: TEXT_SIZES.small,
					font: helvetica,
					color: rgb(0, 0, 0),
				});
				y -= LINE_HEIGHTS.small;
			}

			if (shouldShowLeftEye && leftLensBrand) {
				page.drawText(`OG: ${leftLensBrand}`, {
					x: LEFT_MARGIN + 20,
					y,
					size: TEXT_SIZES.small,
					font: helvetica,
					color: rgb(0, 0, 0),
				});
				y -= LINE_HEIGHTS.small;
			}
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

	// Track previous source values to update only when source actually changes
	const prevRightSourceRef = React.useRef<{
		sph?: string;
		cyl?: string;
		axis?: string;
		diam?: string;
		axis_k?: string;
		contactLensType?: string;
		lensType?: string;
		lensBrand?: string
	}>({});
	const prevLeftSourceRef = React.useRef<{
		sph?: string;
		cyl?: string;
		axis?: string;
		diam?: string;
		axis_k?: string;
		contactLensType?: string;
		lensType?: string;
		lensBrand?: string
	}>({});

	// Track if component has completed initial mount
	const hasMountedRef = React.useRef(false);

	// Track if saved data was detected on mount (to prevent overwriting it)
	const hasSavedDataRef = React.useRef(false);

	// Track if this is the first time effects are running
	const firstRunRef = React.useRef(true);

	// Initialize on mount
	React.useEffect(() => {
		// Check if printData has saved values (differs from exam data)
		// For contact lenses, we need to detect if data has been CONVERTED (not just filled from exam)
		// Saved data exists if printData is already populated with non-default values
		const hasSavedRightData =
			printData.rightEye.sph !== (rightEyeData?.sph || '') ||
			printData.rightEye.cyl !== (rightEyeData?.cyl || '') ||
			printData.rightEye.axis !== (rightEyeData?.axis || '') ||
			printData.rightEye.diam !== (rightEyeData?.diam || '') ||
			printData.rightEye.axis_k !== (rightEyeData?.axis_k || '') ||
			printData.rightEye.axis_k !== (rightEyeData?.axis_k || '') ||
			printData.rightEye.contactLensType !== (rightEyeData?.contactLensType || '') ||
			printData.rightEye.lensType !== (rightEyeData?.lensType || '') ||
			printData.rightEye.lensBrand !== (rightEyeData?.lensBrand || '');

		const hasSavedLeftData =
			printData.leftEye.sph !== (leftEyeData?.sph || '') ||
			printData.leftEye.cyl !== (leftEyeData?.cyl || '') ||
			printData.leftEye.axis !== (leftEyeData?.axis || '') ||
			printData.leftEye.diam !== (leftEyeData?.diam || '') ||
			printData.leftEye.axis_k !== (leftEyeData?.axis_k || '') ||
			printData.leftEye.axis_k !== (leftEyeData?.axis_k || '') ||
			printData.leftEye.contactLensType !== (leftEyeData?.contactLensType || '') ||
			printData.leftEye.lensType !== (leftEyeData?.lensType || '') ||
			printData.leftEye.lensBrand !== (leftEyeData?.lensBrand || '');

		hasSavedDataRef.current = hasSavedRightData || hasSavedLeftData;

		// Initialize refs with current printData (converted values) to prevent re-conversion
		// This is different from GlassesDocument because contact lens values are CONVERTED
		prevRightSourceRef.current = {
			sph: printData.rightEye.sph || '',
			cyl: printData.rightEye.cyl || '',
			axis: printData.rightEye.axis || '',
			diam: printData.rightEye.diam || '',
			axis_k: printData.rightEye.axis_k || '',
			contactLensType: printData.rightEye.contactLensType || '',
			lensType: printData.rightEye.lensType || '',
			lensBrand: printData.rightEye.lensBrand || '',
		};
		prevLeftSourceRef.current = {
			sph: printData.leftEye.sph || '',
			cyl: printData.leftEye.cyl || '',
			axis: printData.leftEye.axis || '',
			diam: printData.leftEye.diam || '',
			axis_k: printData.leftEye.axis_k || '',
			contactLensType: printData.leftEye.contactLensType || '',
			lensType: printData.leftEye.lensType || '',
			lensBrand: printData.leftEye.lensBrand || '',
		};

		// Mark as mounted after initial setup
		hasMountedRef.current = true;
	}, []);

	// Helper function to format numbers with + sign for positive values
	const formatNumberWithSign = (value: number): string => {
		if (isNaN(value) || !isFinite(value)) return '';
		const formatted = value.toFixed(2);
		return value > 0 ? `+${formatted}` : formatted;
	};

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

	// Right eye: sph/cyl/axis/contactLensType conversion effect (combined because they're interdependent for conversion)
	React.useEffect(() => {
		const currentSph = rightEyeData?.sph || '';
		const currentCyl = rightEyeData?.cyl || '';
		const currentAxis = rightEyeData?.axis || '';
		const currentType = rightEyeData?.contactLensType || '';

		const prevSph = prevRightSourceRef.current.sph ?? '';
		const prevCyl = prevRightSourceRef.current.cyl ?? '';
		const prevAxis = prevRightSourceRef.current.axis ?? '';
		const prevType = prevRightSourceRef.current.contactLensType ?? '';

		// Only update if something actually changed
		if (currentSph === prevSph && currentCyl === prevCyl && currentAxis === prevAxis && currentType === prevType) return;

		// Update refs
		prevRightSourceRef.current.sph = currentSph;
		prevRightSourceRef.current.cyl = currentCyl;
		prevRightSourceRef.current.axis = currentAxis;
		prevRightSourceRef.current.contactLensType = currentType;

		// Async conversion
		const updateAsync = async () => {
			const isSpherical = currentType === 'Sphérique';

			if (currentSph || currentCyl || currentAxis) {
				const sphNum = parseFloat(currentSph || '0');
				const cylNum = parseFloat(currentCyl || '0');
				const axisNum = parseFloat(currentAxis || '0');

				// Only convert if we have valid numbers
				if (!isNaN(sphNum) && !isNaN(cylNum) && !isNaN(axisNum)) {
					const converted = await lentilleService.convertToContactLens(
						sphNum,
						cylNum,
						axisNum,
						currentType
					);

					// Check if conversion returned valid numbers
					if (converted && !isNaN(converted.sphere) && isFinite(converted.sphere)) {
						setPrintData((prev) => ({
							...prev,
							rightEye: {
								...prev.rightEye,
								sph: formatNumberWithSign(converted.sphere),
								cyl: isSpherical ? '' : (converted.cylinder && !isNaN(converted.cylinder) && isFinite(converted.cylinder) ? formatNumberWithSign(converted.cylinder) : ''),
								axis: isSpherical ? '' : (converted.axis ? converted.axis.toString() : ''),
								contactLensType: currentType,
							},
						}));
					} else {
						// Fallback to original values if conversion fails
						setPrintData((prev) => ({
							...prev,
							rightEye: {
								...prev.rightEye,
								sph: currentSph,
								cyl: isSpherical ? '' : currentCyl,
								axis: isSpherical ? '' : currentAxis,
								contactLensType: currentType,
							},
						}));
					}
				} else {
					// Invalid input, use original values
					setPrintData((prev) => ({
						...prev,
						rightEye: {
							...prev.rightEye,
							sph: currentSph,
							cyl: isSpherical ? '' : currentCyl,
							axis: isSpherical ? '' : currentAxis,
							contactLensType: currentType,
						},
					}));
				}
			} else {
				setPrintData((prev) => ({
					...prev,
					rightEye: {
						...prev.rightEye,
						sph: currentSph,
						cyl: isSpherical ? '' : currentCyl,
						axis: isSpherical ? '' : currentAxis,
						contactLensType: currentType,
					},
				}));
			}
		};
		updateAsync();
	}, [rightEyeData?.sph, rightEyeData?.cyl, rightEyeData?.axis, rightEyeData?.contactLensType]);

	// Left eye: sph/cyl/axis/contactLensType conversion effect (combined because they're interdependent for conversion)
	React.useEffect(() => {

		const currentSph = leftEyeData?.sph || '';
		const currentCyl = leftEyeData?.cyl || '';
		const currentAxis = leftEyeData?.axis || '';
		const currentType = leftEyeData?.contactLensType || '';

		const prevSph = prevLeftSourceRef.current.sph ?? '';
		const prevCyl = prevLeftSourceRef.current.cyl ?? '';
		const prevAxis = prevLeftSourceRef.current.axis ?? '';
		const prevType = prevLeftSourceRef.current.contactLensType ?? '';

		// Only update if something actually changed
		if (currentSph === prevSph && currentCyl === prevCyl && currentAxis === prevAxis && currentType === prevType) return;

		// Update refs
		prevLeftSourceRef.current.sph = currentSph;
		prevLeftSourceRef.current.cyl = currentCyl;
		prevLeftSourceRef.current.axis = currentAxis;
		prevLeftSourceRef.current.contactLensType = currentType;

		// Async conversion
		const updateAsync = async () => {
			const isSpherical = currentType === 'Sphérique';

			if (currentSph || currentCyl || currentAxis) {
				const sphNum = parseFloat(currentSph || '0');
				const cylNum = parseFloat(currentCyl || '0');
				const axisNum = parseFloat(currentAxis || '0');

				// Only convert if we have valid numbers
				if (!isNaN(sphNum) && !isNaN(cylNum) && !isNaN(axisNum)) {
					const converted = await lentilleService.convertToContactLens(
						sphNum,
						cylNum,
						axisNum,
						currentType
					);

					// Check if conversion returned valid numbers
					if (converted && !isNaN(converted.sphere) && isFinite(converted.sphere)) {
						setPrintData((prev) => ({
							...prev,
							leftEye: {
								...prev.leftEye,
								sph: formatNumberWithSign(converted.sphere),
								cyl: isSpherical ? '' : (converted.cylinder && !isNaN(converted.cylinder) && isFinite(converted.cylinder) ? formatNumberWithSign(converted.cylinder) : ''),
								axis: isSpherical ? '' : (converted.axis ? converted.axis.toString() : ''),
								contactLensType: currentType,
							},
						}));
					} else {
						// Fallback to original values if conversion fails
						setPrintData((prev) => ({
							...prev,
							leftEye: {
								...prev.leftEye,
								sph: currentSph,
								cyl: isSpherical ? '' : currentCyl,
								axis: isSpherical ? '' : currentAxis,
								contactLensType: currentType,
							},
						}));
					}
				} else {
					// Invalid input, use original values
					setPrintData((prev) => ({
						...prev,
						leftEye: {
							...prev.leftEye,
							sph: currentSph,
							cyl: isSpherical ? '' : currentCyl,
							axis: isSpherical ? '' : currentAxis,
							contactLensType: currentType,
						},
					}));
				}
			} else {
				setPrintData((prev) => ({
					...prev,
					leftEye: {
						...prev.leftEye,
						sph: currentSph,
						cyl: isSpherical ? '' : currentCyl,
						axis: isSpherical ? '' : currentAxis,
						contactLensType: currentType,
					},
				}));
			}
		};
		updateAsync();
	}, [leftEyeData?.sph, leftEyeData?.cyl, leftEyeData?.axis, leftEyeData?.contactLensType]);

	// Right eye: diam
	React.useEffect(() => {
		const current = rightEyeData?.diam || '';
		const previous = prevRightSourceRef.current.diam ?? '';
		if (current === previous) return;
		prevRightSourceRef.current.diam = current;
		setPrintData((prev) => (prev.rightEye.diam === current ? prev : { ...prev, rightEye: { ...prev.rightEye, diam: current } }));
	}, [rightEyeData?.diam]);

	// Right eye: axis_k (from rayon/R0)
	React.useEffect(() => {
		// Use rayon if available, otherwise use axis_k
		const current = rightEyeData?.rayon || rightEyeData?.axis_k || '';
		const previous = prevRightSourceRef.current.axis_k ?? '';
		if (current === previous) return;
		prevRightSourceRef.current.axis_k = current;
		setPrintData((prev) => (prev.rightEye.axis_k === current ? prev : { ...prev, rightEye: { ...prev.rightEye, axis_k: current } }));
	}, [rightEyeData?.rayon, rightEyeData?.axis_k]);

	// Right eye: lensBrand
	React.useEffect(() => {
		const current = rightEyeData?.lensBrand || '';
		const previous = prevRightSourceRef.current.lensBrand ?? '';
		if (current === previous) return;
		prevRightSourceRef.current.lensBrand = current;
		setPrintData((prev) => (prev.rightEye.lensBrand === current ? prev : { ...prev, rightEye: { ...prev.rightEye, lensBrand: current } }));
	}, [rightEyeData?.lensBrand]);

	// Right eye: lensType
	React.useEffect(() => {
		const current = rightEyeData?.lensType || '';
		const previous = prevRightSourceRef.current.lensType ?? '';
		if (current === previous) return;
		prevRightSourceRef.current.lensType = current;
		setPrintData((prev) => (prev.rightEye.lensType === current ? prev : { ...prev, rightEye: { ...prev.rightEye, lensType: current } }));
	}, [rightEyeData?.lensType]);

	// Left eye: diam
	React.useEffect(() => {
		const current = leftEyeData?.diam || '';
		const previous = prevLeftSourceRef.current.diam ?? '';
		if (current === previous) return;
		prevLeftSourceRef.current.diam = current;
		setPrintData((prev) => (prev.leftEye.diam === current ? prev : { ...prev, leftEye: { ...prev.leftEye, diam: current } }));
	}, [leftEyeData?.diam]);

	// Left eye: axis_k (from rayon/R0)
	React.useEffect(() => {
		// Use rayon if available, otherwise use axis_k
		const current = leftEyeData?.rayon || leftEyeData?.axis_k || '';
		const previous = prevLeftSourceRef.current.axis_k ?? '';
		if (current === previous) return;
		prevLeftSourceRef.current.axis_k = current;
		setPrintData((prev) => (prev.leftEye.axis_k === current ? prev : { ...prev, leftEye: { ...prev.leftEye, axis_k: current } }));
	}, [leftEyeData?.rayon, leftEyeData?.axis_k]);

	// Left eye: lensBrand
	React.useEffect(() => {
		const current = leftEyeData?.lensBrand || '';
		const previous = prevLeftSourceRef.current.lensBrand ?? '';
		if (current === previous) return;
		prevLeftSourceRef.current.lensBrand = current;
		setPrintData((prev) => (prev.leftEye.lensBrand === current ? prev : { ...prev, leftEye: { ...prev.leftEye, lensBrand: current } }));
	}, [leftEyeData?.lensBrand]);

	// Left eye: lensType
	React.useEffect(() => {
		const current = leftEyeData?.lensType || '';
		const previous = prevLeftSourceRef.current.lensType ?? '';
		if (current === previous) return;
		prevLeftSourceRef.current.lensType = current;
		setPrintData((prev) => (prev.leftEye.lensType === current ? prev : { ...prev, leftEye: { ...prev.leftEye, lensType: current } }));
	}, [leftEyeData?.lensType]);

	// Determine if eyes are spherical
	const rightIsSpherical = (printData.rightEye?.contactLensType || '') === 'Sphérique';
	const leftIsSpherical = (printData.leftEye?.contactLensType || '') === 'Sphérique';

	// Clear cylinder and axis when lens type changes to Sphérique
	React.useEffect(() => {
		if (rightIsSpherical) {
			setPrintData((prev) => ({
				...prev,
				rightEye: {
					...prev.rightEye,
					cyl: '',
					axis: '',
				},
			}));
		}
	}, [rightIsSpherical]);

	React.useEffect(() => {
		if (leftIsSpherical) {
			setPrintData((prev) => ({
				...prev,
				leftEye: {
					...prev.leftEye,
					cyl: '',
					axis: '',
				},
			}));
		}
	}, [leftIsSpherical]);

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
