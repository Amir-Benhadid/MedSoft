import React, { useCallback, useEffect, useRef, memo } from 'react';
import { PDFDocument, PDFPage, rgb } from 'pdf-lib';
import { PdfGenerationContext, drawTitle, drawDocumentHeader } from './PdfUtils';
import { DocumentUtils } from './DocumentUtils';
import { cn } from '@/ui/lib/utils';
import { useDocumentForm } from './hooks/useDocumentForm';

import { Checkbox } from '@/ui/components/ui/checkbox';
import { Input } from '@/ui/components/ui/input';
import { Label } from '@/ui/components/ui/label';
import { Textarea } from '@/ui/components/ui/textarea';
import { Card, CardContent } from '@/ui/components/ui/card';

// Types
interface EyeData {
	visualAcuityVL_SC?: string;
	visualAcuity?: string;
	visualAcuityVL_AC?: string;
}

interface ReportData {
	conclusion?: string;
	antecedents?: string;
	generalMedicalHistory?: string;
	ophthalmologicalHistory?: string;
	inspection?: string;
	segmentAnterieur?: string;
	fondOeil?: string;
	visualAcuityVL_SC_OD?: string;
	visualAcuityVL_SC_OG?: string;
	visualAcuityVL_AC_OD?: string;
	visualAcuityVL_AC_OG?: string;
	// Print-specific overrides
	printVisualAcuityVL_SC_OD?: string;
	printVisualAcuityVL_SC_OG?: string;
	printVisualAcuityVL_AC_OD?: string;
	printVisualAcuityVL_AC_OG?: string;
	// Tonometry fields
	tonometryOD?: string;
	tonometryOG?: string;
	// Custom fields for additional content
	customTitle?: string;
	customText?: string;
}

interface DetailedClinicalExam {
	generalMedicalHistory?: string;
	ophthalmologicalHistory?: string;
	inspection?: string;
	anteriorSegment?: {
		slit_lamp_exam?: string;
	};
	fundus?: {
		fundus_exam?: string;
	};
	diagnosis?: string;
}

interface PrintControlFlags {
	includeVisualAcuityWithoutCorrection: boolean;
	includeVisualAcuityWithCorrection: boolean;
	includeTonometry: boolean;
}

interface ReportDocumentProps { }

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
	header: 18,
	tiny: 10,
};


// PDF Generation Function
export const generateReportPDF = async (
	context: PdfGenerationContext,
	patient: { surname: string; name: string; dob: string },
	rightEye?: EyeData,
	leftEye?: EyeData,
	detailedClinicalExam?: DetailedClinicalExam,
	tonometrie?: any,
	reportData?: ReportData,
	printControlFlags?: {
		includeVisualAcuityWithoutCorrection: boolean;
		includeVisualAcuityWithCorrection: boolean;
		includeTonometry: boolean;
		includeGlassType: boolean;
	}
): Promise<Uint8Array> => {
	const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN, LINE_HEIGHTS } = context;

	// Override TEXT_SIZES to be one size smaller for ReportDocument (except header which stays larger)
	const originalTextSizes = context.TEXT_SIZES;
	context.TEXT_SIZES = {
		...originalTextSizes,
		title: 9, // was 10
		header: 11, // Keep header same size (patient name/age) - already increased in PdfUtils
		sectionHeader: 9, // was 10
		normal: 10, // was 11
		small: 8, // was 9
		tiny: 7, // was 8
	};

	// Use the modified context for all drawing operations
	const TEXT_SIZES = context.TEXT_SIZES;

	let y = drawTitle(context, 'COMPTE-RENDU', drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

	// Antécédents and custom title data
	const generalHistory =
		reportData?.generalMedicalHistory ||
		detailedClinicalExam?.generalMedicalHistory;
	const ophthalmologicalHistory =
		reportData?.ophthalmologicalHistory ||
		detailedClinicalExam?.ophthalmologicalHistory;
	const customTitleValue = DocumentUtils.formatFieldDisplay(reportData?.customTitle);

	// Main statement - single sentence with age
	const patientAge = DocumentUtils.calculateAge(patient.dob);
	const ageText = patientAge === 1 ? '1 an' : `${patientAge} ans`;
	const mainStatementText = `Le(a) patient(e) sus-nommé(e) âgé(e) de ${ageText} présente à l'examen du jour:`;

	const mainStatementWidth = width - LEFT_MARGIN - RIGHT_MARGIN + 20;
	const availableWidth = width - LEFT_MARGIN - RIGHT_MARGIN - 20; // For use in other sections
	const mainStatementLines = DocumentUtils.splitTextIntoLinesOptimized(
		mainStatementText,
		mainStatementWidth
	);

	mainStatementLines.forEach((line) => {
		page.drawText(line, {
			x: LEFT_MARGIN,
			y,
			size: TEXT_SIZES.sectionHeader,
			font: helvetica,
			color: rgb(0, 0, 0),
		});
		y -= LINE_HEIGHTS.normal;
	});

	// Antécédents section - not bold
	if (generalHistory || ophthalmologicalHistory) {
		// Combine both histories if both exist
		const antecedentsText = generalHistory && ophthalmologicalHistory
			? `${generalHistory}, ${ophthalmologicalHistory}`
			: generalHistory || ophthalmologicalHistory || '';

		if (antecedentsText) {
			const lineText = `Antécédents : ${antecedentsText}`;
			const antecedentsLines = DocumentUtils.splitTextIntoLinesOptimized(
				lineText,
				availableWidth
			);
			antecedentsLines.forEach((line) => {
				page.drawText(line, {
					x: LEFT_MARGIN,
					y,
					size: TEXT_SIZES.normal,
					font: helvetica,
					color: rgb(0, 0, 0),
				});
				y -= LINE_HEIGHTS.normal;
			});
		}
	}

	// Inspection - only show if not empty
	const inspectionValue = DocumentUtils.formatFieldDisplay(reportData?.inspection);
	if (!DocumentUtils.isEmptyField(inspectionValue)) {
		const inspection = `Inspection : ${inspectionValue}`;

		const availableWidth = width - LEFT_MARGIN - RIGHT_MARGIN - 20; // 40 for indentation
		const inspectionLines = DocumentUtils.splitTextIntoLinesOptimized(
			inspection,
			availableWidth
		);
		inspectionLines.forEach((line) => {
			page.drawText(line, {
				x: LEFT_MARGIN,
				y,
				size: TEXT_SIZES.normal,
				font: helvetica,
				color: rgb(0, 0, 0),
			});
			y -= LINE_HEIGHTS.normal;
		});
	}

	// Acuité visuelle sans correction with inline OD/OG - conditional
	if (printControlFlags?.includeVisualAcuityWithoutCorrection !== false) {
		const avscOD = DocumentUtils.formatFieldDisplay(
			reportData?.printVisualAcuityVL_SC_OD || reportData?.visualAcuityVL_SC_OD || rightEye?.visualAcuityVL_SC || rightEye?.visualAcuity
		);
		const avscOG = DocumentUtils.formatFieldDisplay(
			reportData?.printVisualAcuityVL_SC_OG || reportData?.visualAcuityVL_SC_OG || leftEye?.visualAcuityVL_SC || leftEye?.visualAcuity
		);

		// Only show section if at least one eye has data
		if (!DocumentUtils.isEmptyField(avscOD) || !DocumentUtils.isEmptyField(avscOG)) {
			page.drawText('Acuité visuelle sans correction :', {
				x: LEFT_MARGIN,
				y,
				size: TEXT_SIZES.sectionHeader,
				font: helveticaBold,
				color: rgb(0, 0, 0),
			});
			y -= LINE_HEIGHTS.normal;

			const usableWidth = width - LEFT_MARGIN - RIGHT_MARGIN - 200; // Reserve space for padding
			const visibleColumns: string[] = [];
			if (!DocumentUtils.isEmptyField(avscOD)) visibleColumns.push('OD');
			if (!DocumentUtils.isEmptyField(avscOG)) visibleColumns.push('OG');

			const columnWidth = visibleColumns.length > 0 ? usableWidth / visibleColumns.length : usableWidth;
			let currentX = LEFT_MARGIN + 50;

			if (!DocumentUtils.isEmptyField(avscOD)) {
				page.drawText(`OD: ${avscOD}`, {
					x: currentX,
					y,
					size: TEXT_SIZES.normal,
					font: helvetica,
					color: rgb(0, 0, 0),
				});
				currentX += columnWidth;
			}

			if (!DocumentUtils.isEmptyField(avscOG)) {
				page.drawText(`OG: ${avscOG}`, {
					x: currentX,
					y,
					size: TEXT_SIZES.normal,
					font: helvetica,
					color: rgb(0, 0, 0),
				});
			}
			y -= LINE_HEIGHTS.normal;
		}
	}

	// Acuité visuelle avec correction with inline OD/OG - conditional
	if (printControlFlags?.includeVisualAcuityWithCorrection !== false) {
		const avacOD = DocumentUtils.formatFieldDisplay(
			reportData?.printVisualAcuityVL_AC_OD || reportData?.visualAcuityVL_AC_OD || rightEye?.visualAcuityVL_AC
		);
		const avacOG = DocumentUtils.formatFieldDisplay(
			reportData?.printVisualAcuityVL_AC_OG || reportData?.visualAcuityVL_AC_OG || leftEye?.visualAcuityVL_AC
		);

		// Only show section if at least one eye has data
		if (!DocumentUtils.isEmptyField(avacOD) || !DocumentUtils.isEmptyField(avacOG)) {
			page.drawText('Acuité visuelle avec correction :', {
				x: LEFT_MARGIN,
				y,
				size: TEXT_SIZES.sectionHeader,
				font: helveticaBold,
				color: rgb(0, 0, 0),
			});
			y -= LINE_HEIGHTS.normal;

			const usableWidth = width - LEFT_MARGIN - RIGHT_MARGIN - 200; // Reserve space for padding
			const visibleColumns: string[] = [];
			if (!DocumentUtils.isEmptyField(avacOD)) visibleColumns.push('OD');
			if (!DocumentUtils.isEmptyField(avacOG)) visibleColumns.push('OG');

			const columnWidth = visibleColumns.length > 0 ? usableWidth / visibleColumns.length : usableWidth;
			let currentX = LEFT_MARGIN + 50;

			if (!DocumentUtils.isEmptyField(avacOD)) {
				page.drawText(`OD: ${avacOD}`, {
					x: currentX,
					y,
					size: TEXT_SIZES.normal,
					font: helvetica,
					color: rgb(0, 0, 0),
				});
				currentX += columnWidth;
			}

			if (!DocumentUtils.isEmptyField(avacOG)) {
				page.drawText(`OG: ${avacOG}`, {
					x: currentX,
					y,
					size: TEXT_SIZES.normal,
					font: helvetica,
					color: rgb(0, 0, 0),
				});
			}
			y -= LINE_HEIGHTS.normal;
		}
	}

	// Custom title and text content - title before text, not bold
	const customTextValue = DocumentUtils.formatFieldDisplay(reportData?.customText);

	if (customTitleValue || customTextValue) {
		// Build the line: "[custom title] : [custom text]" or just title or just text
		let lineText = '';
		if (customTitleValue && customTextValue) {
			lineText = `${customTitleValue} : ${customTextValue}`;
		} else if (customTitleValue) {
			lineText = customTitleValue;
		} else if (customTextValue) {
			lineText = customTextValue;
		}

		if (lineText) {
			const customLines = DocumentUtils.splitTextIntoLinesOptimized(
				lineText,
				availableWidth
			);
			customLines.forEach((line) => {
				page.drawText(line, {
					x: LEFT_MARGIN,
					y,
					size: TEXT_SIZES.normal,
					font: helvetica,
					color: rgb(0, 0, 0),
				});
				y -= LINE_HEIGHTS.normal;
			});
		}
	}

	// Tonométrie (PIO corrigée) - conditional based on checkbox
	if (printControlFlags?.includeTonometry !== false) {
		const getCorrectedIOP = (eye: 'right' | 'left'): string => {
			const eyeData = tonometrie?.[eye === 'right' ? 'right_eye' : 'left_eye'];

			// If corrected IOP already exists, use it
			if (eyeData?.corrected_iop) {
				return eyeData.corrected_iop;
			}

			// Otherwise calculate it if we have IOP and pachymetry
			if (eyeData?.iop && eyeData?.pachymetry) {
				const pioNum = parseFloat(eyeData.iop);
				const pachyNum = parseFloat(eyeData.pachymetry);
				if (!isNaN(pioNum) && !isNaN(pachyNum)) {
					// Apply formula: PIO corrigée = PIO mesurée – (CCT – 545)/50 × 2,5 mmHg
					const corrected = pioNum - (pachyNum - 545) / 50 * 2.5;
					return corrected.toFixed(1);
				}
			}

			return '';
		};

		const pioCorrigeeOD = DocumentUtils.formatFieldDisplay(reportData?.tonometryOD || getCorrectedIOP('right'));
		const pioCorrigeeOG = DocumentUtils.formatFieldDisplay(reportData?.tonometryOG || getCorrectedIOP('left'));

		// Only show section if at least one eye has tonometry data
		if (!DocumentUtils.isEmptyField(pioCorrigeeOD) || !DocumentUtils.isEmptyField(pioCorrigeeOG)) {
			page.drawText('Tonométrie :', {
				x: LEFT_MARGIN,
				y,
				size: TEXT_SIZES.sectionHeader,
				font: helvetica,
				color: rgb(0, 0, 0),
			});
			y -= LINE_HEIGHTS.normal;

			const usableWidth = width - LEFT_MARGIN - RIGHT_MARGIN;
			const visibleColumns: string[] = [];
			if (!DocumentUtils.isEmptyField(pioCorrigeeOD)) visibleColumns.push('OD');
			if (!DocumentUtils.isEmptyField(pioCorrigeeOG)) visibleColumns.push('OG');

			// Use fixed spacing between columns (150 points) instead of dividing width
			const columnSpacing = 150;
			let currentX = LEFT_MARGIN;

			if (!DocumentUtils.isEmptyField(pioCorrigeeOD)) {
				page.drawText(`OD: ${pioCorrigeeOD} mmHg`, {
					x: currentX,
					y,
					size: TEXT_SIZES.normal,
					font: helvetica,
					color: rgb(0, 0, 0),
				});
				currentX += columnSpacing;
			}

			if (!DocumentUtils.isEmptyField(pioCorrigeeOG)) {
				page.drawText(`OG: ${pioCorrigeeOG} mmHg`, {
					x: currentX,
					y,
					size: TEXT_SIZES.normal,
					font: helvetica,
					color: rgb(0, 0, 0),
				});
			}
			y -= LINE_HEIGHTS.normal;
		}
	}

	// Segment antérieur - only show if not empty
	const segmentAnterieurValue = DocumentUtils.formatFieldDisplay(reportData?.segmentAnterieur);
	if (!DocumentUtils.isEmptyField(segmentAnterieurValue)) {
		const segmentAnterieur = `Ségment antérieur : ${segmentAnterieurValue}`;
		const segmentAnterieurLines = DocumentUtils.splitTextIntoLinesOptimized(
			segmentAnterieur,
			availableWidth
		);
		segmentAnterieurLines.forEach((line) => {
			page.drawText(line, {
				x: LEFT_MARGIN,
				y,
				size: TEXT_SIZES.normal,
				font: helvetica,
				color: rgb(0, 0, 0),
			});
			y -= LINE_HEIGHTS.normal;
		});
	}

	// FO (Fond d'œil) - only show if not empty
	const fondOeilValue = DocumentUtils.formatFieldDisplay(reportData?.fondOeil || detailedClinicalExam?.fundus?.fundus_exam);
	if (!DocumentUtils.isEmptyField(fondOeilValue)) {
		const fondOeil = `F.O : ${fondOeilValue}`;
		const fondOeilLines = DocumentUtils.splitTextIntoLinesOptimized(
			fondOeil,
			availableWidth
		);
		fondOeilLines.forEach((line) => {
			page.drawText(line, {
				x: LEFT_MARGIN,
				y,
				size: TEXT_SIZES.normal,
				font: helvetica,
				color: rgb(0, 0, 0),
			});
			y -= LINE_HEIGHTS.normal;
		});
	}


	// Conclusion - only show if not empty
	const conclusionValue = DocumentUtils.formatFieldDisplay(reportData?.conclusion || detailedClinicalExam?.diagnosis);
	if (!DocumentUtils.isEmptyField(conclusionValue)) {
		const conclusion = `Conclusion : ${conclusionValue}`;
		const conclusionLines = DocumentUtils.splitTextIntoLinesOptimized(
			conclusion,
			availableWidth
		);
		conclusionLines.forEach((line) => {
			page.drawText(line, {
				x: LEFT_MARGIN,
				y,
				size: TEXT_SIZES.normal,
				font: helvetica,
				color: rgb(0, 0, 0),
			});
			y -= LINE_HEIGHTS.normal;
		});
	}

	// Restore original TEXT_SIZES to avoid side effects
	context.TEXT_SIZES = originalTextSizes;

	const pdfBytes = await context.pdfDoc.save();
	return pdfBytes;
};

// UI Component
const ReportDocument: React.FC<ReportDocumentProps> = () => {
	// Get form data from hook
	const {
		rightEyeData,
		leftEyeData,
		reportData,
		setReportData,
		detailedClinicalExam,
		printControlFlags,
		setPrintControlFlags,
		tonometrie,
	} = useDocumentForm();

	// Calculate corrected IOP
	const getCorrectedIOP = useCallback((eye: 'left' | 'right'): string => {
		if (!tonometrie) {
			// Fallback to eye data if tonometrie not available
			const eyeData = eye === 'right' ? rightEyeData : leftEyeData;
			if (eyeData?.corrected_iop) return eyeData.corrected_iop;
			if (eyeData?.tension && eyeData?.pachymetry) {
				const pioNum = parseFloat(eyeData.tension);
				const pachyNum = parseFloat(eyeData.pachymetry);
				if (!isNaN(pioNum) && !isNaN(pachyNum)) {
					const corrected = pioNum - (pachyNum - 545) / 50 * 2.5;
					return corrected.toFixed(1);
				}
			}
			return '';
		}
		const eyeData = tonometrie[eye === 'right' ? 'right_eye' : 'left_eye'];
		if (eyeData?.corrected_iop) {
			return eyeData.corrected_iop;
		}
		if (eyeData?.iop && eyeData?.pachymetry) {
			const pioNum = parseFloat(eyeData.iop);
			const pachyNum = parseFloat(eyeData.pachymetry);
			if (!isNaN(pioNum) && !isNaN(pachyNum)) {
				// Apply formula: PIO corrigée = PIO mesurée – (CCT – 545)/50 × 2,5 mmHg
				const corrected = pioNum - (pachyNum - 545) / 50 * 2.5;
				return corrected.toFixed(1);
			}
		}
		return '';
	}, [tonometrie, rightEyeData, leftEyeData]);
	// Track previous source values to detect when clinical exam changes
	// Similar to GlassesDocument pattern - only auto-update if reportData hasn't been manually edited
	const prevSourceRef = useRef<{
		inspection?: string;
		segmentAnterieur?: string;
		fondOeil?: string;
		conclusion?: string;
		generalMedicalHistory?: string;
		ophthalmologicalHistory?: string;
	}>({});

	// Track if component has mounted and if saved data exists
	const hasMountedRef = useRef(false);
	const hasSavedDataRef = useRef(false);

	// Initialize on mount and sync initial values
	useEffect(() => {
		if (reportData.inspection || reportData.segmentAnterieur || reportData.fondOeil ||
			reportData.conclusion || reportData.generalMedicalHistory || reportData.ophthalmologicalHistory) {
			hasSavedDataRef.current = true;
		}

		hasMountedRef.current = true;
	}, []);

	// Helper function to merge tag-based fields (comma-separated values)
	// Preserves manual additions in document, syncs changes from clinical exam
	const mergeTags = useCallback((newSourceTags: string, previousSourceTags: string, currentDocumentTags: string): string => {
		const newSourceList = newSourceTags.split(',').map(s => s.trim()).filter(Boolean);
		const previousSourceList = previousSourceTags.split(',').map(s => s.trim()).filter(Boolean);
		const currentDocumentList = currentDocumentTags.split(',').map(s => s.trim()).filter(Boolean);

		// Identify manual additions: tags in document that weren't in previous source
		const manualAdditions = currentDocumentList.filter(tag =>
			!previousSourceList.some(st => st.toLowerCase() === tag.toLowerCase())
		);

		// Start with manual additions
		const merged = [...manualAdditions];

		// Add all tags from new source
		newSourceList.forEach(tag => {
			if (!merged.some(t => t.toLowerCase() === tag.toLowerCase())) {
				merged.push(tag);
			}
		});

		return merged.join(', ');
	}, []);

	// Auto-sync inspection (plain text field - replace behavior)
	useEffect(() => {
		if (!hasMountedRef.current && hasSavedDataRef.current) return;
		if (!detailedClinicalExam) return;

		const current = detailedClinicalExam.inspection || '';
		const previous = prevSourceRef.current.inspection ?? '';
		if (current === previous) return;

		setReportData((prev) => {
			const prevValue = prev.inspection || '';
			// Only replace if reportData matches previous source (not manually edited)
			if (prevValue === previous || (!previous && !prevValue)) {
				prevSourceRef.current.inspection = current;
				return prev.inspection === current ? prev : { ...prev, inspection: current };
			}
			// If manually edited, don't overwrite
			prevSourceRef.current.inspection = current;
			return prev;
		});
	}, [detailedClinicalExam?.inspection, setReportData]);

	// Auto-sync segment antérieur (tag-based field - always merge tags)
	useEffect(() => {
		if (!hasMountedRef.current && hasSavedDataRef.current) return;
		if (!detailedClinicalExam) return;

		const current = detailedClinicalExam.anteriorSegment?.slit_lamp_exam || '';
		const previous = prevSourceRef.current.segmentAnterieur ?? '';
		if (current === previous) return;

		setReportData((prev) => {
			const prevValue = prev.segmentAnterieur || '';
			// Merge tags: preserve manual additions, sync changes from clinical exam
			const merged = mergeTags(current, previous, prevValue);
			prevSourceRef.current.segmentAnterieur = current;
			return prev.segmentAnterieur === merged ? prev : { ...prev, segmentAnterieur: merged };
		});
	}, [detailedClinicalExam?.anteriorSegment?.slit_lamp_exam, setReportData]);

	// Auto-sync fond d'œil (plain text field - replace behavior)
	useEffect(() => {
		if (!hasMountedRef.current && hasSavedDataRef.current) return;
		if (!detailedClinicalExam) return;

		const current = detailedClinicalExam.fundus?.fundus_exam || '';
		const previous = prevSourceRef.current.fondOeil ?? '';
		if (current === previous) return;

		setReportData((prev) => {
			const prevValue = prev.fondOeil || '';
			// Only replace if reportData matches previous source (not manually edited)
			if (prevValue === previous || (!previous && !prevValue)) {
				prevSourceRef.current.fondOeil = current;
				return prev.fondOeil === current ? prev : { ...prev, fondOeil: current };
			}
			// If manually edited, don't overwrite
			prevSourceRef.current.fondOeil = current;
			return prev;
		});
	}, [detailedClinicalExam?.fundus?.fundus_exam, setReportData]);

	// Auto-sync conclusion (diagnosis) - tag-based field (always merge tags)
	useEffect(() => {
		if (!hasMountedRef.current && hasSavedDataRef.current) return;
		if (!detailedClinicalExam) return;

		const current = detailedClinicalExam.diagnosis || '';
		const previous = prevSourceRef.current.conclusion ?? '';
		if (current === previous) return;

		setReportData((prev) => {
			const prevValue = prev.conclusion || '';
			// Merge tags: preserve manual additions, sync changes from clinical exam
			const merged = mergeTags(current, previous, prevValue);
			prevSourceRef.current.conclusion = current;
			return prev.conclusion === merged ? prev : { ...prev, conclusion: merged };
		});
	}, [detailedClinicalExam?.diagnosis, setReportData]);

	// Auto-sync generalMedicalHistory
	useEffect(() => {
		if (!hasMountedRef.current && hasSavedDataRef.current) return;
		if (!detailedClinicalExam) return;

		const current = detailedClinicalExam.generalMedicalHistory || '';
		const previous = prevSourceRef.current.generalMedicalHistory ?? '';
		if (current === previous) return;

		setReportData((prev) => {
			const prevValue = prev.generalMedicalHistory || '';
			if (prevValue === previous || (!previous && !prevValue)) {
				prevSourceRef.current.generalMedicalHistory = current;
				return prev.generalMedicalHistory === current ? prev : { ...prev, generalMedicalHistory: current };
			}
			prevSourceRef.current.generalMedicalHistory = current;
			return prev;
		});
	}, [detailedClinicalExam?.generalMedicalHistory, setReportData]);

	// Auto-sync ophthalmologicalHistory
	useEffect(() => {
		if (!hasMountedRef.current && hasSavedDataRef.current) return;
		if (!detailedClinicalExam) return;

		const current = detailedClinicalExam.ophthalmologicalHistory || '';
		const previous = prevSourceRef.current.ophthalmologicalHistory ?? '';
		if (current === previous) return;

		setReportData((prev) => {
			const prevValue = prev.ophthalmologicalHistory || '';
			if (prevValue === previous || (!previous && !prevValue)) {
				prevSourceRef.current.ophthalmologicalHistory = current;
				return prev.ophthalmologicalHistory === current ? prev : { ...prev, ophthalmologicalHistory: current };
			}
			prevSourceRef.current.ophthalmologicalHistory = current;
			return prev;
		});
	}, [detailedClinicalExam?.ophthalmologicalHistory, setReportData]);

	// Optimized handler for report data changes
	const handleReportDataChange = useCallback(
		(field: keyof typeof reportData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			const value = e.target.value;
			setReportData((prev) => ({
				...prev,
				[field]: value,
			}));
		},
		[setReportData]
	);

	return (
		<div className="space-y-3 font-sans text-sm pb-4">
			{/* Print Control Options */}
			<div className="bg-card rounded-xl p-2.5 border border-border shadow-sm">
				<div className="flex flex-wrap gap-3 items-center">
					<div className="flex items-center space-x-2">
						<Checkbox
							id="include-uncorrected"
							checked={printControlFlags.includeVisualAcuityWithoutCorrection}
							onCheckedChange={(checked) =>
								setPrintControlFlags((prev) => ({
									...prev,
									includeVisualAcuityWithoutCorrection: checked === true,
								}))
							}
							className="data-[state=checked]:bg-slate-800 data-[state=checked]:border-slate-800 border-slate-300"
						/>
						<Label htmlFor="include-uncorrected" className="text-[10px] font-semibold text-slate-600 uppercase tracking-tight cursor-pointer hover:text-slate-900 transition-colors">
							Sans correction
						</Label>
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox
							id="include-corrected"
							checked={printControlFlags.includeVisualAcuityWithCorrection}
							onCheckedChange={(checked) =>
								setPrintControlFlags((prev) => ({
									...prev,
									includeVisualAcuityWithCorrection: checked === true,
								}))
							}
							className="data-[state=checked]:bg-slate-800 data-[state=checked]:border-slate-800 border-slate-300"
						/>
						<Label htmlFor="include-corrected" className="text-[10px] font-semibold text-slate-600 uppercase tracking-tight cursor-pointer hover:text-slate-900 transition-colors">
							Avec correction
						</Label>
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox
							id="include-tonometry"
							checked={printControlFlags.includeTonometry}
							onCheckedChange={(checked) =>
								setPrintControlFlags((prev) => ({
									...prev,
									includeTonometry: checked === true,
								}))
							}
							className="data-[state=checked]:bg-slate-800 data-[state=checked]:border-slate-800 border-slate-300"
						/>
						<Label htmlFor="include-tonometry" className="text-[10px] font-semibold text-slate-600 uppercase tracking-tight cursor-pointer hover:text-slate-900 transition-colors">
							Tonométrie
						</Label>
					</div>
				</div>
			</div>

			{/* Form Fields - Sections */}
			<div className="space-y-3">
				{/* Antécédents Group */}
				<div className="flex items-start gap-1.5 xl:gap-2 rounded-lg border border-indigo-200/50 p-1.5 xl:p-2 bg-indigo-50/80 space-y-3">
					<div className="w-12 xl:w-16 shrink-0 flex items-center justify-center pt-1.5">
						<span className="text-[9px] xl:text-[11px] font-bold uppercase tracking-tight text-indigo-500">ANT</span>
					</div>
					<div className="flex-1 min-w-0 space-y-3">
						<div className="flex items-center gap-2">
							<Label className="text-[10px] font-semibold text-indigo-600 uppercase tracking-tight w-12 shrink-0">gén</Label>
							<Textarea
								value={reportData.generalMedicalHistory || ''}
								onChange={handleReportDataChange('generalMedicalHistory')}
								rows={1}
								className="flex-1 min-h-[32px] bg-white border-indigo-200/60 focus:border-indigo-400 focus:ring-indigo-400 text-sm shadow-sm"
							/>
						</div>

						<div className="flex items-center gap-2">
							<Label className="text-[10px] font-semibold text-indigo-600 uppercase tracking-tight w-12 shrink-0">oph</Label>
							<Textarea
								value={reportData.ophthalmologicalHistory || ''}
								onChange={handleReportDataChange('ophthalmologicalHistory')}
								rows={1}
								className="flex-1 min-h-[32px] bg-white border-indigo-200/60 focus:border-indigo-400 focus:ring-indigo-400 text-sm shadow-sm"
							/>
						</div>
					</div>
				</div>

				{/* Inspection */}
				<div className="flex items-center gap-1.5 xl:gap-2 rounded-lg border border-slate-200/50 p-1.5 xl:p-2 bg-slate-50/90">
					<div className="w-12 xl:w-16 shrink-0 flex items-center justify-center">
						<span className="text-[9px] xl:text-[11px] font-bold uppercase tracking-tight text-slate-500">INSP</span>
					</div>
					<div className="flex-1 min-w-0">
						<Textarea
							value={reportData.inspection || ''}
							onChange={handleReportDataChange('inspection')}
							rows={1}
							className="min-h-[32px] bg-white border-slate-200 focus:border-slate-400 focus:ring-slate-400 text-sm shadow-sm"
						/>
					</div>
				</div>

				{/* Acuité Visuelle */}
				{(printControlFlags.includeVisualAcuityWithoutCorrection || printControlFlags.includeVisualAcuityWithCorrection) && (
					<div className="grid grid-cols-1 gap-3">
						{/* Acuité Visuelle Sans Correction */}
						{printControlFlags.includeVisualAcuityWithoutCorrection && (
							<div className="flex items-center gap-1.5 xl:gap-2 rounded-lg border border-emerald-200/50 p-1.5 xl:p-2 bg-emerald-50/80">
								<div className="w-12 xl:w-16 shrink-0 flex items-center justify-center">
									<span className="text-[9px] xl:text-[11px] font-bold uppercase tracking-tight text-emerald-500">AVSC</span>
								</div>
								<div className="flex-1 min-w-0">
									<div className="grid grid-cols-2 gap-2">
										<div className="flex items-center gap-2">
											<Label className="text-[10px] font-semibold text-emerald-700 uppercase tracking-tight w-8 shrink-0">OD</Label>
											<Input
												value={reportData.printVisualAcuityVL_SC_OD || rightEyeData?.visualAcuityVL_SC || ''}
												onChange={handleReportDataChange('printVisualAcuityVL_SC_OD')}
												className="h-7 text-sm font-semibold bg-white border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400 shadow-sm"
											/>
										</div>
										<div className="flex items-center gap-2">
											<Label className="text-[10px] font-semibold text-blue-700 uppercase tracking-tight w-8 shrink-0">OG</Label>
											<Input
												value={reportData.printVisualAcuityVL_SC_OG || leftEyeData?.visualAcuityVL_SC || ''}
												onChange={handleReportDataChange('printVisualAcuityVL_SC_OG')}
												className="h-7 text-sm font-semibold bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400 shadow-sm"
											/>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Acuité Visuelle Avec Correction */}
						{printControlFlags.includeVisualAcuityWithCorrection && (
							<div className="flex items-center gap-1.5 xl:gap-2 rounded-lg border border-emerald-200/50 p-1.5 xl:p-2 bg-emerald-50/80">
								<div className="w-12 xl:w-16 shrink-0 flex items-center justify-center">
									<span className="text-[9px] xl:text-[11px] font-bold uppercase tracking-tight text-emerald-500">AVAC</span>
								</div>
								<div className="flex-1 min-w-0">
									<div className="grid grid-cols-2 gap-2">
										<div className="flex items-center gap-2">
											<Label className="text-[10px] font-semibold text-emerald-700 uppercase tracking-tight w-8 shrink-0">OD</Label>
											<Input
												value={reportData.printVisualAcuityVL_AC_OD || rightEyeData?.visualAcuityVL_AC || ''}
												onChange={handleReportDataChange('printVisualAcuityVL_AC_OD')}
												className="h-7 text-sm font-semibold bg-white border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400 shadow-sm"
											/>
										</div>
										<div className="flex items-center gap-2">
											<Label className="text-[10px] font-semibold text-blue-700 uppercase tracking-tight w-8 shrink-0">OG</Label>
											<Input
												value={reportData.printVisualAcuityVL_AC_OG || leftEyeData?.visualAcuityVL_AC || ''}
												onChange={handleReportDataChange('printVisualAcuityVL_AC_OG')}
												className="h-7 text-sm font-semibold bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400 shadow-sm"
											/>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				)}

				{/* Custom fields - Separate rows */}
				<div className="flex items-center gap-1.5 xl:gap-2 rounded-lg border border-slate-200/50 p-1.5 xl:p-2 bg-slate-50/80">
					<div className="w-12 xl:w-16 shrink-0 flex items-center justify-center">
						<span className="text-[9px] xl:text-[11px] font-bold uppercase tracking-tight text-slate-500">TITRE</span>
					</div>
					<div className="flex-1 min-w-0">
						<Input
							value={reportData.customTitle || ''}
							onChange={handleReportDataChange('customTitle')}
							placeholder="Ex: Test spécifique"
							className="h-7 text-sm bg-white border-slate-200 focus:border-slate-400 focus:ring-slate-400 shadow-sm"
						/>
					</div>
				</div>
				<div className="flex items-center gap-1.5 xl:gap-2 rounded-lg border border-slate-200/50 p-1.5 xl:p-2 bg-slate-50/80">
					<div className="w-12 xl:w-16 shrink-0 flex items-center justify-center">
						<span className="text-[9px] xl:text-[11px] font-bold uppercase tracking-tight text-slate-500">DESC</span>
					</div>
					<div className="flex-1 min-w-0">
						<Input
							value={reportData.customText || ''}
							onChange={handleReportDataChange('customText')}
							placeholder="Détails de l'examen..."
							className="h-7 text-sm bg-white border-slate-200 focus:border-slate-400 focus:ring-slate-400 shadow-sm"
						/>
					</div>
				</div>

				{/* Tonométrie */}
				{printControlFlags.includeTonometry && (
					<div className="flex items-center gap-1.5 xl:gap-2 rounded-lg border border-teal-200/50 p-1.5 xl:p-2 bg-teal-50/80">
						<div className="w-12 xl:w-16 shrink-0 flex items-center justify-center">
							<span className="text-[9px] xl:text-[11px] font-bold uppercase tracking-tight text-teal-500">TONO</span>
						</div>
						<div className="flex-1 min-w-0">
							<div className="grid grid-cols-2 gap-2">
								<div className="flex items-center gap-2">
									<Label className="text-[10px] font-semibold text-teal-700 uppercase tracking-tight w-8 shrink-0">OD</Label>
									<Input
										value={reportData.tonometryOD || getCorrectedIOP('right')}
										onChange={handleReportDataChange('tonometryOD')}
										className="h-7 text-sm font-semibold bg-white border-teal-200/60 focus:border-teal-400 focus:ring-teal-400 shadow-sm"
									/>
								</div>
								<div className="flex items-center gap-2">
									<Label className="text-[10px] font-semibold text-teal-700 uppercase tracking-tight w-8 shrink-0">OG</Label>
									<Input
										value={reportData.tonometryOG || getCorrectedIOP('left')}
										onChange={handleReportDataChange('tonometryOG')}
										className="h-7 text-sm font-semibold bg-white border-teal-200/60 focus:border-teal-400 focus:ring-teal-400 shadow-sm"
									/>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Segment Antérieur - Separate row */}
				<div className="flex items-center gap-1.5 xl:gap-2 rounded-lg border border-blue-200/50 p-1.5 xl:p-2 bg-blue-50/80">
					<div className="w-12 xl:w-16 shrink-0 flex items-center justify-center">
						<span className="text-[9px] xl:text-[11px] font-bold uppercase tracking-tight text-blue-500">SEG ANT</span>
					</div>
					<div className="flex-1 min-w-0">
						<Textarea
							value={reportData.segmentAnterieur || ''}
							onChange={handleReportDataChange('segmentAnterieur')}
							rows={1}
							className="min-h-[32px] bg-white border-blue-200/60 focus:border-blue-400 focus:ring-blue-400 text-sm shadow-sm"
						/>
					</div>
				</div>

				{/* FO - Separate row */}
				<div className="flex items-center gap-1.5 xl:gap-2 rounded-lg border border-purple-200/50 p-1.5 xl:p-2 bg-purple-50/80">
					<div className="w-12 xl:w-16 shrink-0 flex items-center justify-center">
						<span className="text-[9px] xl:text-[11px] font-bold uppercase tracking-tight text-purple-500">FO</span>
					</div>
					<div className="flex-1 min-w-0">
						<Textarea
							value={reportData.fondOeil || ''}
							onChange={handleReportDataChange('fondOeil')}
							rows={1}
							className="min-h-[32px] bg-white border-purple-200/60 focus:border-purple-400 focus:ring-purple-400 text-sm shadow-sm"
						/>
					</div>
				</div>

				{/* Conclusion */}
				<div className="flex items-center gap-1.5 xl:gap-2 rounded-lg border border-emerald-200/50 p-1.5 xl:p-2 bg-emerald-50/80">
					<div className="w-12 xl:w-16 shrink-0 flex items-center justify-center">
						<span className="text-[9px] xl:text-[11px] font-bold uppercase tracking-tight text-emerald-500">CONCL</span>
					</div>
					<div className="flex-1 min-w-0">
						<Textarea
							value={reportData.conclusion || ''}
							onChange={handleReportDataChange('conclusion')}
							rows={2}
							className="min-h-[50px] bg-white border-emerald-200/60 focus:border-emerald-400 focus:ring-emerald-400 text-sm shadow-sm"
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default memo(ReportDocument);
