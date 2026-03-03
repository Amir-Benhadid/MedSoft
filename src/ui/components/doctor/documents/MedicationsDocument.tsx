import React, { memo } from 'react';
import { PDFDocument, PDFPage, rgb } from 'pdf-lib';
import CompactPrescriptionForm from './components/CompactPrescriptionForm';
import { PrescriptionData } from './types';
import { PdfGenerationContext, drawTitle, drawDocumentHeader } from './PdfUtils';
import { DocumentUtils } from './DocumentUtils';
import { usePrescriptionDataSync } from './usePrescriptionDataSync';
import { useDocumentForm } from './hooks/useDocumentForm';

interface MedicationsDocumentProps {}

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


// PDF Generation Function
export const generateMedicationsPDF = async (
	context: any,
	patient: { surname: string; name: string; dob: string },
	prescriptionData?: PrescriptionData
): Promise<Uint8Array> => {
	const { page, width, helvetica, helveticaBold, LEFT_MARGIN, RIGHT_MARGIN, TEXT_SIZES, LINE_HEIGHTS } = context;

	let y = drawTitle(context, 'ORDONNANCE', drawDocumentHeader(context, patient, DocumentUtils.calculateAge));

	if (prescriptionData?.treatments?.length) {
		// Filter out treatments with empty names
		const validTreatments = prescriptionData.treatments.filter(treatment =>
			!DocumentUtils.isEmptyField(treatment.name) || !DocumentUtils.isEmptyField(treatment.customName)
		);

		if (validTreatments.length > 0) {
			// Calculate column positions for available data
			const usableWidth = width - LEFT_MARGIN - RIGHT_MARGIN;

			// Draw treatments
			validTreatments.forEach((treatment, index) => {
				// First line: name (left) | type (middle) | packaging (right)
				const medicationName = treatment.name || treatment.customName || '';

				// Left: Medicine name with strength
				const nameWithStrength = !DocumentUtils.isEmptyField(treatment.strength)
					? `${DocumentUtils.toTitleCase(medicationName)} - ${treatment.strength}`
					: DocumentUtils.toTitleCase(medicationName);

				page.drawText(`${index + 1}. ${nameWithStrength}`, {
					x: LEFT_MARGIN,
					y,
					size: TEXT_SIZES.normal == 10 ? 10 : TEXT_SIZES.normal - 1,
					font: helvetica,
					color: rgb(0, 0, 0),
				});

				// Middle: Type (only show if not empty)
				if (!DocumentUtils.isEmptyField(treatment.type)) {
					page.drawText(treatment.type!, {
						x: LEFT_MARGIN + 170, // Fixed position for better visibility
						y,
						size: TEXT_SIZES.normal == 10 ? 10 : TEXT_SIZES.normal - 1,
						font: helvetica,
						color: rgb(0, 0, 0),
					});
				}

				// Right: Packaging (only show if not empty)
				if (!DocumentUtils.isEmptyField(treatment.packaging)) {
					page.drawText(treatment.packaging!, {
						x: LEFT_MARGIN + 270, // Fixed position for better visibility
						y,
						size: TEXT_SIZES.normal == 10 ? 10 : TEXT_SIZES.normal - 1,
						font: helvetica,
						color: rgb(0, 0, 0),
					});
				}
				y -= LINE_HEIGHTS.normal;

				// Second line: Instructions (only show if not empty)
				const instructions = treatment.instructions || '';
				if (!DocumentUtils.isEmptyField(instructions)) {
					// Draw instructions, splitting into multiple lines if needed
					const instructionMaxWidth = width - LEFT_MARGIN - RIGHT_MARGIN - 20; // 20 for indentation
					const instructionLines = DocumentUtils.splitTextIntoLinesOptimized(
						instructions,
						instructionMaxWidth
					);

					instructionLines.forEach((line: string, lineIndex: number) => {
						page.drawText(line, {
							x: LEFT_MARGIN + 20, // Indent slightly for sub-item
							y: y - lineIndex * LINE_HEIGHTS.small, // Move down for each line
							size: TEXT_SIZES.normal == 10 ? 10 : TEXT_SIZES.normal - 1,
							font: helvetica,
							color: rgb(0, 0, 0),
						});
					});

					// Adjust y position based on number of instruction lines
					y -= instructionLines.length * LINE_HEIGHTS.small;
				}

				y -= 10; // Space between medications
			});
		}
	}

	const pdfBytes = await context.pdfDoc.save();
	return pdfBytes;
};

// UI Component
const MedicationsDocument: React.FC<MedicationsDocumentProps> = () => {
	// Get form data from hook
	const {
		prescriptionData,
		setPrescriptionData,
		printPrescriptionData: printData,
		setPrintPrescriptionData: setPrintData,
	} = useDocumentForm();

	// Use custom hook for smooth, optimized data synchronization
	const { handlePrescriptionDataChange } = usePrescriptionDataSync({
		prescriptionData,
		setPrescriptionData,
		printData,
		setPrintData,
	});

	return (
		<CompactPrescriptionForm
			prescriptionData={printData}
			setPrescriptionData={handlePrescriptionDataChange}
		/>
	);
};

export default memo(MedicationsDocument);
