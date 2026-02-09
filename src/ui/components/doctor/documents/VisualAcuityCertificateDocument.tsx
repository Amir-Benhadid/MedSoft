import React, { memo } from 'react';
import { useDocumentForm } from './hooks/useDocumentForm';
import { PDFDocument, PDFPage, rgb } from 'pdf-lib';

import { Checkbox } from '@/ui/components/ui/checkbox';
import { Input } from '@/ui/components/ui/input';
import { Label } from '@/ui/components/ui/label';
import { PdfGenerationContext, drawTitle, drawDocumentHeader } from './PdfUtils';
import { DocumentUtils } from './DocumentUtils';
import { cn } from '@/ui/lib/utils';

// Types
interface EyeData {
	visualAcuityVL_SC?: string;
	visualAcuity?: string;
	visualAcuityVL_AC?: string;
}

interface PrintControlFlags {
	includeVisualAcuityWithoutCorrection: boolean;
	includeVisualAcuityWithCorrection: boolean;
	includeGlassType: boolean;
}

interface VisualAcuityPrintData {
	visualAcuityVL_SC_OD: string;
	visualAcuityVL_SC_OG: string;
	visualAcuityVL_AC_OD: string;
	visualAcuityVL_AC_OG: string;
}

interface VisualAcuityCertificateDocumentProps {}

// PDF Generation Constants
const LEFT_MARGIN = 50;
const RIGHT_MARGIN = 50;
const TEXT_SIZES = {
	title: 16,
	sectionHeader: 12,
	normal: 11,
	small: 8,
};
const LINE_HEIGHTS = {
	title: 20,
	sectionHeader: 16,
	normal: 15,
	small: 12,
	header: 18,
};

// PDF Generation Function
export const generateVisualAcuityCertificatePDF = async (
	context: PdfGenerationContext,
	patient: { surname: string; name: string; dob: string },
	printData?: VisualAcuityPrintData,
	printControlFlags?: {
		includeVisualAcuityWithoutCorrection?: boolean;
		includeVisualAcuityWithCorrection?: boolean;
	}
): Promise<Uint8Array> => {
	const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;

	let y = drawTitle(context, "CERTIFICAT D'ACUITÉ VISUELLE", drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

	const mainStatementText = 'Je certifie que le(a) patient(e) sus-nommé(e) présente:';
	const mainStatementWidth = width - LEFT_MARGIN - RIGHT_MARGIN + 20;
	const mainStatementLines = DocumentUtils.splitTextIntoLinesOptimized(
		mainStatementText,
		mainStatementWidth
	);

	mainStatementLines.forEach((line) => {
		page.drawText(line, {
			x: LEFT_MARGIN + 20,
			y,
			size: TEXT_SIZES.normal,
			font: helvetica,
			color: rgb(0, 0, 0), // Black text
		});
		y -= LINE_HEIGHTS.normal;
	});
	y -= 25;

	// Calculate positions for equal distribution
	const leftIndent = LEFT_MARGIN + 20;
	const usableWidth = width - leftIndent - RIGHT_MARGIN;

	// Acuité visuelle sans correction (conditional)
	if (printControlFlags?.includeVisualAcuityWithoutCorrection !== false) {
		const odValue = DocumentUtils.formatFieldDisplay(printData?.visualAcuityVL_SC_OD);
		const ogValue = DocumentUtils.formatFieldDisplay(printData?.visualAcuityVL_SC_OG);

		// Only show section if at least one eye has data
		if (!DocumentUtils.isEmptyField(odValue) || !DocumentUtils.isEmptyField(ogValue)) {
			page.drawText('Acuité visuelle sans correction:', {
				x: LEFT_MARGIN + 20,
				y,
				size: TEXT_SIZES.sectionHeader,
				font: helveticaBold,
				color: rgb(0, 0, 0),
			});
			y -= 1.8 * LINE_HEIGHTS.normal;

			// Calculate column positions for available data
			const visibleColumns: string[] = [];
			if (!DocumentUtils.isEmptyField(odValue)) visibleColumns.push('OD');
			if (!DocumentUtils.isEmptyField(ogValue)) visibleColumns.push('OG');

			const columnWidth = visibleColumns.length > 0 ? usableWidth / visibleColumns.length : usableWidth;
			let currentX = leftIndent;

			if (!DocumentUtils.isEmptyField(odValue)) {
				page.drawText(`OD: ${odValue}`, {
					x: currentX,
					y,
					size: TEXT_SIZES.normal,
					font: helvetica,
					color: rgb(0, 0, 0),
				});
				currentX += columnWidth;
			}

			if (!DocumentUtils.isEmptyField(ogValue)) {
				page.drawText(`OG: ${ogValue}`, {
					x: currentX,
					y,
					size: TEXT_SIZES.normal,
					font: helvetica,
					color: rgb(0, 0, 0),
				});
			}
			y -= 2 * LINE_HEIGHTS.header;
		}
	}

	// Acuité visuelle avec correction (conditional)
	if (printControlFlags?.includeVisualAcuityWithCorrection !== false) {
		const odValue = DocumentUtils.formatFieldDisplay(printData?.visualAcuityVL_AC_OD);
		const ogValue = DocumentUtils.formatFieldDisplay(printData?.visualAcuityVL_AC_OG);

		// Only show section if at least one eye has data
		if (!DocumentUtils.isEmptyField(odValue) || !DocumentUtils.isEmptyField(ogValue)) {
			page.drawText('Acuité visuelle avec correction:', {
				x: LEFT_MARGIN + 20,
				y,
				size: TEXT_SIZES.sectionHeader,
				font: helveticaBold,
				color: rgb(0, 0, 0),
			});
			y -= 1.8 * LINE_HEIGHTS.normal;

			// Calculate column positions for available data
			const visibleColumns: string[] = [];
			if (!DocumentUtils.isEmptyField(odValue)) visibleColumns.push('OD');
			if (!DocumentUtils.isEmptyField(ogValue)) visibleColumns.push('OG');

			const columnWidth = visibleColumns.length > 0 ? usableWidth / visibleColumns.length : usableWidth;
			let currentX = leftIndent;

			if (!DocumentUtils.isEmptyField(odValue)) {
				page.drawText(`OD: ${odValue}`, {
					x: currentX,
					y,
					size: TEXT_SIZES.normal,
					font: helvetica,
					color: rgb(0, 0, 0),
				});
				currentX += columnWidth;
			}

			if (!DocumentUtils.isEmptyField(ogValue)) {
				page.drawText(`OG: ${ogValue}`, {
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

	const pdfBytes = await context.pdfDoc.save();
	return pdfBytes;
};

// UI Component
const VisualAcuityCertificateDocument: React.FC<VisualAcuityCertificateDocumentProps> = () => {
	// Get form data from hook
	const {
		rightEyeData,
		leftEyeData,
		printControlFlags,
		setPrintControlFlags,
		printVisualAcuityData: printData,
		setPrintVisualAcuityData: setPrintData,
	} = useDocumentForm();
	// Handler for print data changes
	const handlePrintDataChange = (field: keyof VisualAcuityPrintData) => (value: string) => {
		setPrintData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	// Update print data when eye data changes
	React.useEffect(() => {
		setPrintData((prev) => {
			const newData = {
				visualAcuityVL_SC_OD: rightEyeData?.visualAcuityVL_SC || rightEyeData?.visualAcuity || '',
				visualAcuityVL_SC_OG: leftEyeData?.visualAcuityVL_SC || leftEyeData?.visualAcuity || '',
				visualAcuityVL_AC_OD: rightEyeData?.visualAcuityVL_AC || '',
				visualAcuityVL_AC_OG: leftEyeData?.visualAcuityVL_AC || '',
			};

			// Only update if values actually changed
			if (JSON.stringify(prev) === JSON.stringify(newData)) {
				return prev;
			}
			return newData;
		});
	}, [rightEyeData, leftEyeData]);

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
				</div>
			</div>

			{/* Visual acuity fields */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				{/* Right Eye (OD) */}
				<div className="bg-blue-500/10 rounded-xl p-2.5 border-2 border-blue-300/50 shadow-sm hover:shadow-md transition-all space-y-3">
					<div className="px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2" style={{
						background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
						boxShadow: '0 4px 12px -2px rgba(59, 130, 246, 0.3)'
					}}>
						<h4 className="text-xs font-extrabold text-white uppercase tracking-tight">
							OD
						</h4>
					</div>
					<div className="space-y-2">
						{printControlFlags.includeVisualAcuityWithoutCorrection && (
							<div className="space-y-1">
								<Label htmlFor="va-sc-od" className="text-[10px] font-semibold text-blue-700 uppercase tracking-tight block">Sans correction</Label>
								<Input
									id="va-sc-od"
									value={printData.visualAcuityVL_SC_OD}
									onChange={(e) => handlePrintDataChange('visualAcuityVL_SC_OD')(e.target.value)}
									className="h-7 text-sm font-semibold text-foreground bg-background border-blue-300/50 focus:border-blue-500 focus:ring-blue-200/50"
								/>
							</div>
						)}
						{printControlFlags.includeVisualAcuityWithCorrection && (
							<div className="space-y-1">
								<Label htmlFor="va-ac-od" className="text-[10px] font-semibold text-blue-700 uppercase tracking-tight block">Avec correction</Label>
								<Input
									id="va-ac-od"
									value={printData.visualAcuityVL_AC_OD}
									onChange={(e) => handlePrintDataChange('visualAcuityVL_AC_OD')(e.target.value)}
									className="h-7 text-sm font-semibold text-foreground bg-background border-blue-300/50 focus:border-blue-500 focus:ring-blue-200/50"
								/>
							</div>
						)}
					</div>
				</div>

				{/* Left Eye (OG) */}
				<div className="bg-green-500/10 rounded-xl p-2.5 border-2 border-green-300/50 shadow-sm hover:shadow-md transition-all space-y-3">
					<div className="px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2" style={{
						background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
						boxShadow: '0 4px 12px -2px rgba(16, 185, 129, 0.3)'
					}}>
						<h4 className="text-xs font-extrabold text-white uppercase tracking-tight">
							OG
						</h4>
					</div>
					<div className="space-y-2">
						{printControlFlags.includeVisualAcuityWithoutCorrection && (
							<div className="space-y-1">
								<Label htmlFor="va-sc-og" className="text-[10px] font-semibold text-green-700 uppercase tracking-tight block">Sans correction</Label>
								<Input
									id="va-sc-og"
									value={printData.visualAcuityVL_SC_OG}
									onChange={(e) => handlePrintDataChange('visualAcuityVL_SC_OG')(e.target.value)}
									className="h-7 text-sm font-semibold text-foreground bg-background border-green-300/50 focus:border-green-500 focus:ring-green-200/50"
								/>
							</div>
						)}
						{printControlFlags.includeVisualAcuityWithCorrection && (
							<div className="space-y-1">
								<Label htmlFor="va-ac-og" className="text-[10px] font-semibold text-green-700 uppercase tracking-tight block">Avec correction</Label>
								<Input
									id="va-ac-og"
									value={printData.visualAcuityVL_AC_OG}
									onChange={(e) => handlePrintDataChange('visualAcuityVL_AC_OG')(e.target.value)}
									className="h-7 text-sm font-semibold text-foreground bg-background border-green-300/50 focus:border-green-500 focus:ring-green-200/50"
								/>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default memo(VisualAcuityCertificateDocument);
